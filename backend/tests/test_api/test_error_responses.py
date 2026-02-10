"""Tests for error response formats.

These tests ensure that all error responses have properly serializable
detail fields that won't display as [object Object] on the frontend.
"""
import pytest
from unittest.mock import patch


def test_402_error_detail_is_string(client, device_id, db):
    """Verify 402 error detail is serializable as string."""
    from app.services.token_service import use_generation
    
    # Use up free trial
    use_generation(db, device_id)
    
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "Test Idea",
            "idea_description": "This is a valid test description for the idea.",
            "language": "en"
        }
    )
    
    assert response.status_code == 402
    data = response.json()
    detail = data.get("detail")
    
    # Detail must be a string, not an object
    assert isinstance(detail, str), f"402 detail must be string, got {type(detail)}: {detail}"
    assert "[object Object]" not in detail
    assert "object Object" not in detail.lower()


def test_400_error_detail_is_string(client):
    """Verify 400 error detail is serializable as string."""
    response = client.get("/api/v1/tokens/status")  # Missing device_id
    
    assert response.status_code == 400
    data = response.json()
    detail = data.get("detail")
    
    assert isinstance(detail, str), f"400 detail must be string, got {type(detail)}: {detail}"


def test_404_error_detail_is_string(client):
    """Verify 404 error detail is serializable as string."""
    response = client.get("/api/v1/reports/non-existent-id")
    
    assert response.status_code == 404
    data = response.json()
    detail = data.get("detail")
    
    assert isinstance(detail, str), f"404 detail must be string, got {type(detail)}: {detail}"


@patch("app.api.v1.validate.validate_idea")
def test_500_error_detail_is_string(mock_validate, client, device_id):
    """Verify 500 error detail is serializable as string."""
    mock_validate.side_effect = Exception("LLM service unavailable")
    
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "Test Idea",
            "idea_description": "This is a valid test description for the idea.",
            "language": "en"
        }
    )
    
    assert response.status_code == 500
    data = response.json()
    detail = data.get("detail")
    
    assert isinstance(detail, str), f"500 detail must be string, got {type(detail)}: {detail}"
    assert "[object Object]" not in detail


def test_422_validation_error_is_serializable(client, device_id):
    """Verify 422 validation errors are properly serializable."""
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "",  # Invalid: too short
            "idea_description": "short",  # Invalid: too short
            "language": "invalid"  # Invalid: not in allowed list
        }
    )
    
    assert response.status_code == 422
    data = response.json()
    
    # FastAPI validation errors have a specific structure
    assert "detail" in data
    # Should be a list of validation errors or a string
    if isinstance(data["detail"], list):
        for error in data["detail"]:
            assert "msg" in error or "message" in error or isinstance(error, str)
    else:
        assert isinstance(data["detail"], str)
