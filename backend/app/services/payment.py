from app.core.config import settings


def provider_for_country(country: str) -> str:
    normalized_country = country.strip().lower()
    if normalized_country in {"ethiopia", "et", "ethiopian"}:
        return "chapa"
    return "stripe"


def build_checkout_url(provider: str, transaction_id: int) -> str:
    normalized_provider = provider.strip().lower()
    if normalized_provider == "chapa":
        return f"https://api.chapa.co/checkout/test/{transaction_id}"
    return f"https://checkout.stripe.com/pay/test_{transaction_id}"


def provider_is_configured(provider: str) -> bool:
    normalized_provider = provider.strip().lower()
    if normalized_provider == "chapa":
        return bool(settings.chapa_secret_key)
    return bool(settings.stripe_secret_key)
