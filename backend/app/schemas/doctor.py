from datetime import date, time
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class DoctorCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    specialty_id: int
    experience_years: int = Field(default=0, ge=0, le=80)
    consultation_fee: Decimal = Field(gt=0)
    is_active: bool = True


class DoctorUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    specialty_id: int | None = None
    experience_years: int | None = Field(default=None, ge=0, le=80)
    consultation_fee: Decimal | None = Field(default=None, gt=0)
    is_active: bool | None = None


class DoctorOut(ORMModel):
    doctor_id: int
    hospital_id: int
    specialty_id: int
    full_name: str
    experience_years: int
    consultation_fee: Decimal
    is_active: bool


class SlotCreate(BaseModel):
    slot_date: date
    start_time: time
    end_time: time


class SlotBulkCreate(BaseModel):
    slots: list[SlotCreate]
