from urllib.parse import urlencode

import httpx

from app.core.config import settings


def provider_for_country(country: str) -> str:
    normalized_country = country.strip().lower()
    if normalized_country in {"ethiopia", "et", "ethiopian"}:
        return "chapa"
    return "stripe"


def tx_ref_for_transaction(transaction_id: int) -> str:
    return f"fluential-{transaction_id}"


def build_checkout_url(provider: str, transaction_id: int, tx_ref: str | None = None) -> str:
    normalized_provider = provider.strip().lower()
    if normalized_provider == "chapa":
        if tx_ref:
            query = urlencode({"tx_ref": tx_ref})
            return (
                f"{settings.payment_callback_base_url.rstrip('/')}"
                f"{settings.api_prefix}/payments/chapa/callback?{query}"
            )
        return f"{settings.payment_callback_base_url.rstrip('/')}/payments/placeholder/{transaction_id}"
    return f"https://checkout.stripe.com/pay/test_{transaction_id}"


def provider_is_configured(provider: str) -> bool:
    normalized_provider = provider.strip().lower()
    if normalized_provider == "chapa":
        return bool(settings.chapa_secret_key)
    return bool(settings.stripe_secret_key)


def initialize_chapa_checkout(
    *,
    tx_ref: str,
    amount_usd: int,
    email: str,
    full_name: str,
    transaction_id: int,
) -> str:
    endpoint = f"{settings.chapa_base_url.rstrip('/')}/transaction/initialize"
    first_name, _, last_name = full_name.strip().partition(" ")
    callback_url = build_checkout_url("chapa", transaction_id, tx_ref=tx_ref)
    payload = {
        "amount": str(amount_usd),
        "currency": "USD",
        "email": email,
        "first_name": first_name or "Student",
        "last_name": last_name or "User",
        "tx_ref": tx_ref,
        "callback_url": callback_url,
        "return_url": callback_url,
        "customization[title]": "Fluential Course Checkout",
        "customization[description]": "Course payment",
    }
    headers = {"Authorization": f"Bearer {settings.chapa_secret_key}"}
    with httpx.Client(timeout=30.0) as client:
        response = client.post(endpoint, data=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    status = str(data.get("status", "")).lower()
    checkout_url = data.get("data", {}).get("checkout_url")
    if status != "success" or not checkout_url:
        raise ValueError("Failed to initialize Chapa checkout")
    return checkout_url


def verify_chapa_transaction(tx_ref: str) -> dict:
    endpoint = f"{settings.chapa_base_url.rstrip('/')}/transaction/verify/{tx_ref}"
    headers = {"Authorization": f"Bearer {settings.chapa_secret_key}"}
    with httpx.Client(timeout=30.0) as client:
        response = client.get(endpoint, headers=headers)
        response.raise_for_status()
        return response.json()


def chapa_payment_successful(verification: dict) -> bool:
    api_status = str(verification.get("status", "")).lower()
    payment_status = str(verification.get("data", {}).get("status", "")).lower()
    return api_status == "success" and payment_status == "success"
