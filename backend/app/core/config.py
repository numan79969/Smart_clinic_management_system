import os
from functools import lru_cache
from pathlib import Path


class Settings:
    project_name: str = "Smart Clinic Management System"
    api_prefix: str = "/api/v1"
    secret_key: str = os.getenv("SCMS_SECRET_KEY", "change-this-secret-key")
    access_token_expire_minutes: int = int(os.getenv("SCMS_TOKEN_EXPIRE_MINUTES", "120"))
    login_lock_minutes: int = int(os.getenv("SCMS_LOGIN_LOCK_MINUTES", "15"))
    database_url: str = os.getenv(
        "SCMS_DATABASE_URL",
        f"sqlite:///{(Path(__file__).resolve().parents[2] / 'scms.db').as_posix()}",
    )
    uploads_dir: Path = Path(os.getenv("SCMS_UPLOAD_DIR", str(Path(__file__).resolve().parents[2] / "uploads")))
    max_upload_bytes: int = int(os.getenv("SCMS_MAX_UPLOAD_BYTES", str(5 * 1024 * 1024)))
    seed_admin_email: str = os.getenv("SCMS_SEED_ADMIN_EMAIL", "admin@scms.app")
    seed_admin_phone: str = os.getenv("SCMS_SEED_ADMIN_PHONE", "+10000000000")
    seed_admin_password: str = os.getenv("SCMS_SEED_ADMIN_PASSWORD", "Admin@12345")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
