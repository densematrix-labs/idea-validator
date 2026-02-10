"""Tests for token service."""
import pytest
from app.services.token_service import (
    get_or_create_token_record,
    check_can_generate,
    use_generation,
    add_tokens,
    get_token_status,
)


def test_get_or_create_new_device(db):
    """Test creating token record for new device."""
    device_id = "new-device-123"
    token = get_or_create_token_record(db, device_id)
    
    assert token is not None
    assert token.device_id == device_id
    assert token.tokens_total == 0
    assert token.tokens_used == 0
    assert token.free_trial_used is False


def test_get_or_create_existing_device(db):
    """Test getting existing token record."""
    device_id = "existing-device-123"
    
    # Create first
    token1 = get_or_create_token_record(db, device_id)
    token1.tokens_total = 5
    db.commit()
    
    # Get again
    token2 = get_or_create_token_record(db, device_id)
    assert token2.id == token1.id
    assert token2.tokens_total == 5


def test_check_can_generate_free_trial(db):
    """Test checking generation with free trial available."""
    device_id = "trial-device"
    can_generate, reason = check_can_generate(db, device_id)
    
    assert can_generate is True
    assert reason == "free_trial"


def test_check_can_generate_paid(db):
    """Test checking generation with paid tokens."""
    device_id = "paid-device"
    token = get_or_create_token_record(db, device_id)
    token.free_trial_used = True
    token.tokens_total = 10
    db.commit()
    
    can_generate, reason = check_can_generate(db, device_id)
    assert can_generate is True
    assert reason == "paid"


def test_check_can_generate_no_tokens(db):
    """Test checking generation with no tokens."""
    device_id = "exhausted-device"
    token = get_or_create_token_record(db, device_id)
    token.free_trial_used = True
    token.tokens_total = 0
    db.commit()
    
    can_generate, reason = check_can_generate(db, device_id)
    assert can_generate is False
    assert reason == "no_tokens"


def test_use_generation_free_trial(db):
    """Test using free trial."""
    device_id = "use-trial-device"
    
    result = use_generation(db, device_id)
    assert result is True
    
    token = get_or_create_token_record(db, device_id)
    assert token.free_trial_used is True


def test_use_generation_paid_token(db):
    """Test using paid token."""
    device_id = "use-paid-device"
    token = get_or_create_token_record(db, device_id)
    token.free_trial_used = True
    token.tokens_total = 5
    db.commit()
    
    result = use_generation(db, device_id)
    assert result is True
    
    db.refresh(token)
    assert token.tokens_used == 1


def test_use_generation_no_tokens(db):
    """Test using generation without tokens."""
    device_id = "no-tokens-device"
    token = get_or_create_token_record(db, device_id)
    token.free_trial_used = True
    token.tokens_total = 0
    db.commit()
    
    result = use_generation(db, device_id)
    assert result is False


def test_add_tokens(db):
    """Test adding tokens after payment."""
    device_id = "add-tokens-device"
    
    token = add_tokens(db, device_id, 10, "payment-123", "validator_10")
    
    assert token.tokens_total == 10
    assert token.payment_id == "payment-123"
    assert token.product_sku == "validator_10"


def test_add_tokens_cumulative(db):
    """Test adding tokens is cumulative."""
    device_id = "cumulative-device"
    
    add_tokens(db, device_id, 5, "payment-1", "validator_3")
    token = add_tokens(db, device_id, 10, "payment-2", "validator_10")
    
    assert token.tokens_total == 15


def test_get_token_status(db):
    """Test getting token status."""
    device_id = "status-device"
    token = get_or_create_token_record(db, device_id)
    token.tokens_total = 10
    token.tokens_used = 3
    db.commit()
    
    status = get_token_status(db, device_id)
    
    assert status["free_trial_used"] is False
    assert status["tokens_total"] == 10
    assert status["tokens_used"] == 3
    assert status["tokens_remaining"] == 7
    assert status["can_generate"] is True


def test_tokens_remaining_property(db):
    """Test tokens_remaining property calculation."""
    device_id = "remaining-device"
    token = get_or_create_token_record(db, device_id)
    
    token.tokens_total = 10
    token.tokens_used = 4
    db.commit()
    db.refresh(token)
    
    assert token.tokens_remaining == 6
    
    # Edge case: used more than total (shouldn't happen but handle it)
    token.tokens_used = 15
    db.commit()
    db.refresh(token)
    
    assert token.tokens_remaining == 0  # Never negative
