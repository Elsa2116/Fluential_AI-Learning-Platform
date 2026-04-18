import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Course, Enrollment, PaymentTransaction, User
from app.schemas.schemas import (
    PaymentConfirmRequest,
    PaymentInitRequest,
    PaymentInitResponse,
    PaymentStatusResponse,
    PaymentVerifyRequest,
)
from app.services.payment import (
    build_checkout_url,
    chapa_payment_successful,
    initialize_chapa_checkout,
    provider_for_country,
    provider_is_configured,
    tx_ref_for_transaction,
    verify_chapa_transaction,
)

router = APIRouter(tags=["payments"])


def _mark_transaction_as_paid(transaction: PaymentTransaction, db: Session) -> None:
    transaction.status = "paid"
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


def _transaction_by_tx_ref(tx_ref: str, db: Session) -> PaymentTransaction | None:
    if not tx_ref.startswith("fluential-"):
        return None
    transaction_id_part = tx_ref.removeprefix("fluential-")
    if not transaction_id_part.isdigit():
        return None
    return db.query(PaymentTransaction).filter(PaymentTransaction.id == int(transaction_id_part)).first()


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

    if provider == "chapa" and not provider_is_configured(provider):
        raise HTTPException(status_code=503, detail="Chapa is not configured")

    checkout_url = build_checkout_url(provider, 0)
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

    if provider == "chapa":
        tx_ref = tx_ref_for_transaction(transaction.id)
        try:
            transaction.checkout_url = initialize_chapa_checkout(
                tx_ref=tx_ref,
                amount_usd=transaction.amount_usd,
                email=user.email,
                full_name=user.full_name,
                transaction_id=transaction.id,
            )
        except (httpx.HTTPError, ValueError):
            raise HTTPException(status_code=502, detail="Failed to initialize Chapa checkout")
    else:
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

    if transaction.provider == "chapa":
        raise HTTPException(
            status_code=400,
            detail="Use /payments/chapa/verify or Chapa callback to confirm this transaction",
        )

    if payload.paid:
        _mark_transaction_as_paid(transaction, db)
    else:
        transaction.status = "failed"

    db.commit()
    return {
        "message": "Payment confirmation processed in test mode",
        "transaction_id": transaction.id,
        "status": transaction.status,
    }


@router.post("/payments/chapa/verify")
def verify_chapa_payment(payload: PaymentVerifyRequest, db: Session = Depends(get_db)):
    transaction = _transaction_by_tx_ref(payload.tx_ref, db)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found for tx_ref")
    if transaction.provider != "chapa":
        raise HTTPException(status_code=400, detail="tx_ref does not belong to Chapa transaction")

    try:
        verification = verify_chapa_transaction(payload.tx_ref)
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Failed to verify Chapa transaction")

    if chapa_payment_successful(verification):
        _mark_transaction_as_paid(transaction, db)
    else:
        transaction.status = "failed"
    db.commit()

    return {
        "transaction_id": transaction.id,
        "status": transaction.status,
        "tx_ref": payload.tx_ref,
    }


@router.get("/payments/chapa/callback")
def chapa_callback(tx_ref: str, db: Session = Depends(get_db)):
    transaction = _transaction_by_tx_ref(tx_ref, db)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found for tx_ref")
    if transaction.provider != "chapa":
        raise HTTPException(status_code=400, detail="tx_ref does not belong to Chapa transaction")

    try:
        verification = verify_chapa_transaction(tx_ref)
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Failed to verify Chapa transaction")

    if chapa_payment_successful(verification):
        _mark_transaction_as_paid(transaction, db)
    else:
        transaction.status = "failed"
    db.commit()

    return {
        "message": "Chapa callback processed",
        "transaction_id": transaction.id,
        "status": transaction.status,
        "tx_ref": tx_ref,
    }
