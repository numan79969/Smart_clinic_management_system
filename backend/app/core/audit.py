from sqlalchemy.orm import Session

from app.models import AuditLog, Notification


def add_audit_log(
    db: Session,
    action: str,
    entity_name: str,
    actor_account_id: int | None = None,
    entity_id: int | None = None,
    ip_address: str | None = None,
) -> None:
    db.add(
        AuditLog(
            actor_account_id=actor_account_id,
            action=action,
            entity_name=entity_name,
            entity_id=entity_id,
            ip_address=ip_address,
        )
    )


def add_notification(db: Session, account_id: int, message: str) -> None:
    db.add(Notification(account_id=account_id, message=message))
