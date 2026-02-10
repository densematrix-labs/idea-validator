"""Token service for managing generation credits."""
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.token import GenerationToken


def get_or_create_token_record(db: Session, device_id: str) -> GenerationToken:
    """Get or create a token record for a device."""
    token = db.query(GenerationToken).filter(
        GenerationToken.device_id == device_id
    ).first()
    
    if not token:
        token = GenerationToken(device_id=device_id)
        db.add(token)
        db.commit()
        db.refresh(token)
    
    return token


def check_can_generate(db: Session, device_id: str) -> Tuple[bool, str]:
    """
    Check if a device can generate a validation.
    
    Returns:
        Tuple of (can_generate, reason)
    """
    token = get_or_create_token_record(db, device_id)
    
    # Check free trial
    if not token.free_trial_used:
        return True, "free_trial"
    
    # Check paid tokens
    if token.tokens_remaining > 0:
        return True, "paid"
    
    return False, "no_tokens"


def use_generation(db: Session, device_id: str) -> bool:
    """
    Use one generation credit.
    
    Returns:
        True if successful, False if no credits available
    """
    token = get_or_create_token_record(db, device_id)
    
    # Use free trial first
    if not token.free_trial_used:
        token.free_trial_used = True
        db.commit()
        return True
    
    # Use paid tokens
    if token.tokens_remaining > 0:
        token.tokens_used += 1
        db.commit()
        return True
    
    return False


def add_tokens(db: Session, device_id: str, tokens: int, payment_id: str, product_sku: str) -> GenerationToken:
    """Add tokens after successful payment."""
    token = get_or_create_token_record(db, device_id)
    token.tokens_total += tokens
    token.payment_id = payment_id
    token.product_sku = product_sku
    db.commit()
    db.refresh(token)
    return token


def get_token_status(db: Session, device_id: str) -> dict:
    """Get token status for a device."""
    token = get_or_create_token_record(db, device_id)
    return {
        "free_trial_used": token.free_trial_used,
        "tokens_total": token.tokens_total,
        "tokens_used": token.tokens_used,
        "tokens_remaining": token.tokens_remaining,
        "can_generate": not token.free_trial_used or token.tokens_remaining > 0,
    }
