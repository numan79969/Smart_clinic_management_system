from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import (
    AppointmentStatusEnum,
    OnboardingStatusEnum,
    PaymentStatusEnum,
    RoleEnum,
    SlotStatusEnum,
)


def utcnow() -> datetime:
    return datetime.utcnow()


class Account(Base):
    __tablename__ = "accounts"

    account_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    role: Mapped[RoleEnum] = mapped_column(SAEnum(RoleEnum, native_enum=False), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    failed_login_attempts: Mapped[int] = mapped_column(default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    patient_profile: Mapped[PatientProfile | None] = relationship(back_populates="account", uselist=False)
    hospital_profile: Mapped[HospitalProfile | None] = relationship(back_populates="account", uselist=False)


class Locality(Base):
    __tablename__ = "localities"

    locality_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    patient_id: Mapped[int] = mapped_column(ForeignKey("accounts.account_id"), primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    dob: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    locality_id: Mapped[int | None] = mapped_column(ForeignKey("localities.locality_id"), nullable=True)
    address_line: Mapped[str | None] = mapped_column(String(255), nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(20), nullable=True)

    account: Mapped[Account] = relationship(back_populates="patient_profile")


class HospitalProfile(Base):
    __tablename__ = "hospital_profiles"

    hospital_id: Mapped[int] = mapped_column(ForeignKey("accounts.account_id"), primary_key=True)
    hospital_name: Mapped[str] = mapped_column(String(180), nullable=False)
    registration_no: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    locality_id: Mapped[int] = mapped_column(ForeignKey("localities.locality_id"), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    onboarding_status: Mapped[OnboardingStatusEnum] = mapped_column(
        SAEnum(OnboardingStatusEnum, native_enum=False), default=OnboardingStatusEnum.PENDING, nullable=False
    )

    account: Mapped[Account] = relationship(back_populates="hospital_profile")
    doctors: Mapped[list[Doctor]] = relationship(back_populates="hospital")


class Specialty(Base):
    __tablename__ = "specialties"

    specialty_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)


class MedicalCondition(Base):
    __tablename__ = "medical_conditions"

    condition_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)


class ConditionSpecialty(Base):
    __tablename__ = "condition_specialties"
    __table_args__ = (UniqueConstraint("condition_id", "specialty_id", name="uq_condition_specialty"),)

    condition_specialty_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    condition_id: Mapped[int] = mapped_column(ForeignKey("medical_conditions.condition_id"), nullable=False)
    specialty_id: Mapped[int] = mapped_column(ForeignKey("specialties.specialty_id"), nullable=False)


class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospital_profiles.hospital_id"), nullable=False)
    specialty_id: Mapped[int] = mapped_column(ForeignKey("specialties.specialty_id"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    experience_years: Mapped[int] = mapped_column(default=0, nullable=False)
    consultation_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    hospital: Mapped[HospitalProfile] = relationship(back_populates="doctors")


class DoctorSlot(Base):
    __tablename__ = "doctor_slots"
    __table_args__ = (UniqueConstraint("doctor_id", "slot_date", "start_time", name="uq_doctor_slot_start"),)

    slot_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.doctor_id"), nullable=False)
    slot_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    slot_status: Mapped[SlotStatusEnum] = mapped_column(
        SAEnum(SlotStatusEnum, native_enum=False), default=SlotStatusEnum.AVAILABLE, nullable=False
    )


class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient_profiles.patient_id"), nullable=False)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospital_profiles.hospital_id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.doctor_id"), nullable=False)
    slot_id: Mapped[int] = mapped_column(ForeignKey("doctor_slots.slot_id"), nullable=False, unique=True)
    condition_id: Mapped[int] = mapped_column(ForeignKey("medical_conditions.condition_id"), nullable=False)
    appointment_status: Mapped[AppointmentStatusEnum] = mapped_column(
        SAEnum(AppointmentStatusEnum, native_enum=False), default=AppointmentStatusEnum.BOOKED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class Prescription(Base):
    __tablename__ = "prescriptions"

    prescription_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.appointment_id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.doctor_id"), nullable=False)
    diagnosis: Mapped[str] = mapped_column(Text, nullable=False)
    advice: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class Bill(Base):
    __tablename__ = "bills"

    bill_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.appointment_id"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient_profiles.patient_id"), nullable=False)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospital_profiles.hospital_id"), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    payment_status: Mapped[PaymentStatusEnum] = mapped_column(
        SAEnum(PaymentStatusEnum, native_enum=False), default=PaymentStatusEnum.UNPAID, nullable=False
    )
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class Report(Base):
    __tablename__ = "reports"

    report_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.appointment_id"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient_profiles.patient_id"), nullable=False)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospital_profiles.hospital_id"), nullable=False)
    report_type: Mapped[str] = mapped_column(String(80), nullable=False)
    file_url: Mapped[str] = mapped_column(String(255), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    actor_account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.account_id"), nullable=True)
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_name: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_id: Mapped[int | None] = mapped_column(nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.account_id"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
