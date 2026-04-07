from enum import Enum


class RoleEnum(str, Enum):
    PATIENT = "PATIENT"
    HOSPITAL = "HOSPITAL"
    ADMIN = "ADMIN"


class OnboardingStatusEnum(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class SlotStatusEnum(str, Enum):
    AVAILABLE = "AVAILABLE"
    BOOKED = "BOOKED"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"


class AppointmentStatusEnum(str, Enum):
    BOOKED = "BOOKED"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class PaymentStatusEnum(str, Enum):
    UNPAID = "UNPAID"
    PARTIAL = "PARTIAL"
    PAID = "PAID"
