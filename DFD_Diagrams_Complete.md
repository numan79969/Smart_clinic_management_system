# Data Flow Diagrams - Smart Clinic Management System

## DFD Level 0 (Context Diagram)

```
                    ┌─────────────────────────────────────┐
                    │   SMART CLINIC MANAGEMENT SYSTEM    │
                    │         (Single Process)            │
                    └─────────────────────────────────────┘
                              │         │         │
                    ┌─────────┘         │         └─────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
              ┌──────────┐         ┌──────────┐       ┌──────────┐
              │ PATIENTS │         │ HOSPITALS│       │  ADMINS  │
              └──────────┘         └──────────┘       └──────────┘
                    │                   │                   │
    ┌───────────────┼───────────────────┼───────────────────┤
    │               │                   │                   │
    ├─ Registration │ ─ Hospital Setup  │ ─ Monitoring     │
    │ ─ Search      │ ─ Doctor Mgmt     │ ─ Approvals      │
    │ ─ Booking     │ ─ Slot Creation  │ ─ Reports        │
    │ ─ Documents   │ ─ Bill Gen        │ ─ Audit Logs     │
    │ ─ Billing     │ ─ Prescriptions   │ ─ System Config  │
    │               │                   │                   │
    └───────────────┴───────────────────┴───────────────────┘
```

**External Entities:**
- **PATIENTS**: Users seeking healthcare services, appointment booking, document management
- **HOSPITALS**: Healthcare providers managing doctors, appointments, prescriptions, billing
- **ADMINS**: System administrators overseeing hospital approvals, user management, audit trails

---

## DFD Level 1 - Patient User Flow

```
                              ┌─ D1: User Database
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              ┌──────────┐         ┌──────────┐
              │   P1:    │◄────────│   P2:    │
              │  Auth &  │ Auth    │ Discovery│
              │  Login   │ Token   │  Lookup  │
              └──────────┘         └──────────┘
                    │                   │
                    │                   ├─ D2: Hospital Database
                    │                   ├─ D3: Doctor Database
                    │                   └─ D4: Specialty Database
                    │
                    ▼
              ┌──────────┐
              │   P3:    │◄──────────┐
              │ Appt     │ Search    │
              │ Search & │ Results   │
              │  Book    │           │
              └──────────┘           │
                    │                │
                    ├─ D5: Appointments DB
                    ├─ D6: Slots Database
                    │
                    ▼
              ┌──────────┐
              │   P4:    │
              │ Appt     │────────── Confirmation
              │Confirm   │
              │  & Track │
              └──────────┘
                    │
                    ├─ D7: Notifications DB
                    │
                    ▼
              ┌──────────┐
              │   P5:    │
              │Documents │
              │  & Bills │
              └──────────┘
                    │
                    ├─ D8: Prescriptions DB
                    ├─ D9: Bills Database
                    └─ D10: Reports Database

**Processes:**
- P1: Authentication & Login - Patient registration, credential validation
- P2: Discovery & Lookup - Hospital/doctor search, specialty recommendations
- P3: Appointment Search & Booking - Browse slots, book appointments
- P4: Appointment Confirmation & Tracking - Track appointment status
- P5: Documents & Billing - Access prescriptions, bills, reports

**Data Stores:**
- D1: User Database - Patient credentials
- D2: Hospital Database - Hospital details, location
- D3: Doctor Database - Doctor profiles
- D4: Specialty Database - Medical specialties
- D5: Appointments DB - Appointment records
- D6: Slots Database - Doctor available slots
- D7: Notifications DB - Appointment alerts
- D8: Prescriptions DB - Digital prescriptions
- D9: Bills Database - Invoice records
- D10: Reports Database - Medical reports
```

---

## DFD Level 1 - Hospital User Flow

```
                              ┌─ D1: User Database
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              ┌──────────┐         ┌──────────┐
              │   P1:    │◄────────│   P2:    │
              │  Auth &  │ Auth    │Hospital  │
              │  Login   │ Token   │ Setup    │
              └──────────┘         └──────────┘
                    │                   │
                    │                   ├─ D2: Hospital Database
                    │                   │
                    ▼                   ▼
              ┌──────────┐         ┌──────────┐
              │   P3:    │────────▶│   P4:    │
              │ Doctor   │ Doctor  │  Slot &  │
              │  Mgmt    │ Details │ Schedule │
              └──────────┘         └──────────┘
                    │                   │
                    ├─ D3: Doctor DB    ├─ D6: Slots Database
                    │                   │
                    ▼                   ▼
              ┌──────────┐         ┌──────────┐
              │   P5:    │◄────────│   P6:    │
              │  Appt    │ Status  │Appt      │
              │Confirm & │ Update  │Mgmt      │
              │ Manage   │         │          │
              └──────────┘         └──────────┘
                    │                   │
                    ├─ D5: Appt DB      └─ D5: Appointments DB
                    │
                    ▼
              ┌──────────┐
              │   P7:    │
              │Prescrip- │
              │tion &    │
              │  Bills   │
              └──────────┘
                    │
                    ├─ D8: Prescriptions DB
                    ├─ D9: Bills Database
                    └─ D10: Reports Database

**Processes:**
- P1: Authentication & Login - Hospital staff login, credential validation
- P2: Hospital Setup - Complete hospital profile, registration details
- P3: Doctor Management - Add/update doctors, staff profiles
- P4: Slot & Schedule Management - Create appointment slots, manage schedules
- P5: Appointment Management - View, confirm, cancel appointments
- P6: Appointment Tracking - Update appointment status, confirmations
- P7: Prescription & Billing - Issue prescriptions, generate bills

**Data Stores:**
- D1: User Database - Hospital staff credentials
- D2: Hospital Database - Hospital profile data
- D3: Doctor DB - Doctor profiles, qualifications
- D5: Appointments DB - Appointment records
- D6: Slots Database - Available time slots
- D8: Prescriptions DB - Issued prescriptions
- D9: Bills Database - Generated bills
- D10: Reports Database - Medical reports
```

---

## DFD Level 1 - Admin User Flow

```
                              ┌─ D1: User Database
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              ┌──────────┐         ┌──────────┐
              │   P1:    │◄────────│   P2:    │
              │  Auth &  │ Auth    │  User    │
              │  Login   │ Token   │  Mgmt    │
              └──────────┘         └──────────┘
                    │                   │
                    │                   ├─ D1: User Database
                    │                   │
                    ▼                   ▼
              ┌──────────┐         ┌──────────┐
              │   P3:    │◄────────│   P4:    │
              │Hospital  │ Status  │Monitoring│
              │ Approval │ Update  │ Dashboard│
              │ Process  │         │          │
              └──────────┘         └──────────┘
                    │                   │
                    ├─ D2: Hospital DB   └─ D2: Hospital DB
                    │                   └─ D3: Doctor DB
                    │
                    ▼
              ┌──────────┐
              │   P5:    │
              │  Audit   │
              │   Log    │
              │ Tracking │
              └──────────┘
                    │
                    ├─ D11: Audit Logs DB
                    │
                    ▼
              ┌──────────┐
              │   P6:    │
              │ Reports  │
              │    &     │
              │Analytics │
              └──────────┘
                    │
                    ├─ D5: Appointments DB
                    ├─ D9: Bills Database
                    └─ D10: Reports Database

**Processes:**
- P1: Authentication & Login - Admin credential validation
- P2: User Management - Manage patient/hospital accounts, activate/deactivate
- P3: Hospital Approval Process - Review and approve hospital registrations
- P4: System Monitoring Dashboard - Real-time system overview, user metrics
- P5: Audit Log Tracking - Monitor critical actions, system changes
- P6: Reports & Analytics - Generate system reports, usage analytics

**Data Stores:**
- D1: User Database - All user accounts and credentials
- D2: Hospital Database - Hospital profiles and status
- D3: Doctor DB - Doctor information
- D5: Appointments DB - All appointments (analytics)
- D9: Bills Database - Billing records (analytics)
- D10: Reports Database - Medical reports (tracking)
- D11: Audit Logs DB - All system actions and changes
```

---

## Data Flow Summary Table

| Data Flow | From | To | Description |
|-----------|------|-----|-------------|
| Registration Data | Patient | P1 | Patient registration information |
| Auth Token | P1 | Patient | JWT authentication token |
| Search Request | Patient | P2 | Hospital/doctor search query |
| Search Results | P2 | Patient | Matching hospitals/doctors |
| Booking Request | Patient | P3 | Appointment booking details |
| Confirmation | P3/P5 | Patient | Appointment confirmation |
| Appointment Status | P4 | Patient | Appointment status updates |
| Document Access | P5 | Patient | Prescriptions, bills, reports |
| Hospital Data | Hospital | P2 | Hospital profile setup |
| Doctor Details | Hospital | P3 | Doctor information |
| Slot Creation | Hospital | P4 | Available appointment slots |
| Appointment Update | Hospital | P5 | Appointment status changes |
| Prescription Data | Hospital | P7 | Digital prescriptions |
| Bill Generation | Hospital | P7 | Invoice generation |
| User Query | Admin | P2 | Account management requests |
| Approval Status | Admin | P3 | Hospital approval decision |
| System Metrics | P4 | Admin | System performance data |
| Audit Records | P5 | Admin | Critical action logs |
| Analytics Data | P6 | Admin | System usage reports |

---

## Key Data Stores

1. **D1: User Database** - User credentials, profiles (Patients, Hospitals, Admins)
2. **D2: Hospital Database** - Hospital details, location, approval status
3. **D3: Doctor Database** - Doctor profiles, qualifications, specialties
4. **D4: Specialty Database** - Medical specialties, conditions mapping
5. **D5: Appointments Database** - Appointment records, status tracking
6. **D6: Slots Database** - Doctor availability, time slots
7. **D7: Notifications Database** - Appointment reminders, alerts
8. **D8: Prescriptions Database** - Digital prescriptions, medications
9. **D9: Bills Database** - Invoices, payment tracking
10. **D10: Reports Database** - Medical reports, test results
11. **D11: Audit Logs Database** - System actions, changes, compliance records
