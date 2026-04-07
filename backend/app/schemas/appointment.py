from decimal import Decimal

from pydantic import BaseModel, Field

from app.models import AppointmentStatusEnum, PaymentStatusEnum


class AppointmentCreate(BaseModel):
    doctor_id: int
    slot_id: int
    condition_id: int


class AppointmentStatusUpdate(BaseModel):
    appointment_status: AppointmentStatusEnum


class PrescriptionCreate(BaseModel):
    diagnosis: str = Field(min_length=2)
    advice: str | None = None
    file_url: str | None = Field(default=None, max_length=255)


class BillCreate(BaseModel):
    total_amount: Decimal = Field(gt=0)
    payment_status: PaymentStatusEnum = PaymentStatusEnum.UNPAID


class ReportCreate(BaseModel):
    report_type: str = Field(min_length=2, max_length=80)
    file_url: str = Field(min_length=3, max_length=255)
