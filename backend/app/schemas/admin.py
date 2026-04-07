from pydantic import BaseModel

from app.models import OnboardingStatusEnum


class AccountActiveUpdate(BaseModel):
    is_active: bool


class HospitalStatusUpdate(BaseModel):
    onboarding_status: OnboardingStatusEnum
