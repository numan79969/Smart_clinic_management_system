# SMART CLINIC MANAGEMENT SYSTEM - BCA PROJECT REPORT

## COMPLETE REPORT CONTENT GUIDE

**FORMATTING SPECIFICATIONS (Apply in Microsoft Word):**
- Font: Times New Roman
- Main Heading: 20 pt, Bold
- Sub Heading: 16 pt, Bold
- Paragraph Text: 14 pt, Regular
- Header/Footer: 10 pt
- Line Spacing: 1.5
- Margins: Left 1.5", Right 1", Top 1", Bottom 1"

---

## PAGE 1: TITLE PAGE

**SMART CLINIC MANAGEMENT SYSTEM**
*Full Stack Application (FastAPI + React)*

**A PROJECT REPORT**

Submitted in partial fulfillment of the requirements for the degree of
**Bachelor of Computer Applications (BCA)**

**Submitted By:**
[Your Name]
Roll No: [Your Roll Number]

**Submitted To:**
[College Name]
[Department of Computer Applications]

**Guided By:**
[Guide Name]

**Date of Submission:**
[Submission Date]

---

## PAGE 2: ACKNOWLEDGEMENT

We would like to express our sincere gratitude to all those who have contributed to the successful completion of this project.

First and foremost, we extend our heartfelt thanks to **[Guide Name]**, our project guide, for their invaluable guidance, continuous encouragement, and constructive feedback throughout the development of this project. Their expertise and dedication have been instrumental in shaping this project to its current form.

We are deeply grateful to **[College Name]** and the **Department of Computer Applications** for providing us with the necessary resources, laboratory facilities, and academic environment to carry out this project. We thank the college management for their constant support and encouragement.

We also acknowledge the support of our peers and classmates who have assisted us through their suggestions and constructive criticism during various phases of the project development.

Finally, we thank our families for their endless support, patience, and motivation throughout this endeavor. Their belief in our capabilities has been a constant source of inspiration.

---

## PAGE 3: CERTIFICATE OF APPROVAL

This is to certify that the project work titled **"Smart Clinic Management System"** has been successfully completed by the undersigned student(s) of the Bachelor of Computer Applications program, under the guidance of **[Guide Name]**.

The project has been examined and is found to be satisfactory for partial fulfillment of the requirements for the award of Bachelor of Computer Applications degree.

**Examiner's Signature**             **Date**
________________                    ________

**Guide's Signature**                **Date**
________________                    ________

**HoD's Signature**                  **Date**
________________                    ________

---

## PAGE 4-5: TABLE OF CONTENTS

1. Introduction
2. Acknowledgement
3. Certificate of Approval
4. Organizational Study
5. Problem Identification
6. Disadvantages of Current System
7. Advantages of Proposed System
8. Feasibility Analysis
9. System Modules
10. Hardware Requirements
11. Software Requirements
12. Database Design (ER Diagram)
13. Data Flow Diagram (DFD)
14. System Architecture
15. Menu Design and Screen Shots
16. System Reports
17. Conclusion
18. Bibliography

---

## SECTION 1: INTRODUCTION (Pages 6-7)

### 1.1 Overview

The Smart Clinic Management System is a comprehensive, full-stack web application designed to revolutionize healthcare clinic operations. It provides an integrated platform for managing patient appointments, hospital information, doctor profiles, prescriptions, billing, and medical reports. The system bridges the gap between patients seeking healthcare services and hospitals providing those services.

In the contemporary healthcare landscape, the ability to efficiently manage patient flow, maintain accurate medical records, and ensure seamless communication between stakeholders is crucial. The Smart Clinic Management System addresses these requirements by providing a centralized, secure, and user-friendly platform that caters to three distinct user roles: Patients, Hospitals, and Administrators.

### 1.2 Project Vision

The vision of this project is to create an accessible, scalable, and secure healthcare management solution that:
- Enables patients to discover suitable hospitals and healthcare providers based on their medical conditions
- Allows hospitals to manage their doctors, appointments, and patient information efficiently
- Provides administrators with comprehensive oversight and control over the entire system
- Maintains data integrity and security through encryption and access control mechanisms
- Facilitates better healthcare delivery through transparent information management

### 1.3 Project Scope

The Smart Clinic Management System encompasses the following functionalities:
1. User authentication and role-based access control for three user types
2. Hospital discovery based on locality and medical specialties
3. Condition-driven doctor recommendation system
4. Appointment booking and management lifecycle
5. Prescription and medical report management with file uploads
6. Billing and payment tracking system
7. Admin monitoring panel with audit capabilities
8. Notification and alert system for stakeholders

---

## SECTION 2: ORGANIZATIONAL STUDY (Pages 8-12)

### 2.1 Nature of Business

The Smart Clinic Management System operates as a digital healthcare intermediary platform. The business model is based on:

**Primary Functions:**
- Connecting patients with appropriate healthcare providers
- Facilitating appointment scheduling and management
- Enabling digital prescription and report management
- Streamlining billing and payment processes
- Maintaining comprehensive audit trails for compliance

**Service Categories:**
1. **Patient-Centric Services:**
   - Hospital discovery by locality
   - Specialty-based doctor search
   - Appointment booking and cancellation
   - Personal document management (prescriptions, bills, reports)
   - Notification system for appointment updates

2. **Hospital-Centric Services:**
   - Doctor and staff profile management
   - Appointment management and confirmation
   - Slot creation and scheduling
   - Digital prescription issuance
   - Bill generation and tracking
   - Medical report uploads

3. **Administrative Services:**
   - System monitoring and oversight
   - Hospital onboarding and approval process
   - Account management and activation
   - Audit trail monitoring
   - System-wide analytics

### 2.2 Organizational Structure

**Number of Departments and Functions:**

1. **Authentication & Security Department**
   - User registration (Patient, Hospital, Admin)
   - JWT-based authentication
   - Role-based access control
   - Account lockout mechanisms
   - Audit logging

2. **Patient Management Department**
   - Patient profile management
   - Appointment lifecycle management
   - Personal document access
   - Notification handling

3. **Hospital Management Department**
   - Hospital onboarding workflow
   - Doctor management
   - Slot scheduling and management
   - Appointment confirmation and tracking
   - Bill and prescription issuance

4. **Discovery & Recommendation Department**
   - Hospital locality-based search
   - Specialty lookup
   - Condition-to-specialty mapping
   - Doctor recommendation engine

5. **Administrative Department**
   - System monitoring
   - Account management
   - Hospital approval process
   - Audit log management

6. **File Management Department**
   - Prescription uploads
   - Report uploads
   - Secure file storage
   - File access control

### 2.3 Infrastructure

**Technology Stack:**
- **Backend:** FastAPI (Python) - RESTful API server
- **Frontend:** React 18.3 with Vite - Web user interface
- **Database:** SQLite - Data persistence
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Security:** CORS middleware, SSL/TLS ready, HTTPS support

**Server Infrastructure:**
- Backend API Server: localhost:8000
- Frontend Development Server: localhost:5173
- Database: SQLite file-based database (scms.db)
- File Storage: Local upload directory for documents

**Network Configuration:**
- CORS enabled for frontend development
- RESTful API communication
- Stateless authentication using JWT tokens

### 2.4 Suppliers & Third-Party Integrations

**Current System Dependencies:**
1. FastAPI Framework
2. SQLAlchemy ORM
3. Pydantic for data validation
4. React Router for frontend navigation
5. Python password hashing libraries (bcrypt, passlib)

**Potential Future Integrations:**
1. Email service for notifications
2. SMS gateway for alerts
3. Payment gateway integration
4. Medical records database synchronization

### 2.5 Transaction Modes

**Online Transactions:**
- Patient registration and hospital discovery (entirely online)
- Appointment booking and cancellation (web-based)
- Digital prescription and report management (online document handling)
- Bill generation and payment tracking (digital process)
- Admin panel monitoring (real-time web interface)

**Offline Components:**
- Initial hospital registration documents may require offline preparation
- Physical medical records may be used alongside digital records
- In-person appointments at hospital locations

---

## SECTION 3: PROBLEM IDENTIFICATION (Pages 13-15)

### 3.1 Area of Study

The Smart Clinic Management System project focuses on solving the critical challenge of **healthcare service accessibility and appointment management in a digital-first healthcare ecosystem**.

The problem domain encompasses:
1. **Fragmented Healthcare Discovery**
   - Patients struggle to find appropriate hospitals for specific medical conditions
   - Limited information about available doctors and their specializations
   - No centralized platform for comparing healthcare options

2. **Inefficient Appointment Management**
   - Manual appointment booking leads to conflicts and overbooking
   - Patients face long wait times due to manual scheduling
   - Hospitals cannot efficiently manage doctor schedules

3. **Medical Record Fragmentation**
   - Prescriptions and medical reports are scattered across multiple providers
   - Patients lack easy access to their medical history
   - Duplicate tests and procedures due to missing information

4. **Billing Opacity**
   - Unclear billing processes and hidden charges
   - Difficulty in tracking payment status
   - No unified billing history

5. **Lack of System Oversight**
   - No centralized monitoring of platform activities
   - Inability to verify hospital credentials and compliance
   - Missing audit trails for accountability

### 3.2 Current Scenario

**Existing Challenges:**
- Manual appointment systems using phone calls or walk-ins
- Paper-based records and prescriptions
- Hospital website fragmentation with inconsistent information
- No real-time availability visibility
- High administrative overhead for hospital staff
- Patient inconvenience in managing medical documents
- Lack of transparency in healthcare processes

**Pain Points:**
- Patients cannot discover hospitals by medical specialty
- Appointment conflicts and double-booking
- Limited communication between patients and healthcare providers
- Time-consuming manual record management
- Difficulty in tracking patient history
- No audit trails for compliance verification

---

## SECTION 4: DISADVANTAGES OF CURRENT SYSTEM (Pages 16-18)

### 4.1 Manual Appointment System

**Disadvantages:**
1. Time-consuming appointment scheduling process
2. High probability of human error leading to double-booking
3. No real-time availability updates
4. Patients must call during business hours
5. Hospitals cannot optimize doctor schedules
6. Limited capacity to handle peak demand
7. No automated reminders leading to missed appointments

### 4.2 Fragmented Information

**Disadvantages:**
1. Patient information scattered across multiple providers
2. Difficulty in maintaining complete medical history
3. Inconsistent patient data leading to errors
4. Time-consuming record retrieval
5. Privacy concerns with multiple databases
6. Incompatible systems unable to communicate

### 4.3 Paper-Based Records

**Disadvantages:**
1. Physical documents prone to loss or damage
2. Difficulty in quick information retrieval
3. Space requirements for document storage
4. Environmental impact of paper usage
5. Limited access from remote locations
6. Security vulnerabilities of physical files

### 4.4 No Centralized Monitoring

**Disadvantages:**
1. Inability to track system activities
2. No audit trail for compliance verification
3. Difficult to identify fraudulent activities
4. Lack of data-driven insights
5. Inefficient resource allocation
6. No performance metrics for improvement

### 4.5 Limited Hospital Discovery

**Disadvantages:**
1. Patients cannot search by medical specialty
2. No location-based hospital search
3. Difficult to compare hospitals
4. No transparency in doctor qualifications
5. Patients rely on word-of-mouth recommendations
6. No system for matching patients with suitable doctors

### 4.6 Manual Billing

**Disadvantages:**
1. Errors in bill calculation
2. Lengthy payment processing
3. No real-time bill generation
4. Difficult to track payment status
5. Discrepancies in records
6. Manual follow-up for collections

---

## SECTION 5: ADVANTAGES OF PROPOSED SYSTEM (Pages 19-23)

### 5.1 Technical Feasibility

**Advantages:**

1. **Modern Technology Stack**
   - FastAPI: High-performance, easy-to-use Python web framework
   - React: Mature, widely-adopted frontend library with large community
   - SQLAlchemy: Robust ORM for database operations
   - SQLite: Lightweight database perfect for scalable deployments

2. **Scalability**
   - RESTful API architecture allows horizontal scaling
   - Database can be easily migrated to production-grade systems (PostgreSQL, MySQL)
   - Stateless authentication enables load balancing
   - Frontend can be deployed on CDNs for global reach

3. **Security Architecture**
   - JWT-based authentication for secure API access
   - bcrypt password hashing prevents brute force attacks
   - Role-based access control (RBAC) ensures users can only access appropriate features
   - Audit logging for accountability and compliance
   - Account lockout mechanism after failed login attempts
   - Input validation through Pydantic schemas
   - CORS protection against unauthorized access

4. **API Design**
   - RESTful design follows industry best practices
   - Clear endpoint organization by functionality
   - Standardized error responses
   - API documentation auto-generated by FastAPI
   - Stateless design for reliability

5. **Database Design**
   - Normalized schema prevents data redundancy
   - Referential integrity through foreign keys
   - Unique constraints prevent duplicate data
   - Indexed fields for optimized queries
   - Supports complex relationships (one-to-many, many-to-many)

6. **Integration Capabilities**
   - Easy integration with third-party services (email, SMS, payment)
   - File upload support for documents
   - Webhook-ready architecture for notifications
   - API versioning support for future upgrades

### 5.2 Economic Feasibility

**Advantages:**

1. **Cost-Effective Development**
   - Open-source technologies reduce licensing costs
   - Python and JavaScript have large talent pools reducing labor costs
   - Rapid development cycle reduces time-to-market

2. **Low Infrastructure Costs**
   - SQLite can run on minimal resources
   - Can be deployed on affordable cloud platforms (AWS, Azure, GCP)
   - Serverless options available for cost optimization
   - No expensive proprietary software required

3. **Operational Efficiency**
   - Reduced manual data entry errors saving correction costs
   - Automation reduces operational overhead
   - Elimination of paper-based processes saves storage and printing costs
   - Efficient appointment management reduces idle hospital resources

4. **Revenue Generation Potential**
   - Subscription-based model for hospitals
   - Commission on appointments booked through platform
   - Premium features for enhanced analytics
   - Future integration with health insurance for referral commissions

5. **Reduced Administrative Costs**
   - Automated appointment reminders reduce no-shows
   - Self-service patient registration reduces support staff workload
   - Automated billing reduces accounting overhead
   - Digital records elimination of physical storage needs

6. **Resource Optimization**
   - Better doctor scheduling improves revenue per doctor
   - Reduced appointment cancellations improve hospital revenue
   - Optimized patient flow reduces wait times
   - Data-driven insights for resource planning

### 5.3 Operational Feasibility

**Advantages:**

1. **User-Friendly Interface**
   - Intuitive design reduces training time
   - Clear navigation for all user types
   - Responsive design works on desktop and mobile
   - Minimal learning curve for end users

2. **Seamless Integration with Existing Systems**
   - API-first design enables integration with existing hospital IT systems
   - Gradual migration from manual to automated processes
   - No disruption to current operations
   - Parallel run capabilities during transition

3. **Real-Time Operations**
   - Live appointment availability updates
   - Instant bill generation
   - Real-time notifications for stakeholders
   - Immediate status updates for appointments

4. **Accessibility**
   - Web-based platform accessible from any device with browser
   - No installation requirements for end users
   - Works offline with cached data capabilities
   - Mobile-responsive design for on-the-go access

5. **Workflow Efficiency**
   - Automated appointment confirmation process
   - One-click prescription generation
   - Simplified bill calculation and payment tracking
   - Reduced administrative touchpoints

6. **Data Quality**
   - Standardized data entry through validation rules
   - Centralized database prevents inconsistencies
   - Automatic data validation at entry point
   - Audit trail ensures data integrity

7. **System Reliability**
   - Error handling and exception management
   - Account lockout prevents unauthorized access
   - Backup and recovery mechanisms
   - Database transactions ensure data consistency

### 5.4 Time and Resources Feasibility

**Advantages:**

1. **Development Timeline**
   - FastAPI and React reduce development time through abstractions
   - Pre-built libraries and frameworks minimize coding effort
   - Clear architectural patterns speed up development
   - Modular design allows parallel development efforts

2. **Resource Requirements**
   - Minimal server resources for operation
   - Low bandwidth requirements for API calls
   - Efficient database queries reduce I/O operations
   - Lightweight frontend improves browser performance

3. **Maintenance Efficiency**
   - Well-documented codebase reduces maintenance complexity
   - Logging and monitoring for quick issue identification
   - Error handling prevents system crashes
   - Modular architecture enables easy bug fixes and updates

4. **Scalability Timeline**
   - Can start with SQLite and migrate to PostgreSQL when needed
   - Horizontal scaling through microservices
   - Load balancing for increased traffic
   - Caching strategies for performance optimization

5. **Human Resources**
   - Python and JavaScript are popular languages with large developer pool
   - Framework documentation and community support abundant
   - Training resources widely available
   - Lower skill requirements compared to enterprise systems

6. **Time to Value**
   - Rapid MVP development possible
   - Phased rollout approach feasible
   - Quick iterations based on feedback
   - Fast deployment cycles enable continuous improvement

---

## SECTION 6: FEASIBILITY ANALYSIS SUMMARY

| Aspect | Status | Details |
|--------|--------|---------|
| **Technical** | ✅ FEASIBLE | Modern stack, scalable architecture, comprehensive security |
| **Economic** | ✅ FEASIBLE | Low development and operational costs, revenue potential |
| **Operational** | ✅ FEASIBLE | User-friendly design, real-time operations, high reliability |
| **Time/Resources** | ✅ FEASIBLE | Rapid development, minimal resources, skilled talent pool |

---

## SECTION 7: PROJECT MODULES (Pages 24-30)

The Smart Clinic Management System comprises 12 core modules:

### Module 1: Authentication & Authorization
**Description:** Manages user registration, login, and access control
**Features:**
- Patient registration with profile details
- Hospital registration with compliance verification
- Admin bootstrap for initial setup
- JWT-based authentication tokens
- Account lockout after failed login attempts
- Role-based access control (PATIENT, HOSPITAL, ADMIN)
**Endpoints:**
- POST /api/v1/auth/register/patient
- POST /api/v1/auth/register/hospital
- POST /api/v1/auth/bootstrap-admin
- POST /api/v1/auth/login
- GET /api/v1/auth/me

### Module 2: Hospital Management
**Description:** Enables hospitals to manage their operations
**Features:**
- Hospital profile view and edit
- Hospital approval workflow by admin
- Onboarding status tracking (PENDING, APPROVED, REJECTED)
- Doctor management (add, edit, activate/deactivate)
- Contact information and registration management
**Endpoints:**
- GET /api/v1/hospital/profile
- GET /api/v1/hospital/doctors
- POST /api/v1/hospital/doctors
- PATCH /api/v1/hospital/doctors/{doctor_id}

### Module 3: Doctor & Slot Management
**Description:** Manages doctor profiles and appointment slots
**Features:**
- Doctor information (name, specialty, experience, fee)
- Specialty assignment to doctors
- Doctor activation/deactivation
- Slot creation in bulk or individual
- Slot date and time management
- Slot status tracking (AVAILABLE, BOOKED, BLOCKED, COMPLETED)
**Endpoints:**
- POST /api/v1/hospital/doctors/{doctor_id}/slots
- GET /api/v1/hospital/slots
- DELETE /api/v1/hospital/slots/{slot_id}

### Module 4: Patient Management
**Description:** Manages patient profiles and personal information
**Features:**
- Patient registration with demographics
- Profile information (DOB, gender, address, emergency contact)
- Locality assignment for location services
- Document access (prescriptions, bills, reports)
- Notification management
**Endpoints:**
- GET /api/v1/patient/documents
- GET /api/v1/patient/notifications
- PATCH /api/v1/patient/notifications/{notification_id}/read

### Module 5: Hospital Discovery
**Description:** Enables patients to find suitable hospitals
**Features:**
- Hospital search by locality
- Hospital search by medical specialty
- Doctor listing by condition
- Speciality mapping to medical conditions
- Hospital availability information
**Endpoints:**
- GET /api/v1/discovery/hospitals
- GET /api/v1/discovery/doctors
- GET /api/v1/discovery/specialties

### Module 6: Appointment Management
**Description:** Handles appointment lifecycle
**Features:**
- Appointment booking by patients
- Appointment confirmation by hospitals
- Appointment status tracking (BOOKED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
- Appointment listing for patients and hospitals
- Appointment cancellation
- Slot availability verification
**Endpoints:**
- POST /api/v1/patient/appointments
- GET /api/v1/patient/appointments
- PATCH /api/v1/patient/appointments/{appointment_id}/cancel
- GET /api/v1/hospital/appointments
- PATCH /api/v1/hospital/appointments/{appointment_id}/status

### Module 7: Prescription Management
**Description:** Manages patient prescriptions
**Features:**
- Prescription creation by hospitals after appointment completion
- Diagnosis and advice documentation
- Prescription file upload support
- Prescription access by patients
- Prescription history tracking
**Endpoints:**
- POST /api/v1/hospital/appointments/{appointment_id}/prescriptions
- File access through /uploads/prescription/*

### Module 8: Billing & Payment Management
**Description:** Manages appointment billing and payment status
**Features:**
- Bill generation after appointment completion
- Amount calculation and recording
- Payment status tracking (UNPAID, PARTIAL, PAID)
- Bill history for patients
- Bill listing for hospitals
**Endpoints:**
- POST /api/v1/hospital/appointments/{appointment_id}/bills
- Bill access through patient documents endpoint

### Module 9: Medical Report Management
**Description:** Manages medical test reports and documents
**Features:**
- Report upload by hospitals
- Report type categorization
- Report file storage and access
- Patient access to all their reports
- Report history tracking
**Endpoints:**
- POST /api/v1/hospital/appointments/{appointment_id}/reports
- File access through /uploads/report/*

### Module 10: File Upload & Document Management
**Description:** Handles secure file uploads for medical documents
**Features:**
- Prescription document upload
- Medical report upload
- File type validation (PDF, PNG, JPG)
- File size limit enforcement (5MB)
- Secure file storage with unique naming
- Document access control
**Endpoints:**
- POST /api/v1/hospital/uploads
- GET /uploads/{document_type}/{filename}

### Module 11: Admin Panel & Monitoring
**Description:** Provides system-wide monitoring and control
**Features:**
- System overview dashboard
- Account management (list, activate/deactivate)
- Hospital management and approval workflow
- Audit log viewing
- Role-based filtering
- Account status filtering
**Endpoints:**
- GET /api/v1/admin/overview
- GET /api/v1/admin/accounts
- PATCH /api/v1/admin/accounts/{account_id}/active
- GET /api/v1/admin/hospitals
- PATCH /api/v1/admin/hospitals/{hospital_id}/onboarding-status
- GET /api/v1/admin/audit-logs

### Module 12: Audit & Notifications
**Description:** Logs activities and sends notifications
**Features:**
- Action logging for all critical operations
- User tracking with IP addresses
- Activity timestamps
- Notification creation for stakeholders
- Notification read status tracking
- Message customization based on action
**Key Tracked Actions:**
- User registration
- Login attempts
- Appointment bookings and cancellations
- Doctor and slot management
- Billing and payment changes
- Admin status updates

---

## SECTION 8: HARDWARE REQUIREMENTS (Pages 31-32)

### 8.1 Minimum Hardware Requirements

**For Development:**
- **Processor:** Intel Core i5 (6th Gen) or equivalent
- **RAM:** 8 GB minimum
- **Storage:** 256 GB SSD (100 GB for project and dependencies)
- **Display:** 1920x1080 resolution

**For Production Server:**
- **Processor:** Intel Xeon E5-2630v4 or equivalent (4 cores minimum)
- **RAM:** 16 GB minimum
- **Storage:** 500 GB SSD (Fast I/O crucial for database operations)
- **Network:** 1 Gbps dedicated connection

### 8.2 Recommended Hardware Requirements

**For Development:**
- **Processor:** Intel Core i7 (10th Gen) or newer / AMD Ryzen 5 5600X or newer
- **RAM:** 16 GB or more
- **Storage:** 512 GB SSD
- **Display:** 27" 2560x1440 (for comfortable development)
- **Networking:** Gigabit Ethernet or WiFi 6

**For Production Server:**
- **Processor:** Intel Xeon Platinum 8280 or equivalent (8+ cores)
- **RAM:** 32 GB or more
- **Storage:** 1 TB SSD (RAID configuration recommended)
- **Redundant Power Supply:** Dual PSU
- **Cooling:** Enterprise-grade thermal management
- **Network:** Redundant 10 Gbps connections

### 8.3 Cloud Infrastructure (Recommended for Deployment)

**AWS Recommendations:**
- **Compute:** EC2 t3.medium or larger (for backend)
- **Database:** RDS PostgreSQL db.t3.micro (for scalability)
- **Storage:** S3 for document backups
- **CDN:** CloudFront for static frontend assets
- **Load Balancer:** Application Load Balancer for traffic distribution

**Azure Recommendations:**
- **Compute:** App Service B2 or higher
- **Database:** Azure Database for PostgreSQL - Single Server
- **Storage:** Azure Blob Storage for documents
- **CDN:** Azure CDN for static content
- **Load Balancer:** Azure Application Gateway

---

## SECTION 9: SOFTWARE REQUIREMENTS (Pages 33-37)

### 9.1 Backend Requirements

**Framework & Runtime:**
- Python 3.9 or higher
- FastAPI 0.115.5 (Web framework)
- Uvicorn 0.32.1 (ASGI server)

**Database & ORM:**
- SQLite 3.x (Development) / PostgreSQL 12+ (Production)
- SQLAlchemy 2.0.36 (ORM)

**Authentication & Security:**
- python-jose[cryptography] 3.3.0 (JWT handling)
- passlib[bcrypt] 1.7.4 (Password hashing)
- bcrypt 3.2.2 (Cryptographic hashing)

**API & Validation:**
- pydantic[email] 2.10.2 (Data validation)
- python-multipart 0.0.17 (File upload handling)

**Development Tools:**
- pip (Python package manager)
- Virtual environment (venv or virtualenv)

### 9.2 Frontend Requirements

**Runtime & Build Tools:**
- Node.js 16.x or higher
- npm 8.x or higher
- Vite 5.4.11 (Build tool and dev server)

**Framework & Libraries:**
- React 18.3.1 (UI library)
- React DOM 18.3.1 (React rendering)
- React Router DOM 6.30.1 (Client-side routing)

**Development Dependencies:**
- @vitejs/plugin-react 4.3.4 (React plugin for Vite)

**Additional Tools:**
- npm or yarn (Package management)

### 9.3 DevOps & Deployment Requirements

**Version Control:**
- Git 2.30 or higher
- GitHub / GitLab for repository management

**Containerization (Optional but Recommended):**
- Docker 20.10 or higher
- Docker Compose 2.0 or higher

**Monitoring & Logging:**
- Python logging module (built-in)
- FastAPI logging integration

**Web Server (Production):**
- Nginx (Reverse proxy and static file serving)
- Gunicorn (ASGI server for production)

### 9.4 Operating System Requirements

**Development:**
- Windows 10/11 (64-bit)
- macOS 10.15 or higher
- Linux (Ubuntu 18.04 or higher, CentOS 7 or higher)

**Production:**
- Linux (Ubuntu 20.04 LTS or higher - recommended)
- CentOS 8 or higher
- Amazon Linux 2
- Any POSIX-compliant operating system

### 9.5 Browser Requirements (Frontend)

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Minimum 1920x1080 resolution for optimal experience

---

## SECTION 10: DATABASE DESIGN (ER DIAGRAM) (Pages 38-42)

**Note:** Insert ERD.jpg from project root here

**Database Tables Summary:**

### Core Tables:

1. **accounts**
   - account_id (PK)
   - role (PATIENT/HOSPITAL/ADMIN)
   - email (UNIQUE)
   - phone (UNIQUE)
   - password_hash
   - is_active
   - failed_login_attempts
   - locked_until
   - created_at, updated_at

2. **patient_profiles**
   - patient_id (PK, FK→accounts)
   - full_name
   - dob
   - gender
   - locality_id (FK)
   - address_line
   - emergency_contact

3. **hospital_profiles**
   - hospital_id (PK, FK→accounts)
   - hospital_name
   - registration_no (UNIQUE)
   - locality_id (FK)
   - contact_phone
   - onboarding_status

4. **localities**
   - locality_id (PK)
   - name (UNIQUE)
   - city

5. **specialties**
   - specialty_id (PK)
   - name (UNIQUE)
   - description

6. **medical_conditions**
   - condition_id (PK)
   - name (UNIQUE)
   - description

7. **condition_specialties** (Many-to-Many)
   - condition_specialty_id (PK)
   - condition_id (FK)
   - specialty_id (FK)

8. **doctors**
   - doctor_id (PK)
   - hospital_id (FK)
   - specialty_id (FK)
   - full_name
   - experience_years
   - consultation_fee
   - is_active

9. **doctor_slots**
   - slot_id (PK)
   - doctor_id (FK)
   - slot_date
   - start_time
   - end_time
   - slot_status

10. **appointments**
    - appointment_id (PK)
    - patient_id (FK)
    - hospital_id (FK)
    - doctor_id (FK)
    - slot_id (FK)
    - condition_id (FK)
    - appointment_status
    - created_at

11. **prescriptions**
    - prescription_id (PK)
    - appointment_id (FK)
    - doctor_id (FK)
    - diagnosis
    - advice
    - file_url
    - issued_at

12. **bills**
    - bill_id (PK)
    - appointment_id (FK)
    - patient_id (FK)
    - hospital_id (FK)
    - total_amount
    - payment_status
    - generated_at

13. **reports**
    - report_id (PK)
    - appointment_id (FK)
    - patient_id (FK)
    - hospital_id (FK)
    - report_type
    - file_url
    - uploaded_at

14. **audit_logs**
    - log_id (PK)
    - actor_account_id (FK)
    - action
    - entity_name
    - entity_id
    - ip_address
    - created_at

15. **notifications**
    - notification_id (PK)
    - account_id (FK)
    - message
    - is_read
    - created_at

---

## SECTION 11: DATA FLOW DIAGRAM (DFD) (Pages 43-46)

**Note:** Insert DFD.jpg from project root here

**Context Diagram Description:**
- External entities: Patient, Hospital, Admin
- Main system: Smart Clinic Management System
- Data flows: Registration, Appointment booking, Document management, Monitoring

**Level 1 DFD Processes:**
1. User Management & Authentication
2. Hospital Discovery & Management
3. Appointment Lifecycle
4. Document Management
5. Billing & Reporting
6. Admin Monitoring

---

## SECTION 12: SYSTEM ARCHITECTURE (Pages 47-50)

### 12.1 Three-Tier Architecture

**Presentation Layer (Frontend):**
- React-based single-page application
- Components: Login, Register, Dashboard (Patient/Hospital/Admin)
- Routing: React Router for navigation
- State Management: React Context API
- API Communication: REST endpoints
- Responsive Design: Mobile and desktop support

**Business Logic Layer (Backend):**
- FastAPI server running on port 8000
- Endpoint organization by functionality
- Request validation through Pydantic
- Authentication middleware
- Role-based authorization
- Audit logging and security

**Data Layer (Database):**
- SQLite for development
- Structured tables with relationships
- Foreign key constraints
- Indexed fields for performance
- Transaction support for data consistency

### 12.2 API Architecture

**RESTful Design Principles:**
- Resource-based URLs
- Standard HTTP methods (GET, POST, PATCH, DELETE)
- JSON request/response format
- Status codes for operation results
- Error handling with meaningful messages

**API Endpoint Organization:**
- /api/v1/auth - Authentication
- /api/v1/lookups - Reference data
- /api/v1/discovery - Hospital and doctor discovery
- /api/v1/patient - Patient operations
- /api/v1/hospital - Hospital operations
- /api/v1/admin - Administrative functions

### 12.3 Security Architecture

**Authentication & Authorization:**
- User credentials validated against password hash
- JWT token generated on successful login
- Token includes user ID and role
- Token validated for protected endpoints
- Role-based access control (RBAC)
- Account lockout after failed attempts

**Data Protection:**
- Password hashing with bcrypt
- CORS enabled for trusted domains only
- Input validation through Pydantic
- SQL injection prevention through ORM
- Audit trails for accountability

---

## SECTION 13: SYSTEM MODULES DETAILED FLOW (Pages 51-55)

### 13.1 User Registration Flow

```
1. User selects registration type (Patient/Hospital)
2. Enters required information
3. System validates input (Pydantic schemas)
4. Checks for duplicate email/phone
5. Generates password hash (bcrypt)
6. Creates account and profile records
7. Logs registration action (audit log)
8. Returns account details with token
```

### 13.2 Appointment Booking Flow

```
1. Patient discovers hospitals by locality
2. Selects hospital and specialty
3. Views available doctors
4. Selects doctor and available slot
5. System verifies:
   - Doctor exists and is active
   - Hospital is approved
   - Slot is available
   - Slot date is not in past
6. Creates appointment record
7. Updates slot status to BOOKED
8. Logs action and creates notifications
9. Returns appointment confirmation
```

### 13.3 Prescription Management Flow

```
1. Appointment status updated to COMPLETED by hospital
2. Hospital creates prescription with:
   - Diagnosis
   - Medical advice
   - File upload
3. System stores prescription record
4. Links prescription to appointment
5. Logs action
6. Notifies patient of new prescription
7. Patient can access through documents page
```

### 13.4 Admin Approval Workflow

```
1. Hospital registers with system
2. Status set to PENDING
3. Admin views hospital list
4. Admin reviews hospital details
5. Admin approves or rejects
6. Hospital status updated
7. Hospital receives notification
8. Approved hospitals can add doctors and create appointments
```

---

## SECTION 14: IMPLEMENTATION DETAILS (Pages 56-65)

### 14.1 Backend Implementation

**Project Structure:**
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py (FastAPI app initialization)
│   ├── api/
│   │   ├── router.py (API router configuration)
│   │   └── endpoints/
│   │       ├── auth.py (Authentication endpoints)
│   │       ├── patient.py (Patient endpoints)
│   │       ├── hospital.py (Hospital endpoints)
│   │       ├── admin.py (Admin endpoints)
│   │       ├── discovery.py (Discovery endpoints)
│   │       └── lookups.py (Reference data endpoints)
│   ├── core/
│   │   ├── config.py (Configuration settings)
│   │   ├── security.py (Security functions)
│   │   ├── deps.py (Dependency injection)
│   │   └── audit.py (Audit logging)
│   ├── db/
│   │   ├── session.py (Database session)
│   │   ├── seed.py (Data seeding)
│   │   └── __init__.py
│   ├── models/
│   │   ├── models.py (Database models)
│   │   ├── enums.py (Enumerations)
│   │   └── __init__.py
│   └── schemas/
│       └── (Pydantic request/response models)
├── requirements.txt
└── .env.example
```

**Key Components:**

**1. Authentication Module (auth.py):**
- Patient registration with profile creation
- Hospital registration with onboarding status
- Admin bootstrap (one-time setup)
- Login with JWT token generation
- Account lockout mechanism
- Current user endpoint

**2. Patient Module (patient.py):**
- Appointment booking with validation
- Appointment listing and cancellation
- Document access (prescriptions, bills, reports)
- Notification management

**3. Hospital Module (hospital.py):**
- Hospital profile management
- Doctor CRUD operations
- Slot bulk creation and management
- Appointment lifecycle management
- Prescription, bill, and report creation
- Document upload handling

**4. Admin Module (admin.py):**
- System overview dashboard
- Account management and activation
- Hospital approval workflow
- Audit log viewing

**5. Discovery Module (discovery.py):**
- Hospital search by locality
- Doctor search by specialty
- Condition-specialty mapping

### 14.2 Frontend Implementation

**Project Structure:**
```
frontend/
├── src/
│   ├── main.jsx (Entry point)
│   ├── App.jsx (Route configuration)
│   ├── styles.css (Global styles)
│   ├── api/ (API communication)
│   ├── auth/ (Authentication context)
│   ├── components/ (Reusable components)
│   ├── pages/ (Page components)
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPatientPage.jsx
│   │   ├── RegisterHospitalPage.jsx
│   │   ├── patient/
│   │   │   └── PatientDashboard.jsx
│   │   ├── hospital/
│   │   │   └── HospitalDashboard.jsx
│   │   └── admin/
│   │       └── AdminDashboard.jsx
│   └── ...
├── package.json
└── vite.config.js
```

**Key Pages:**

**1. Authentication Pages:**
- LoginPage: User login with role selection
- RegisterPatientPage: Patient registration
- RegisterHospitalPage: Hospital registration
- AdminLoginPage: Admin login

**2. Patient Dashboard:**
- Hospital discovery interface
- Appointment booking form
- Appointments list
- Documents view (prescriptions, bills, reports)
- Notifications

**3. Hospital Dashboard:**
- Hospital profile display
- Doctor management interface
- Slot creation and management
- Appointment management
- Prescription and bill creation
- Report uploads

**4. Admin Dashboard:**
- System overview with statistics
- Account management interface
- Hospital approval workflow
- Audit log viewer

---

## SECTION 15: MENU DESIGN & SCREEN SHOTS (Pages 66-75)

**Note:** Execute project following the "EXECUTION GUIDE" section below and capture screenshots for:

**Authentication Pages:**
1. Login Page
2. Patient Registration Page
3. Hospital Registration Page
4. Admin Login Page

**Patient Dashboard:**
1. Homepage/Dashboard
2. Hospital Discovery Page
3. Doctor Selection Page
4. Appointment Booking Page
5. My Appointments Page
6. Appointment Cancellation Dialog
7. Documents Page (Prescriptions, Bills, Reports)
8. Notifications Page
9. Mark Notification as Read

**Hospital Dashboard:**
1. Hospital Profile Page
2. Doctors List Page
3. Add New Doctor Page
4. Edit Doctor Page
5. Create Doctor Slots Page
6. Slots Management Page
7. Appointments Management Page
8. Update Appointment Status Page
9. Create Prescription Page
10. Create Bill Page
11. Upload Report Page

**Admin Dashboard:**
1. Admin Overview/Statistics
2. Accounts Management Page
3. Activate/Deactivate Account Dialog
4. Hospitals Management Page
5. Hospital Approval/Rejection Dialog
6. Audit Logs Viewer

---

## SECTION 16: SYSTEM REPORTS (Pages 76-80)

### 16.1 Admin Overview Report

**Purpose:** Provides system-wide statistics

**Data Displayed:**
- Total User Accounts
- Patient Count
- Hospital Count
- Doctor Count
- Total Appointments
- Total Bills
- Total Reports

### 16.2 Hospital Performance Report

**Purpose:** Tracks hospital operations

**Metrics:**
- Doctors on staff
- Scheduled appointments
- Completed appointments
- Pending approvals
- Cancellation rate
- Average consultation fee

### 16.3 Appointment Analytics Report

**Purpose:** Analyzes appointment patterns

**Data:**
- Total appointments by status
- Peak appointment times
- Doctor utilization rates
- Hospital utilization rates
- No-show percentage
- Cancellation reasons

### 16.4 Financial Report

**Purpose:** Tracks billing and payments

**Metrics:**
- Total billing amount
- Unpaid bills
- Partially paid bills
- Paid bills
- Payment collection rate
- Outstanding dues by hospital

### 16.5 Audit & Compliance Report

**Purpose:** Monitors system security and compliance

**Data:**
- Login attempts and successes
- Failed authentication attempts
- Account lockouts
- User registration activities
- Admin actions
- Hospital approvals/rejections

### 16.6 Patient Report

**Purpose:** Individual patient health records

**Contains:**
- Patient demographics
- Medical conditions treated
- Associated doctors
- Appointments history
- Prescriptions
- Medical reports
- Bills and payment status

---

## SECTION 17: TESTING & VALIDATION (Pages 81-83)

### 17.1 Unit Testing

**Backend Testing:**
- Authentication module tests
- Patient registration validation
- Hospital registration validation
- Appointment booking validation
- Slot management logic
- Bill calculation

**Frontend Testing:**
- Component rendering
- Form validation
- Route protection
- API communication

### 17.2 Integration Testing

- End-to-end appointment booking flow
- Patient registration to appointment completion
- Hospital approval workflow
- Document upload and retrieval

### 17.3 Performance Testing

- API response times
- Database query optimization
- Frontend load times
- Concurrent user handling
- File upload performance

### 17.4 Security Testing

- SQL injection prevention
- XSS protection
- Authentication bypass attempts
- Authorization validation
- File upload security

---

## SECTION 18: CONCLUSION (Pages 84-85)

The Smart Clinic Management System represents a modern solution to healthcare appointment and record management challenges. By leveraging contemporary web technologies and following industry best practices, the system provides:

1. **Improved Patient Experience:**
   - Easy hospital discovery
   - Convenient appointment booking
   - Centralized medical records access
   - Real-time notifications

2. **Enhanced Hospital Efficiency:**
   - Optimized appointment scheduling
   - Reduced no-show rates through reminders
   - Streamlined patient flow
   - Digital record management

3. **Administrative Oversight:**
   - Comprehensive system monitoring
   - Audit trails for compliance
   - Data-driven insights
   - Centralized control

4. **Scalability & Sustainability:**
   - Modern technology stack
   - Cloud-ready architecture
   - Extensible design for future features
   - Low operational costs

The project successfully demonstrates the feasibility of applying full-stack web development to solve real-world healthcare management problems. Future enhancements could include SMS/Email notifications, payment gateway integration, mobile native applications, and AI-driven doctor recommendations.

---

## SECTION 19: BIBLIOGRAPHY (Pages 86-90)

1. FastAPI Official Documentation. (2024). https://fastapi.tiangolo.com/
   - Comprehensive guide to FastAPI framework, ASGI servers, and best practices

2. React Official Documentation. (2024). https://react.dev/
   - React hooks, component lifecycle, state management patterns

3. SQLAlchemy Documentation. (2024). https://docs.sqlalchemy.org/
   - ORM patterns, database design, query optimization

4. Pydantic Documentation. (2024). https://docs.pydantic.dev/
   - Data validation, serialization, schema definition

5. Sommerville, I. (2015). Software Engineering (10th ed.). Pearson Education.
   - System design principles, architectural patterns, software quality

6. OWASP - Open Web Application Security Project. (2024). https://owasp.org/
   - Security best practices, authentication, authorization, data protection

7. Fowler, M. (2002). Patterns of Enterprise Application Architecture. Addison-Wesley.
   - Design patterns, architectural styles, enterprise systems

8. Pressman, R. S., & Maxim, B. R. (2014). Software Engineering: A Practitioner's Approach (8th ed.).
   - Software development lifecycle, testing strategies, quality assurance

9. Google Cloud - Best Practices for Healthcare APIs. (2024). https://cloud.google.com/solutions/healthcare-api
   - HIPAA compliance, healthcare data security, privacy

10. Sustainable Healthcare Systems - WHO Guidelines. (2023).
    - Healthcare management, patient care optimization, system sustainability

---

---

# EXECUTION GUIDE: HOW TO RUN THE PROJECT & CAPTURE SCREENSHOTS

## STEP-BY-STEP EXECUTION INSTRUCTIONS

### PREREQUISITES
1. Windows 10/11 or any OS with Python 3.9+ and Node.js 16+
2. Visual Studio Code or any text editor
3. Command line access (PowerShell on Windows, Terminal on Mac/Linux)
4. Git installed

---

### STEP 1: CLONE OR DOWNLOAD THE PROJECT

```bash
# Clone the repository
git clone https://github.com/numan79969/Smart_clinic_management_system.git

# Navigate to project directory
cd Smart_clinic_management_system
```

---

### STEP 2: SETUP BACKEND (FASTAPI)

**2.1 Create Virtual Environment:**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1

# On Mac/Linux:
source .venv/bin/activate
```

**2.2 Install Backend Dependencies:**

```bash
pip install -r requirements.txt
```

**2.3 Setup Environment File:**

```bash
# Copy the example environment file
cp .env.example .env

# Or on Windows (PowerShell):
Copy-Item .env.example .env
```

Edit `.env` file if needed (defaults are fine for development):
```
SCMS_SECRET_KEY=change-this-secret-key
SCMS_TOKEN_EXPIRE_MINUTES=120
SCMS_LOGIN_LOCK_MINUTES=15
SCMS_DATABASE_URL=sqlite:///./scms.db
SCMS_UPLOAD_DIR=./uploads
SCMS_MAX_UPLOAD_BYTES=5242880
SCMS_SEED_ADMIN_EMAIL=admin@scms.app
SCMS_SEED_ADMIN_PHONE=+10000000000
SCMS_SEED_ADMIN_PASSWORD=Admin@12345
```

**2.4 Run Backend Server:**

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

**API Documentation:**
- Open browser and go to: http://127.0.0.1:8000/docs
- This shows all available API endpoints (VERY USEFUL)

**Keep this terminal running. Do NOT close it.**

---

### STEP 3: SETUP FRONTEND (REACT)

**In a NEW terminal window/tab:**

```bash
# Navigate to project root (if not already there)
cd Smart_clinic_management_system

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

**3.1 Run Frontend Dev Server:**

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.4.11  ready in XXX ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  press h to show help
```

**Access the Application:**
- Open browser and go to: http://127.0.0.1:5173/
- You should see the login page

**Keep this terminal running in a separate window.**

---

### STEP 4: TEST THE APPLICATION & CAPTURE SCREENSHOTS

**IMPORTANT:** Browser window must be at least 1920x1080 for good screenshots.

### 4.1 AUTHENTICATION PAGES (Screenshots 1-4)

**Screenshot 1: Login Page**
1. Open http://127.0.0.1:5173/
2. You should see login form with email and password
3. Take screenshot of the login page

**Screenshot 2: Patient Registration**
1. Click "Register as Patient" link
2. Fill in sample data:
   - Email: patient1@example.com
   - Phone: +919876543210
   - Password: Patient@123
   - Full Name: John Doe
   - DOB: 1995-05-15
   - Gender: Male
3. Take screenshot before clicking submit

**Screenshot 3: Hospital Registration**
1. Go back and click "Register as Hospital"
2. Fill in sample data:
   - Email: hospital1@example.com
   - Phone: +919876543211
   - Password: Hospital@123
   - Hospital Name: Apollo Hospital
   - Registration No: REG12345678
   - Contact Phone: +919876543211
   - Select Locality
3. Take screenshot

**Screenshot 4: Admin Login**
1. Click "Admin Login" link
2. Use credentials:
   - Email: admin@scms.app
   - Password: Admin@12345
3. Take screenshot of admin login form

### 4.2 PATIENT FLOW (Screenshots 5-15)

**Screenshot 5: Patient Dashboard (After Login)**
1. Login as: patient1@example.com / Patient@123
2. You should see patient dashboard
3. Take screenshot showing dashboard options

**Screenshot 6: Hospital Discovery**
1. Click "Find Hospitals" or "Discover Hospitals"
2. Select a locality
3. View list of hospitals
4. Take screenshot

**Screenshot 7: Doctor Selection**
1. Click on a hospital to view doctors
2. Or search by specialty
3. View available doctors with fees
4. Take screenshot

**Screenshot 8: Appointment Booking**
1. Click "Book Appointment" on a doctor
2. Select medical condition
3. View available slots
4. Select a slot
5. Take screenshot of booking form

**Screenshot 9: Appointment Confirmation**
1. Complete booking
2. See confirmation message
3. Take screenshot

**Screenshot 10: My Appointments**
1. Navigate to "My Appointments"
2. View list of booked appointments
3. Take screenshot

**Screenshot 11: Cancel Appointment**
1. Click on an appointment
2. Click "Cancel Appointment"
3. Confirm cancellation
4. Take screenshot of cancellation dialog

**Screenshot 12: Documents (Prescriptions)**
1. Go to "My Documents"
2. View Prescriptions section
3. Take screenshot (may be empty if no completed appointments)

**Screenshot 13: Notifications**
1. Click on "Notifications" menu
2. View notification list
3. Take screenshot

**Screenshot 14: Notification Details**
1. Click on a notification
2. Mark as read
3. Take screenshot

**Screenshot 15: Patient Settings/Profile**
1. Go to profile section
2. View patient information
3. Take screenshot

### 4.3 HOSPITAL FLOW (Screenshots 16-26)

**Register and login as Hospital first:**

1. Open http://127.0.0.1:5173/register/hospital
2. Register with:
   - Email: hospital2@example.com
   - Password: Hospital@123
   - Hospital Name: Max Healthcare
   - Registration: REG87654321

**After admin approval (skip if using test data), login and continue:**

**Screenshot 16: Hospital Dashboard**
1. Login as hospital2@example.com / Hospital@123
2. See hospital dashboard
3. Take screenshot

**Screenshot 17: Hospital Profile**
1. Click "Hospital Profile"
2. View hospital details
3. Take screenshot

**Screenshot 18: Doctors List**
1. Click "My Doctors"
2. View list of doctors (initially empty)
3. Take screenshot

**Screenshot 19: Add New Doctor**
1. Click "Add Doctor"
2. Fill in:
   - Name: Dr. Amit Kumar
   - Specialty: Cardiology
   - Experience: 10 years
   - Fee: 500
3. Take screenshot of form

**Screenshot 20: Doctor Added**
1. Submit form
2. See success message
3. Take screenshot

**Screenshot 21: Create Doctor Slots**
1. Click on doctor
2. Click "Create Slots"
3. Set slot dates and times
4. Take screenshot of slot creation form

**Screenshot 22: Slots Management**
1. Navigate to "Manage Slots"
2. View all slots with status
3. Take screenshot

**Screenshot 23: Appointments List**
1. Click "Appointments"
2. View appointments for this hospital
3. Take screenshot

**Screenshot 24: Update Appointment Status**
1. Click on appointment
2. Change status (e.g., BOOKED to CONFIRMED)
3. Take screenshot of status update dialog

**Screenshot 25: Create Prescription**
1. Open appointment
2. Click "Add Prescription"
3. Fill in diagnosis and advice
4. Take screenshot

**Screenshot 26: Create Bill**
1. Open appointment
2. Click "Generate Bill"
3. Enter amount
4. Take screenshot

**Screenshot 27: Upload Report**
1. Click "Upload Report"
2. Select file
3. Enter report type
4. Take screenshot

### 4.4 ADMIN FLOW (Screenshots 28-35)

**Screenshot 28: Admin Dashboard**
1. Login as admin@scms.app / Admin@12345
2. See admin dashboard with statistics
3. Take screenshot showing overview statistics

**Screenshot 29: System Overview**
1. View dashboard metrics:
   - Total Accounts
   - Patients Count
   - Hospitals Count
   - Doctors Count
   - Appointments Count
2. Take screenshot

**Screenshot 30: Accounts Management**
1. Click "Accounts Management"
2. View all accounts with roles
3. Take screenshot

**Screenshot 31: Account Activation**
1. Click on account
2. Deactivate/Activate toggle
3. Take screenshot of action

**Screenshot 32: Hospitals Approval**
1. Click "Hospitals"
2. View pending hospitals
3. Take screenshot

**Screenshot 33: Hospital Approval Dialog**
1. Click on pending hospital
2. Approve/Reject
3. Take screenshot of approval action

**Screenshot 34: Audit Logs**
1. Click "Audit Logs"
2. View system activities
3. Take screenshot of audit log entries

**Screenshot 35: Audit Log Details**
1. View detailed audit information
2. Take screenshot

---

### STEP 5: INSERT DIAGRAMS

**Screenshot 36: Add DFD**
1. Insert DFD.jpg from project root
2. Add caption: "Data Flow Diagram - Smart Clinic Management System"

**Screenshot 37: Add ERD**
1. Insert ERD.jpg from project root (or erd_clean.png)
2. Add caption: "Entity Relationship Diagram - Database Schema"

---

## CREATING THE WORD DOCUMENT

### Steps to Create Report in Word:

1. **Open Microsoft Word**
   - File → New → Blank Document

2. **Set Page Margins** (Layout → Margins)
   - Left: 1.5"
   - Right: 1"
   - Top: 1"
   - Bottom: 1"

3. **Set Default Font** (Home → Font)
   - Font: Times New Roman
   - Size: 14 pt

4. **Set Line Spacing** (Home → Line Spacing)
   - 1.5 lines

5. **Copy Content**
   - Copy each section from this guide
   - Paste into Word document
   - Format headings:
     - Main Headings: 20 pt, Bold
     - Sub-headings: 16 pt, Bold
     - Body text: 14 pt

6. **Insert Page Numbers**
   - Insert → Page Numbers
   - Position: Bottom Right

7. **Insert Header/Footer**
   - Insert → Header/Footer
   - Add: Course code, college name (10 pt)

8. **Insert Screenshots**
   - Insert → Pictures
   - Insert captured screenshots
   - Add captions below each screenshot

9. **Insert Table of Contents**
   - References → Table of Contents
   - Auto-generate from headings

10. **Save Document**
    - File → Save As
    - Format: .docx
    - Name: Smart_Clinic_Management_System_Report.docx

---

## TROUBLESHOOTING

### Backend Issues:

**Port 8000 already in use:**
```bash
# Find process using port 8000
# Windows: netstat -ano | findstr :8000
# Kill process: taskkill /PID <PID> /F

# Try different port:
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

**Database errors:**
```bash
# Delete old database
rm backend/scms.db

# Restart backend to recreate database
```

**Module not found errors:**
```bash
# Ensure virtual environment is activated
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues:

**Port 5173 already in use:**
```bash
npm run dev -- --port 5174
```

**Module dependency errors:**
```bash
# Clear node modules and reinstall
rm -r node_modules
npm install
```

**API connection errors:**
1. Ensure backend is running on port 8000
2. Check CORS settings in backend
3. Verify frontend .env has correct API URL

---

## DETAILED SCREENSHOT CHECKLIST

Use this to ensure you capture all necessary screenshots:

**Authentication (4 screenshots)**
- [ ] Login page
- [ ] Patient registration page
- [ ] Hospital registration page
- [ ] Admin login page

**Patient Features (11 screenshots)**
- [ ] Patient dashboard
- [ ] Hospital discovery
- [ ] Doctor selection
- [ ] Appointment booking form
- [ ] Appointment confirmation
- [ ] My appointments list
- [ ] Appointment cancellation
- [ ] Prescriptions/Documents
- [ ] Notifications list
- [ ] Mark notification as read
- [ ] Patient profile

**Hospital Features (11 screenshots)**
- [ ] Hospital dashboard
- [ ] Hospital profile
- [ ] Doctors list
- [ ] Add new doctor form
- [ ] Doctor added confirmation
- [ ] Create doctor slots form
- [ ] Slots management
- [ ] Appointments list
- [ ] Update appointment status
- [ ] Create prescription form
- [ ] Create bill form

**Admin Features (8 screenshots)**
- [ ] Admin dashboard with statistics
- [ ] System overview
- [ ] Accounts management
- [ ] Account activation/deactivation
- [ ] Hospitals approval pending list
- [ ] Hospital approval dialog
- [ ] Audit logs list
- [ ] Audit log details

**System Diagrams (2 screenshots)**
- [ ] Data Flow Diagram (DFD.jpg)
- [ ] Entity Relationship Diagram (ERD.jpg)

**TOTAL: 36+ Screenshots**

---

## FINAL DOCUMENT CHECKLIST

Before submission, ensure your Word document contains:

**Content Sections:**
- [ ] Title Page
- [ ] Acknowledgement
- [ ] Certificate of Approval
- [ ] Table of Contents
- [ ] Introduction
- [ ] Organizational Study
- [ ] Problem Identification
- [ ] Disadvantages of Current System
- [ ] Advantages of Proposed System
- [ ] Feasibility Analysis
- [ ] System Modules (12 modules)
- [ ] Hardware Requirements
- [ ] Software Requirements
- [ ] Database Design with ERD
- [ ] Data Flow Diagram
- [ ] System Architecture
- [ ] Implementation Details
- [ ] Menu Design & Screenshots (36+)
- [ ] System Reports
- [ ] Testing & Validation
- [ ] Conclusion
- [ ] Bibliography

**Formatting:**
- [ ] Font: Times New Roman throughout
- [ ] Main headings: 20 pt, Bold
- [ ] Sub-headings: 16 pt, Bold
- [ ] Body text: 14 pt
- [ ] Header/Footer: 10 pt
- [ ] Margins: Left 1.5", Right 1", Top 1", Bottom 1"
- [ ] Line spacing: 1.5
- [ ] Page numbers on every page
- [ ] Header with college/course info

**Quality:**
- [ ] Minimum 60 pages
- [ ] Maximum 90 pages
- [ ] No unnecessary content
- [ ] All 36+ screenshots included
- [ ] DFD and ERD diagrams included
- [ ] Professional formatting
- [ ] No spelling/grammar errors
- [ ] Table of contents working (auto-generated)

---

**ESTIMATED WORD COUNT:** 65-80 pages when properly formatted with screenshots

