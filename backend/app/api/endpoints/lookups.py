from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models import ConditionSpecialty, Locality, MedicalCondition, Specialty


router = APIRouter(prefix="/lookups", tags=["Reference Data"])


@router.get("/localities")
def list_localities(db: Session = Depends(get_db)):
    rows = db.execute(select(Locality).order_by(Locality.city, Locality.name)).scalars().all()
    return [
        {
            "locality_id": row.locality_id,
            "name": row.name,
            "city": row.city,
        }
        for row in rows
    ]


@router.get("/specialties")
def list_specialties(db: Session = Depends(get_db)):
    rows = db.execute(select(Specialty).order_by(Specialty.name)).scalars().all()
    return [
        {
            "specialty_id": row.specialty_id,
            "name": row.name,
            "description": row.description,
        }
        for row in rows
    ]


@router.get("/conditions")
def list_conditions(db: Session = Depends(get_db)):
    rows = db.execute(select(MedicalCondition).order_by(MedicalCondition.name)).scalars().all()
    return [
        {
            "condition_id": row.condition_id,
            "name": row.name,
            "description": row.description,
        }
        for row in rows
    ]


@router.get("/condition-specialties/{condition_id}")
def get_condition_specialties(condition_id: int, db: Session = Depends(get_db)):
    specialty_ids = db.execute(
        select(ConditionSpecialty.specialty_id).where(ConditionSpecialty.condition_id == condition_id)
    ).scalars().all()
    rows = db.execute(select(Specialty).where(Specialty.specialty_id.in_(specialty_ids))).scalars().all() if specialty_ids else []
    return [
        {
            "specialty_id": row.specialty_id,
            "name": row.name,
            "description": row.description,
        }
        for row in rows
    ]
