from fastapi import APIRouter

from app.api.endpoints import admin, auth, discovery, hospital, lookups, patient


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(lookups.router)
api_router.include_router(discovery.router)
api_router.include_router(patient.router)
api_router.include_router(hospital.router)
api_router.include_router(admin.router)
