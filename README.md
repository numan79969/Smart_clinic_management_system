# Smart Clinic Management System

A full-stack implementation of the provided synopsis using:

- Backend: FastAPI
- Frontend: React (Vite)
- Database: SQLite

## Implemented Synopsis Modules

- User registration and authentication (`PATIENT`, `HOSPITAL`, `ADMIN`)
- Hospital discovery by locality and condition-driven recommendation
- Condition-to-specialty mapping and doctor listing
- Appointment and slot lifecycle management (`BOOKED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`)
- Prescription, bill, and report management with upload support
- Admin monitoring panel for users, hospitals, and audit logs
- Notification and audit trail support

## Project Structure

```text
backend/
  app/
    api/endpoints/
    core/
    db/
    models/
    schemas/
  uploads/
frontend/
  src/
```

## Backend Setup (FastAPI + SQLite)

1. Open terminal in the workspace root.
2. Install backend dependencies:

```powershell
cd backend
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

3. (Optional) copy environment file:

```powershell
Copy-Item .env.example .env
```

4. Run backend server:

```powershell
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

5. Open API docs:

- http://127.0.0.1:8000/docs

### Default Seed Admin

Seeded during first startup (configurable in backend `.env.example`):

- Email: `admin@scms.app`
- Password: `Admin@12345`

## Frontend Setup (React)

1. Open a second terminal in workspace root.
2. Install frontend dependencies:

```powershell
cd frontend
npm install
```

3. (Optional) copy environment file:

```powershell
Copy-Item .env.example .env
```

4. Run frontend dev server:

```powershell
npm run dev
```

5. Open frontend app:

- http://127.0.0.1:5173

## Important API Groups

- `POST /api/v1/auth/register/patient`
- `POST /api/v1/auth/register/hospital`
- `POST /api/v1/auth/login`
- `GET /api/v1/lookups/*`
- `GET /api/v1/discovery/*`
- `POST/GET/PATCH /api/v1/patient/*`
- `POST/GET/PATCH /api/v1/hospital/*`
- `GET/PATCH /api/v1/admin/*`

## Security and Controls Included

- Password hashing (`passlib`/bcrypt)
- JWT bearer authentication
- Role-based access controls for all protected routes
- Account lockout after repeated failed login attempts
- Upload validation for extension and file size
- Audit log creation for critical actions

## Notes

- SQLite schema auto-creates on startup.
- Reference data (localities, specialties, conditions, mappings) auto-seeds on startup.
- Hospitals must be admin-approved before operational actions.
