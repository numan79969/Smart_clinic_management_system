from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    Account,
    ConditionSpecialty,
    Locality,
    MedicalCondition,
    RoleEnum,
    Specialty,
)


def seed_reference_data(db: Session) -> None:
    if db.scalar(select(Locality.locality_id).limit(1)) is None:
        db.add_all(
            [
                Locality(name="Koramangala", city="Bengaluru"),
                Locality(name="Indiranagar", city="Bengaluru"),
                Locality(name="Jayanagar", city="Mysuru"),
                Locality(name="Whitefield", city="Bengaluru"),
                Locality(name="Mangaladevi", city="Mangaluru"),
            ]
        )

    if db.scalar(select(Specialty.specialty_id).limit(1)) is None:
        db.add_all(
            [
                Specialty(name="Cardiology", description="Heart and vascular care"),
                Specialty(name="Dermatology", description="Skin and allergy concerns"),
                Specialty(name="Orthopedics", description="Bone and joint health"),
                Specialty(name="Neurology", description="Brain and nervous system"),
                Specialty(name="General Medicine", description="Primary care and diagnostics"),
                Specialty(name="Pediatrics", description="Child healthcare"),
            ]
        )

    if db.scalar(select(MedicalCondition.condition_id).limit(1)) is None:
        db.add_all(
            [
                MedicalCondition(name="Chest Pain", description="Pain or pressure in chest"),
                MedicalCondition(name="Skin Rash", description="Persistent skin irritation"),
                MedicalCondition(name="Back Pain", description="Musculoskeletal back issues"),
                MedicalCondition(name="Headache", description="Severe or recurring headaches"),
                MedicalCondition(name="Fever", description="Raised body temperature"),
                MedicalCondition(name="Child Checkup", description="Routine child assessment"),
            ]
        )

    db.commit()

    if db.scalar(select(ConditionSpecialty.condition_specialty_id).limit(1)) is None:
        condition_ids = {c.name: c.condition_id for c in db.execute(select(MedicalCondition)).scalars()}
        specialty_ids = {s.name: s.specialty_id for s in db.execute(select(Specialty)).scalars()}

        mappings = [
            ("Chest Pain", "Cardiology"),
            ("Skin Rash", "Dermatology"),
            ("Back Pain", "Orthopedics"),
            ("Headache", "Neurology"),
            ("Fever", "General Medicine"),
            ("Child Checkup", "Pediatrics"),
            ("Fever", "Pediatrics"),
        ]

        for condition_name, specialty_name in mappings:
            db.add(
                ConditionSpecialty(
                    condition_id=condition_ids[condition_name],
                    specialty_id=specialty_ids[specialty_name],
                )
            )

    admin_account = db.scalar(select(Account).where(Account.role == RoleEnum.ADMIN).limit(1))
    if admin_account is None:
        db.add(
            Account(
                role=RoleEnum.ADMIN,
                email=settings.seed_admin_email,
                phone=settings.seed_admin_phone,
                password_hash=get_password_hash(settings.seed_admin_password),
                is_active=True,
            )
        )
    elif admin_account.email == "admin@scms.local":
        admin_account.email = settings.seed_admin_email

    db.commit()
