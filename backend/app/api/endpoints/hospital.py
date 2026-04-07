from datetime import date
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.audit import add_audit_log, add_notification
from app.core.config import settings
from app.core.deps import get_db, require_roles
from app.models import (
    Account,
    Appointment,
    AppointmentStatusEnum,
    Bill,
    Doctor,
    DoctorSlot,
    HospitalProfile,
    MedicalCondition,
    OnboardingStatusEnum,
    PatientProfile,
    PaymentStatusEnum,
    Prescription,
    Report,
    RoleEnum,
    SlotStatusEnum,
    Specialty,
)
from app.schemas.appointment import (
    AppointmentStatusUpdate,
    BillCreate,
    PrescriptionCreate,
    ReportCreate,
)
from app.schemas.doctor import DoctorCreate, DoctorUpdate, SlotBulkCreate


router = APIRouter(prefix="/hospital", tags=["Hospital"])


def _hospital_profile_or_404(db: Session, account_id: int) -> HospitalProfile:
    profile = db.get(HospitalProfile, account_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital profile not found")
    return profile


def _require_approved_hospital(profile: HospitalProfile) -> None:
    if profile.onboarding_status != OnboardingStatusEnum.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hospital onboarding is not approved by admin",
        )


def _appointment_for_hospital(db: Session, appointment_id: int, hospital_id: int) -> Appointment:
    appointment = db.scalar(
        select(Appointment)
        .where(Appointment.appointment_id == appointment_id, Appointment.hospital_id == hospital_id)
        .limit(1)
    )
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment


@router.get("/profile")
def my_hospital_profile(
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    from app.models import Locality as LocalityModel
    profile = _hospital_profile_or_404(db, current_account.account_id)
    locality = db.get(LocalityModel, profile.locality_id)
    return {
        "hospital_id": profile.hospital_id,
        "hospital_name": profile.hospital_name,
        "registration_no": profile.registration_no,
        "locality_id": profile.locality_id,
        "locality_name": locality.name if locality else None,
        "city": locality.city if locality else None,
        "contact_phone": profile.contact_phone,
        "email": current_account.email,
        "onboarding_status": profile.onboarding_status.value if hasattr(profile.onboarding_status, "value") else profile.onboarding_status,
    }


@router.get("/doctors")
def list_my_doctors(
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    _hospital_profile_or_404(db, current_account.account_id)

    rows = db.execute(
        select(Doctor, Specialty.name.label("specialty_name"))
        .join(Specialty, Specialty.specialty_id == Doctor.specialty_id)
        .where(Doctor.hospital_id == current_account.account_id)
        .order_by(Doctor.full_name)
    ).all()

    return [
        {
            "doctor_id": row.Doctor.doctor_id,
            "full_name": row.Doctor.full_name,
            "specialty_id": row.Doctor.specialty_id,
            "specialty_name": row.specialty_name,
            "experience_years": row.Doctor.experience_years,
            "consultation_fee": float(row.Doctor.consultation_fee),
            "is_active": row.Doctor.is_active,
        }
        for row in rows
    ]


@router.post("/doctors", status_code=status.HTTP_201_CREATED)
def create_doctor(
    payload: DoctorCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    if db.get(Specialty, payload.specialty_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")

    doctor = Doctor(
        hospital_id=current_account.account_id,
        specialty_id=payload.specialty_id,
        full_name=payload.full_name,
        experience_years=payload.experience_years,
        consultation_fee=payload.consultation_fee,
        is_active=payload.is_active,
    )
    db.add(doctor)
    db.flush()

    add_audit_log(
        db,
        action="CREATE_DOCTOR",
        entity_name="doctors",
        actor_account_id=current_account.account_id,
        entity_id=doctor.doctor_id,
        ip_address=request.client.host if request.client else None,
    )

    db.commit()
    return {
        "doctor_id": doctor.doctor_id,
        "full_name": doctor.full_name,
        "specialty_id": doctor.specialty_id,
        "experience_years": doctor.experience_years,
        "consultation_fee": float(doctor.consultation_fee),
        "is_active": doctor.is_active,
    }


@router.patch("/doctors/{doctor_id}")
def update_doctor(
    doctor_id: int,
    payload: DoctorUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    doctor = db.scalar(
        select(Doctor)
        .where(Doctor.doctor_id == doctor_id, Doctor.hospital_id == current_account.account_id)
        .limit(1)
    )
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    updates = payload.model_dump(exclude_unset=True)
    if "specialty_id" in updates and db.get(Specialty, updates["specialty_id"]) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")

    for key, value in updates.items():
        setattr(doctor, key, value)

    add_audit_log(
        db,
        action="UPDATE_DOCTOR",
        entity_name="doctors",
        actor_account_id=current_account.account_id,
        entity_id=doctor.doctor_id,
        ip_address=request.client.host if request.client else None,
    )

    db.commit()
    return {"message": "Doctor updated"}


@router.post("/doctors/{doctor_id}/slots", status_code=status.HTTP_201_CREATED)
def create_doctor_slots(
    doctor_id: int,
    payload: SlotBulkCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    doctor = db.scalar(
        select(Doctor)
        .where(Doctor.doctor_id == doctor_id, Doctor.hospital_id == current_account.account_id)
        .limit(1)
    )
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    created_slots = 0
    skipped_slots = 0

    for item in payload.slots:
        if item.end_time <= item.start_time:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End time must be after start time")
        if item.slot_date < date.today():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot create slots in the past")

        exists = db.scalar(
            select(DoctorSlot.slot_id)
            .where(
                DoctorSlot.doctor_id == doctor_id,
                DoctorSlot.slot_date == item.slot_date,
                DoctorSlot.start_time == item.start_time,
            )
            .limit(1)
        )
        if exists:
            skipped_slots += 1
            continue

        db.add(
            DoctorSlot(
                doctor_id=doctor_id,
                slot_date=item.slot_date,
                start_time=item.start_time,
                end_time=item.end_time,
                slot_status=SlotStatusEnum.AVAILABLE,
            )
        )
        created_slots += 1

    add_audit_log(
        db,
        action="CREATE_SLOTS",
        entity_name="doctor_slots",
        actor_account_id=current_account.account_id,
        entity_id=doctor_id,
        ip_address=request.client.host if request.client else None,
    )

    db.commit()
    return {"created_slots": created_slots, "skipped_slots": skipped_slots}


@router.get("/slots")
def list_hospital_slots(
    doctor_id: int | None = Query(default=None),
    slot_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    _hospital_profile_or_404(db, current_account.account_id)

    query = (
        select(DoctorSlot, Doctor.full_name.label("doctor_name"))
        .join(Doctor, Doctor.doctor_id == DoctorSlot.doctor_id)
        .where(Doctor.hospital_id == current_account.account_id)
        .order_by(DoctorSlot.slot_date, DoctorSlot.start_time)
    )
    if doctor_id is not None:
        query = query.where(DoctorSlot.doctor_id == doctor_id)
    if slot_date is not None:
        query = query.where(DoctorSlot.slot_date == slot_date)

    rows = db.execute(query).all()
    return [
        {
            "slot_id": row.DoctorSlot.slot_id,
            "doctor_id": row.DoctorSlot.doctor_id,
            "doctor_name": row.doctor_name,
            "slot_date": str(row.DoctorSlot.slot_date),
            "start_time": str(row.DoctorSlot.start_time),
            "end_time": str(row.DoctorSlot.end_time),
            "slot_status": row.DoctorSlot.slot_status,
        }
        for row in rows
    ]


@router.delete("/slots/{slot_id}", status_code=status.HTTP_200_OK)
def delete_slot(
    slot_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    slot = db.scalar(
        select(DoctorSlot)
        .join(Doctor, Doctor.doctor_id == DoctorSlot.doctor_id)
        .where(
            DoctorSlot.slot_id == slot_id,
            Doctor.hospital_id == current_account.account_id,
        )
        .limit(1)
    )
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    if slot.slot_status == SlotStatusEnum.BOOKED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a slot that is already booked",
        )

    add_audit_log(
        db,
        action="DELETE_SLOT",
        entity_name="doctor_slots",
        actor_account_id=current_account.account_id,
        entity_id=slot_id,
        ip_address=request.client.host if request.client else None,
    )
    db.delete(slot)
    db.commit()
    return {"message": "Slot deleted"}


@router.get("/appointments")
def list_hospital_appointments(
    status_filter: AppointmentStatusEnum | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    _hospital_profile_or_404(db, current_account.account_id)

    query = (
        select(
            Appointment,
            PatientProfile.full_name.label("patient_name"),
            Doctor.full_name.label("doctor_name"),
            MedicalCondition.name.label("condition_name"),
            DoctorSlot.slot_date,
            DoctorSlot.start_time,
            DoctorSlot.end_time,
        )
        .join(PatientProfile, PatientProfile.patient_id == Appointment.patient_id)
        .join(Doctor, Doctor.doctor_id == Appointment.doctor_id)
        .join(MedicalCondition, MedicalCondition.condition_id == Appointment.condition_id)
        .join(DoctorSlot, DoctorSlot.slot_id == Appointment.slot_id)
        .where(Appointment.hospital_id == current_account.account_id)
        .order_by(Appointment.created_at.desc())
    )
    if status_filter:
        query = query.where(Appointment.appointment_status == status_filter)

    rows = db.execute(query).all()

    return [
        {
            "appointment_id": row.Appointment.appointment_id,
            "patient_id": row.Appointment.patient_id,
            "patient_name": row.patient_name,
            "doctor_id": row.Appointment.doctor_id,
            "doctor_name": row.doctor_name,
            "condition": row.condition_name,
            "appointment_status": row.Appointment.appointment_status,
            "slot_date": row.slot_date,
            "start_time": row.start_time,
            "end_time": row.end_time,
        }
        for row in rows
    ]


@router.patch("/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    appointment = _appointment_for_hospital(db, appointment_id, current_account.account_id)
    appointment.appointment_status = payload.appointment_status

    slot = db.get(DoctorSlot, appointment.slot_id)
    if slot:
        if payload.appointment_status == AppointmentStatusEnum.COMPLETED:
            slot.slot_status = SlotStatusEnum.COMPLETED
        elif payload.appointment_status in {AppointmentStatusEnum.CANCELLED, AppointmentStatusEnum.NO_SHOW}:
            slot.slot_status = SlotStatusEnum.AVAILABLE

    add_audit_log(
        db,
        action="UPDATE_APPOINTMENT_STATUS",
        entity_name="appointments",
        actor_account_id=current_account.account_id,
        entity_id=appointment.appointment_id,
        ip_address=request.client.host if request.client else None,
    )
    add_notification(
        db,
        account_id=appointment.patient_id,
        message=(
            f"Appointment #{appointment.appointment_id} status updated to "
            f"{payload.appointment_status.value}"
        ),
    )

    db.commit()
    return {"message": "Appointment status updated"}


@router.post("/appointments/{appointment_id}/prescriptions", status_code=status.HTTP_201_CREATED)
def create_prescription(
    appointment_id: int,
    payload: PrescriptionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    appointment = _appointment_for_hospital(db, appointment_id, current_account.account_id)

    prescription = Prescription(
        appointment_id=appointment.appointment_id,
        doctor_id=appointment.doctor_id,
        diagnosis=payload.diagnosis,
        advice=payload.advice,
        file_url=payload.file_url,
    )
    db.add(prescription)
    db.flush()

    add_audit_log(
        db,
        action="CREATE_PRESCRIPTION",
        entity_name="prescriptions",
        actor_account_id=current_account.account_id,
        entity_id=prescription.prescription_id,
        ip_address=request.client.host if request.client else None,
    )
    add_notification(
        db,
        account_id=appointment.patient_id,
        message=f"Prescription added for appointment #{appointment.appointment_id}",
    )

    db.commit()
    return {"prescription_id": prescription.prescription_id}


@router.post("/appointments/{appointment_id}/bills", status_code=status.HTTP_201_CREATED)
def create_bill(
    appointment_id: int,
    payload: BillCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    appointment = _appointment_for_hospital(db, appointment_id, current_account.account_id)

    bill = Bill(
        appointment_id=appointment.appointment_id,
        patient_id=appointment.patient_id,
        hospital_id=current_account.account_id,
        total_amount=payload.total_amount,
        payment_status=payload.payment_status or PaymentStatusEnum.UNPAID,
    )
    db.add(bill)
    db.flush()

    add_audit_log(
        db,
        action="CREATE_BILL",
        entity_name="bills",
        actor_account_id=current_account.account_id,
        entity_id=bill.bill_id,
        ip_address=request.client.host if request.client else None,
    )
    add_notification(
        db,
        account_id=appointment.patient_id,
        message=f"Bill generated for appointment #{appointment.appointment_id}",
    )

    db.commit()
    return {"bill_id": bill.bill_id}


@router.post("/appointments/{appointment_id}/reports", status_code=status.HTTP_201_CREATED)
def create_report(
    appointment_id: int,
    payload: ReportCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    appointment = _appointment_for_hospital(db, appointment_id, current_account.account_id)

    report = Report(
        appointment_id=appointment.appointment_id,
        patient_id=appointment.patient_id,
        hospital_id=current_account.account_id,
        report_type=payload.report_type,
        file_url=payload.file_url,
    )
    db.add(report)
    db.flush()

    add_audit_log(
        db,
        action="CREATE_REPORT",
        entity_name="reports",
        actor_account_id=current_account.account_id,
        entity_id=report.report_id,
        ip_address=request.client.host if request.client else None,
    )
    add_notification(
        db,
        account_id=appointment.patient_id,
        message=f"Report uploaded for appointment #{appointment.appointment_id}",
    )

    db.commit()
    return {"report_id": report.report_id}


@router.post("/uploads")
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.HOSPITAL)),
):
    profile = _hospital_profile_or_404(db, current_account.account_id)
    _require_approved_hospital(profile)

    allowed_types = {"prescription", "report", "other"}
    if document_type.lower() not in allowed_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid document type")

    extension = Path(file.filename or "").suffix.lower()
    if extension not in {".pdf", ".png", ".jpg", ".jpeg"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds max upload size")

    target_dir = settings.uploads_dir / document_type.lower()
    target_dir.mkdir(parents=True, exist_ok=True)

    file_name = f"{uuid4().hex}{extension}"
    target_path = target_dir / file_name
    target_path.write_bytes(content)

    relative_url = f"/uploads/{document_type.lower()}/{file_name}"

    add_audit_log(
        db,
        action="UPLOAD_DOCUMENT",
        entity_name="uploads",
        actor_account_id=current_account.account_id,
        entity_id=None,
        ip_address=None,
    )
    db.commit()

    return {"file_url": relative_url}
