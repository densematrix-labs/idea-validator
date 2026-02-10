"""Tests for token API endpoints."""
import pytest


def test_get_token_status_new_device(client, device_id):
    """Test getting token status for new device."""
    response = client.get(f"/api/v1/tokens/status?device_id={device_id}")
    assert response.status_code == 200
    data = response.json()
    
    assert data["free_trial_used"] is False
    assert data["tokens_total"] == 0
    assert data["tokens_used"] == 0
    assert data["tokens_remaining"] == 0
    assert data["can_generate"] is True


def test_get_token_status_without_device_id(client):
    """Test getting token status without device ID fails."""
    response = client.get("/api/v1/tokens/status")
    assert response.status_code == 400
    
    data = response.json()
    detail = data.get("detail")
    assert isinstance(detail, str), f"Error detail should be string: {detail}"


def test_token_status_after_free_trial(client, db, device_id):
    """Test token status after using free trial."""
    from app.services.token_service import use_generation
    
    # Use free trial
    use_generation(db, device_id)
    
    response = client.get(f"/api/v1/tokens/status?device_id={device_id}")
    assert response.status_code == 200
    data = response.json()
    
    assert data["free_trial_used"] is True
    assert data["can_generate"] is False  # No paid tokens
