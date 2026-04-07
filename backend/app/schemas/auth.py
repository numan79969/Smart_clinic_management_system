from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import RoleEnum
from app.schemas.base import ORMModel


class AccountPublic(ORMModel):
    account_id: int
    role: RoleEnum
    email: EmailStr
    phone: str
    is_active: bool
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    account: AccountPublic


class RegisterPatientRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    dob: date | None = None
    gender: str | None = Field(default=None, max_length=20)
    locality_id: int | None = None
    address_line: str | None = Field(default=None, max_length=255)
    emergency_contact: str | None = Field(default=None, max_length=20)


class RegisterHospitalRequest(BaseModel):
    hospital_name: str = Field(min_length=2, max_length=180)
    registration_no: str = Field(min_length=3, max_length=80)
    locality_id: int
    contact_phone: str = Field(min_length=8, max_length=20)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=8, max_length=128)


class BootstrapAdminRequest(BaseModel):
    email: EmailStr
    phone: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=8, max_length=128)
