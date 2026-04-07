from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.audit import add_audit_log, add_notification
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
    Notification,
    OnboardingStatusEnum,
    PatientProfile,
    Prescription,
    Report,
    RoleEnum,
    SlotStatusEnum,
)
from app.schemas.appointment import AppointmentCreate


router = APIRouter(prefix="/patient", tags=["Patient"])


def _patient_profile_or_404(db: Session, account_id: int) -> PatientProfile:
    profile = db.get(PatientProfile, account_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")
    return profile


@router.post("/appointments", status_code=status.HTTP_201_CREATED)
def book_appointment(
    payload: AppointmentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.PATIENT)),
):
    patient = _patient_profile_or_404(db, current_account.account_id)

    doctor = db.get(Doctor, payload.doctor_id)
    if doctor is None or not doctor.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    hospital = db.get(HospitalProfile, doctor.hospital_id)
    hospital_account = db.get(Account, doctor.hospital_id)
    if (
        hospital is None
        or hospital_account is None
        or not hospital_account.is_active
        or hospital.onboarding_status != OnboardingStatusEnum.APPROVED
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hospital not available for booking")

    condition = db.get(MedicalCondition, payload.condition_id)
    if condition is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical condition not found")

    slot = db.get(DoctorSlot, payload.slot_id)
    if slot is None or slot.doctor_id != doctor.doctor_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid slot selection")

    if slot.slot_status != SlotStatusEnum.AVAILABLE:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Selected slot is not available")

    if slot.slot_date < date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book past slots")

    appointment = Appointment(
        patient_id=patient.patient_id,
        hospital_id=doctor.hospital_id,
        doctor_id=doctor.doctor_id,
        slot_id=slot.slot_id,
        condition_id=condition.condition_id,
        appointment_status=AppointmentStatusEnum.BOOKED,
    )

    slot.slot_status = SlotStatusEnum.BOOKED
    db.add(appointment)
    db.flush()

    add_audit_log(
        db,
        action="BOOK_APPOINTMENT",
        entity_name="appointments",
        actor_account_id=current_account.account_id,
        entity_id=appointment.appointment_id,
        ip_address=request.client.host if request.client else None,
    )
    add_notification(
        db,
        account_id=current_account.account_id,
        message=f"Appointment #{appointment.appointment_id} booked with Dr. {doctor.full_name}",
    )
    add_notification(
        db,
        account_id=doctor.hospital_id,
        message=f"New appointment #{appointment.appointment_id} booked by patient #{patient.patient_id}",
    )

    db.commit()

    return {
        "appointment_id": appointment.appointment_id,
        "appointment_status": appointment.appointment_status,
        "doctor_name": doctor.full_name,
        "hospital_name": hospital.hospital_name,
        "condition": condition.name,
        "slot_date": slot.slot_date,
        "start_time": slot.start_time,
        "end_time": slot.end_time,
    }


@router.get("/appointments")
def list_my_appointments(
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.PATIENT)),
):
    patient = _patient_profile_or_404(db, current_account.account_id)

    rows = db.execute(
        select(
            Appointment,
            Doctor.full_name.label("doctor_name"),
            HospitalProfile.hospital_name.label("hospital_name"),
            MedicalCondition.name.label("condition_name"),
            DoctorSlot.slot_date,
            DoctorSlot.start_time,
            DoctorSlot.end_time,
        )
        .join(Doctor, Doctor.doctor_id == Appointment.doctor_id)
        .join(HospitalProfile, HospitalProfile.hospital_id == Appointment.hospital_id)
        .join(MedicalCondition, MedicalCondition.condition_id == Appointment.condition_id)
        .join(DoctorSlot, DoctorSlot.slot_id == Appointment.slot_id)
        .where(Appointment.patient_id == patient.patient_id)
        .order_by(Appointment.created_at.desc())
    ).all()

    return [
        {
            "appointment_id": row.Appointment.appointment_id,
            "appointment_status": row.Appointment.appointment_status,
            "doctor_name": row.doctor_name,
            "hospital_name": row.hospital_name,
            "condition": row.condition_name,
            "slot_date": row.slot_date,
            "start_time": row.start_time,
            "end_time": row.end_time,
        }
        for row in rows
    ]


@router.patch("/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.PATIENT)),
):
    _patient_profile_or_404(db, current_account.account_id)

    appointment = db.scalar(
        select(Appointment)
        .where(Appointment.appointment_id == appointment_id, Appointment.patient_id == current_account.account_id)
        .limit(1)
    )
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if appointment.appointment_status not in {AppointmentStatusEnum.BOOKED, AppointmentStatusEnum.CONFIRMED}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Appointment cannot be cancelled")

    appointment.appointment_status = AppointmentStatusEnum.CANCELLED
    slot = db.get(DoctorSlot, appointment.slot_id)
    if slot and slot.slot_status == SlotStatusEnum.BOOKED:
        slot.slot_status = SlotStatusEnum.AVAILABLE

    add_audit_log(
        db,
        action="CANCEL_APPOINTMENT",
        entity_name="appointments",
        actor_account_id=current_account.account_id,
        entity_id=appointment.appointment_id,
        ip_address=request.client.host if request.client else None,
    )
    add_notification(
        db,
        account_id=appointment.hospital_id,
        message=f"Appointment #{appointment.appointment_id} was cancelled by patient",
    )

    db.commit()
    return {"message": "Appointment cancelled", "appointment_id": appointment.appointment_id}


@router.get("/documents")
def my_documents(
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.PATIENT)),
):
    patient = _patient_profile_or_404(db, current_account.account_id)

    prescriptions = db.execute(
        select(Prescription, Doctor.full_name.label("doctor_name"))
        .join(Appointment, Appointment.appointment_id == Prescription.appointment_id)
        .join(Doctor, Doctor.doctor_id == Prescription.doctor_id)
        .where(Appointment.patient_id == patient.patient_id)
        .order_by(Prescription.issued_at.desc())
    ).all()

    bills = db.execute(
        select(Bill).where(Bill.patient_id == patient.patient_id).order_by(Bill.generated_at.desc())
    ).scalars().all()

    reports = db.execute(
        select(Report).where(Report.patient_id == patient.patient_id).order_by(Report.uploaded_at.desc())
    ).scalars().all()

    return {
        "prescriptions": [
            {
                "prescription_id": row.Prescription.prescription_id,
                "appointment_id": row.Prescription.appointment_id,
                "doctor_name": row.doctor_name,
                "diagnosis": row.Prescription.diagnosis,
                "advice": row.Prescription.advice,
                "file_url": row.Prescription.file_url,
                "issued_at": row.Prescription.issued_at,
            }
            for row in prescriptions
        ],
        "bills": [
            {
                "bill_id": bill.bill_id,
                "appointment_id": bill.appointment_id,
                "total_amount": float(bill.total_amount),
                "payment_status": bill.payment_status,
                "generated_at": bill.generated_at,
            }
            for bill in bills
        ],
        "reports": [
            {
                "report_id": report.report_id,
                "appointment_id": report.appointment_id,
                "report_type": report.report_type,
                "file_url": report.file_url,
                "uploaded_at": report.uploaded_at,
            }
            for report in reports
        ],
    }


@router.get("/notifications")
def my_notifications(
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.PATIENT)),
):
    rows = db.execute(
        select(Notification)
        .where(Notification.account_id == current_account.account_id)
        .order_by(Notification.created_at.desc())
        .limit(100)
    ).scalars().all()

    return [
        {
            "notification_id": row.notification_id,
            "message": row.message,
            "is_read": row.is_read,
            "created_at": row.created_at,
        }
        for row in rows
    ]


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.PATIENT)),
):
    notification = db.scalar(
        select(Notification)
        .where(
            Notification.notification_id == notification_id,
            Notification.account_id == current_account.account_id,
        )
        .limit(1)
    )
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}
