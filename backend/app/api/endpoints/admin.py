from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.audit import add_audit_log, add_notification
from app.core.deps import get_db, require_roles
from app.models import (
    Account,
    Appointment,
    AuditLog,
    Bill,
    Doctor,
    HospitalProfile,
    Locality,
    OnboardingStatusEnum,
    PatientProfile,
    Report,
    RoleEnum,
)
from app.schemas.admin import AccountActiveUpdate, HospitalStatusUpdate


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
def admin_overview(
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.ADMIN)),
):
    _ = current_account
    return {
        "accounts": db.scalar(select(func.count(Account.account_id))) or 0,
        "patients": db.scalar(select(func.count(Account.account_id)).where(Account.role == RoleEnum.PATIENT)) or 0,
        "hospitals": db.scalar(select(func.count(Account.account_id)).where(Account.role == RoleEnum.HOSPITAL)) or 0,
        "doctors": db.scalar(select(func.count(Doctor.doctor_id))) or 0,
        "appointments": db.scalar(select(func.count(Appointment.appointment_id))) or 0,
        "bills": db.scalar(select(func.count(Bill.bill_id))) or 0,
        "reports": db.scalar(select(func.count(Report.report_id))) or 0,
    }


@router.get("/accounts")
def list_accounts(
    role: RoleEnum | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.ADMIN)),
):
    _ = current_account
    query = select(Account).order_by(Account.created_at.desc())
    if role:
        query = query.where(Account.role == role)
    if is_active is not None:
        query = query.where(Account.is_active == is_active)

    accounts = db.execute(query).scalars().all()
    payload = []
    for account in accounts:
        display_name = None
        if account.role == RoleEnum.PATIENT:
            profile = db.get(PatientProfile, account.account_id)
            display_name = profile.full_name if profile else None
        if account.role == RoleEnum.HOSPITAL:
            profile = db.get(HospitalProfile, account.account_id)
            display_name = profile.hospital_name if profile else None

        payload.append(
            {
                "account_id": account.account_id,
                "role": account.role,
                "email": account.email,
                "phone": account.phone,
                "is_active": account.is_active,
                "display_name": display_name,
                "created_at": account.created_at,
            }
        )

    return payload


@router.patch("/accounts/{account_id}/active")
def update_account_active(
    account_id: int,
    payload: AccountActiveUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.ADMIN)),
):
    account = db.get(Account, account_id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    account.is_active = payload.is_active

    add_audit_log(
        db,
        action="UPDATE_ACCOUNT_ACTIVE",
        entity_name="accounts",
        actor_account_id=current_account.account_id,
        entity_id=account.account_id,
        ip_address=request.client.host if request.client else None,
    )

    db.commit()
    return {"message": "Account status updated"}


@router.get("/hospitals")
def list_hospitals_for_admin(
    onboarding_status: OnboardingStatusEnum | None = Query(default=None),
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.ADMIN)),
):
    _ = current_account
    query = (
        select(
            HospitalProfile,
            Account.is_active.label("account_active"),
            Locality.name.label("locality_name"),
            Locality.city.label("city_name"),
        )
        .join(Account, Account.account_id == HospitalProfile.hospital_id)
        .join(Locality, Locality.locality_id == HospitalProfile.locality_id)
        .order_by(HospitalProfile.hospital_name)
    )
    if onboarding_status:
        query = query.where(HospitalProfile.onboarding_status == onboarding_status)

    rows = db.execute(query).all()
    return [
        {
            "hospital_id": row.HospitalProfile.hospital_id,
            "hospital_name": row.HospitalProfile.hospital_name,
            "registration_no": row.HospitalProfile.registration_no,
            "contact_phone": row.HospitalProfile.contact_phone,
            "onboarding_status": row.HospitalProfile.onboarding_status,
            "is_active": row.account_active,
            "locality": row.locality_name,
            "city": row.city_name,
        }
        for row in rows
    ]


@router.patch("/hospitals/{hospital_id}/onboarding-status")
def update_hospital_onboarding_status(
    hospital_id: int,
    payload: HospitalStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.ADMIN)),
):
    hospital = db.get(HospitalProfile, hospital_id)
    if hospital is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")

    hospital.onboarding_status = payload.onboarding_status

    add_audit_log(
        db,
        action="UPDATE_HOSPITAL_ONBOARDING",
        entity_name="hospital_profiles",
        actor_account_id=current_account.account_id,
        entity_id=hospital.hospital_id,
        ip_address=request.client.host if request.client else None,
    )
    add_notification(
        db,
        account_id=hospital.hospital_id,
        message=f"Hospital onboarding status updated to {payload.onboarding_status.value}",
    )

    db.commit()
    return {"message": "Hospital onboarding status updated"}


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_account: Account = Depends(require_roles(RoleEnum.ADMIN)),
):
    _ = current_account
    rows = db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)).scalars().all()
    return [
        {
            "log_id": row.log_id,
            "actor_account_id": row.actor_account_id,
            "action": row.action,
            "entity_name": row.entity_name,
            "entity_id": row.entity_id,
            "ip_address": row.ip_address,
            "created_at": row.created_at,
        }
        for row in rows
    ]
