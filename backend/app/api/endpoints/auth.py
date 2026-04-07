from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.audit import add_audit_log
from app.core.config import settings
from app.core.deps import get_current_account, get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import Account, HospitalProfile, Locality, PatientProfile, RoleEnum
from app.schemas.auth import (
    AccountPublic,
    BootstrapAdminRequest,
    LoginRequest,
    RegisterHospitalRequest,
    RegisterPatientRequest,
    TokenResponse,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


def _check_unique_account(db: Session, email: str, phone: str) -> None:
    existing = db.scalar(select(Account).where(or_(Account.email == email, Account.phone == phone)).limit(1))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or phone already exists")


@router.post("/register/patient", response_model=AccountPublic, status_code=status.HTTP_201_CREATED)
def register_patient(payload: RegisterPatientRequest, db: Session = Depends(get_db), request: Request = None):
    _check_unique_account(db, payload.email, payload.phone)

    if payload.locality_id is not None and db.get(Locality, payload.locality_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")

    account = Account(
        role=RoleEnum.PATIENT,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
    )
    db.add(account)
    db.flush()

    db.add(
        PatientProfile(
            patient_id=account.account_id,
            full_name=payload.full_name,
            dob=payload.dob,
            gender=payload.gender,
            locality_id=payload.locality_id,
            address_line=payload.address_line,
            emergency_contact=payload.emergency_contact,
        )
    )

    add_audit_log(
        db,
        action="REGISTER_PATIENT",
        entity_name="accounts",
        actor_account_id=account.account_id,
        entity_id=account.account_id,
        ip_address=request.client.host if request and request.client else None,
    )

    db.commit()
    db.refresh(account)
    return AccountPublic.model_validate(account)


@router.post("/register/hospital", response_model=AccountPublic, status_code=status.HTTP_201_CREATED)
def register_hospital(payload: RegisterHospitalRequest, db: Session = Depends(get_db), request: Request = None):
    _check_unique_account(db, payload.email, payload.phone)

    if db.get(Locality, payload.locality_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")

    existing_reg = db.scalar(
        select(HospitalProfile).where(HospitalProfile.registration_no == payload.registration_no).limit(1)
    )
    if existing_reg:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Registration number already exists")

    account = Account(
        role=RoleEnum.HOSPITAL,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
    )
    db.add(account)
    db.flush()

    db.add(
        HospitalProfile(
            hospital_id=account.account_id,
            hospital_name=payload.hospital_name,
            registration_no=payload.registration_no,
            locality_id=payload.locality_id,
            contact_phone=payload.contact_phone,
        )
    )

    add_audit_log(
        db,
        action="REGISTER_HOSPITAL",
        entity_name="hospital_profiles",
        actor_account_id=account.account_id,
        entity_id=account.account_id,
        ip_address=request.client.host if request and request.client else None,
    )

    db.commit()
    db.refresh(account)
    return AccountPublic.model_validate(account)


@router.post("/bootstrap-admin", response_model=AccountPublic, status_code=status.HTTP_201_CREATED)
def bootstrap_admin(payload: BootstrapAdminRequest, db: Session = Depends(get_db), request: Request = None):
    existing_admin = db.scalar(select(Account).where(Account.role == RoleEnum.ADMIN).limit(1))
    if existing_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin already exists")

    _check_unique_account(db, payload.email, payload.phone)

    account = Account(
        role=RoleEnum.ADMIN,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
    )
    db.add(account)
    db.flush()

    add_audit_log(
        db,
        action="BOOTSTRAP_ADMIN",
        entity_name="accounts",
        actor_account_id=account.account_id,
        entity_id=account.account_id,
        ip_address=request.client.host if request and request.client else None,
    )

    db.commit()
    db.refresh(account)
    return AccountPublic.model_validate(account)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db), request: Request = None):
    account = db.scalar(select(Account).where(Account.email == payload.email).limit(1))
    if account is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    now = datetime.utcnow()
    if account.locked_until and account.locked_until > now:
        raise HTTPException(status_code=status.HTTP_423_LOCKED, detail="Account temporarily locked")

    if not verify_password(payload.password, account.password_hash):
        account.failed_login_attempts += 1
        if account.failed_login_attempts >= 5:
            account.locked_until = now + timedelta(minutes=settings.login_lock_minutes)
            account.failed_login_attempts = 0
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not account.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    account.failed_login_attempts = 0
    account.locked_until = None

    token = create_access_token(subject=str(account.account_id), role=account.role.value)

    add_audit_log(
        db,
        action="LOGIN_SUCCESS",
        entity_name="accounts",
        actor_account_id=account.account_id,
        entity_id=account.account_id,
        ip_address=request.client.host if request and request.client else None,
    )
    db.commit()

    return TokenResponse(access_token=token, account=AccountPublic.model_validate(account))


@router.get("/me", response_model=AccountPublic)
def me(current_account: Account = Depends(get_current_account)):
    return AccountPublic.model_validate(current_account)
