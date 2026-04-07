from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models import (
    Account,
    ConditionSpecialty,
    Doctor,
    DoctorSlot,
    HospitalProfile,
    Locality,
    OnboardingStatusEnum,
    SlotStatusEnum,
    Specialty,
)


router = APIRouter(prefix="/discovery", tags=["Discovery"])


def _resolve_specialty_ids(db: Session, condition_id: int | None, specialty_id: int | None) -> list[int] | None:
    if specialty_id:
        return [specialty_id]
    if condition_id:
        return db.execute(
            select(ConditionSpecialty.specialty_id).where(ConditionSpecialty.condition_id == condition_id)
        ).scalars().all()
    return None


@router.get("/hospitals")
def list_hospitals(
    locality_id: int | None = Query(default=None),
    specialty_id: int | None = Query(default=None),
    condition_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    specialty_ids = _resolve_specialty_ids(db, condition_id, specialty_id)

    base_query = (
        select(
            HospitalProfile.hospital_id,
            HospitalProfile.hospital_name,
            HospitalProfile.registration_no,
            HospitalProfile.contact_phone,
            HospitalProfile.onboarding_status,
            Locality.name.label("locality_name"),
            Locality.city.label("city_name"),
        )
        .join(Account, Account.account_id == HospitalProfile.hospital_id)
        .join(Locality, Locality.locality_id == HospitalProfile.locality_id)
        .where(
            Account.is_active.is_(True),
            HospitalProfile.onboarding_status == OnboardingStatusEnum.APPROVED,
        )
        .order_by(HospitalProfile.hospital_name)
    )

    if locality_id:
        base_query = base_query.where(HospitalProfile.locality_id == locality_id)

    rows = db.execute(base_query).all()
    payload = []

    for row in rows:
        doctor_count_query = select(func.count(Doctor.doctor_id)).where(
            Doctor.hospital_id == row.hospital_id,
            Doctor.is_active.is_(True),
        )
        if specialty_ids:
            doctor_count_query = doctor_count_query.where(Doctor.specialty_id.in_(specialty_ids))
        doctors_count = db.scalar(doctor_count_query) or 0

        if specialty_ids and doctors_count == 0:
            continue

        payload.append(
            {
                "hospital_id": row.hospital_id,
                "hospital_name": row.hospital_name,
                "registration_no": row.registration_no,
                "contact_phone": row.contact_phone,
                "locality": row.locality_name,
                "city": row.city_name,
                "doctors_count": doctors_count,
            }
        )

    return payload


@router.get("/hospitals/{hospital_id}/doctors")
def list_hospital_doctors(
    hospital_id: int,
    specialty_id: int | None = Query(default=None),
    condition_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    hospital = db.get(HospitalProfile, hospital_id)
    if hospital is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")

    specialty_ids = _resolve_specialty_ids(db, condition_id, specialty_id)

    query = (
        select(
            Doctor.doctor_id,
            Doctor.full_name,
            Doctor.experience_years,
            Doctor.consultation_fee,
            Doctor.specialty_id,
            Specialty.name.label("specialty_name"),
        )
        .join(Specialty, Specialty.specialty_id == Doctor.specialty_id)
        .where(Doctor.hospital_id == hospital_id, Doctor.is_active.is_(True))
        .order_by(Doctor.full_name)
    )
    if specialty_ids:
        query = query.where(Doctor.specialty_id.in_(specialty_ids))

    rows = db.execute(query).all()
    return [
        {
            "doctor_id": row.doctor_id,
            "full_name": row.full_name,
            "experience_years": row.experience_years,
            "consultation_fee": float(row.consultation_fee),
            "specialty_id": row.specialty_id,
            "specialty_name": row.specialty_name,
        }
        for row in rows
    ]


@router.get("/doctors/{doctor_id}/slots")
def list_available_slots(
    doctor_id: int,
    slot_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    doctor = db.get(Doctor, doctor_id)
    if doctor is None or not doctor.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    query = (
        select(DoctorSlot)
        .where(DoctorSlot.doctor_id == doctor_id, DoctorSlot.slot_status == SlotStatusEnum.AVAILABLE)
        .order_by(DoctorSlot.slot_date, DoctorSlot.start_time)
    )
    if slot_date:
        query = query.where(DoctorSlot.slot_date == slot_date)
    else:
        query = query.where(DoctorSlot.slot_date >= date.today())

    slots = db.execute(query).scalars().all()
    return [
        {
            "slot_id": slot.slot_id,
            "slot_date": slot.slot_date,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "slot_status": slot.slot_status,
        }
        for slot in slots
    ]
