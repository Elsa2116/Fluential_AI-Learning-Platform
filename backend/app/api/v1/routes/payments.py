from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Course, Enrollment, PaymentTransaction, User
from app.schemas.schemas import (
    PaymentConfirmRequest,
    PaymentInitRequest,
    PaymentInitResponse,
    PaymentStatusResponse,
)
from app.services.payment import build_checkout_url, provider_for_country, provider_is_configured

router = APIRouter(tags=["payments"])


@router.post("/payments/initialize", response_model=PaymentInitResponse)
def initialize_payment(payload: PaymentInitRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not user or not course:
        raise HTTPException(status_code=404, detail="User or course not found")
    if not course.is_published:
        raise HTTPException(status_code=400, detail="Course is not published")

    provider = provider_for_country(user.country)
    existing_pending = (
        db.query(PaymentTransaction)
        .filter(
            PaymentTransaction.user_id == user.id,
            PaymentTransaction.course_id == course.id,
            PaymentTransaction.status == "pending",
        )
        .order_by(PaymentTransaction.id.desc())
        .first()
    )
    if existing_pending:
        if not existing_pending.checkout_url:
            existing_pending.checkout_url = build_checkout_url(provider, existing_pending.id)
            db.commit()
            db.refresh(existing_pending)
        return {
            "transaction_id": existing_pending.id,
            "provider": existing_pending.provider,
            "status": existing_pending.status,
            "checkout_url": existing_pending.checkout_url,
        }

    checkout_url = "" if provider_is_configured(provider) else build_checkout_url(provider, 0)
    transaction = PaymentTransaction(
        user_id=user.id,
        course_id=course.id,
        provider=provider,
        amount_usd=payload.amount_usd,
        status="pending",
        checkout_url=checkout_url,
    )
    db.add(transaction)
    db.flush()

    transaction.checkout_url = build_checkout_url(provider, transaction.id)
    db.commit()
    db.refresh(transaction)

    return {
        "transaction_id": transaction.id,
        "provider": transaction.provider,
        "status": transaction.status,
        "checkout_url": transaction.checkout_url,
    }


@router.get("/payments/{transaction_id}", response_model=PaymentStatusResponse)
def get_payment_status(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(PaymentTransaction).filter(PaymentTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {
        "transaction_id": transaction.id,
        "user_id": transaction.user_id,
        "course_id": transaction.course_id,
        "provider": transaction.provider,
        "amount_usd": transaction.amount_usd,
        "status": transaction.status,
        "checkout_url": transaction.checkout_url,
    }


@router.post("/payments/{transaction_id}/confirm")
def confirm_payment(
    transaction_id: int, payload: PaymentConfirmRequest, db: Session = Depends(get_db)
):
    transaction = db.query(PaymentTransaction).filter(PaymentTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.status == "paid":
        return {
            "message": "Payment was already confirmed",
            "transaction_id": transaction.id,
            "status": transaction.status,
        }

    transaction.status = "paid" if payload.paid else "failed"

    if payload.paid:
        enrollment = (
            db.query(Enrollment)
            .filter(
                Enrollment.user_id == transaction.user_id,
                Enrollment.course_id == transaction.course_id,
            )
            .first()
        )
        if not enrollment:
            db.add(Enrollment(user_id=transaction.user_id, course_id=transaction.course_id))

    db.commit()
    return {
        "message": "Payment confirmation processed in test mode",
        "transaction_id": transaction.id,
        "status": transaction.status,
    }
