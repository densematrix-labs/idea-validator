"""Tests for validation API endpoints."""
import pytest
from unittest.mock import patch, AsyncMock


def test_validate_without_device_id(client):
    """Test validation without device ID fails."""
    response = client.post(
        "/api/v1/validate",
        json={
            "idea_title": "Test Idea",
            "idea_description": "This is a test idea description that is long enough.",
            "language": "en"
        }
    )
    assert response.status_code == 400
    
    data = response.json()
    detail = data.get("detail")
    assert isinstance(detail, str), f"Error detail should be string: {detail}"


def test_validate_with_empty_title(client, device_id):
    """Test validation with empty title fails."""
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "",
            "idea_description": "This is a test idea description.",
            "language": "en"
        }
    )
    assert response.status_code == 422  # Validation error


def test_validate_with_short_description(client, device_id):
    """Test validation with short description fails."""
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "Test Idea",
            "idea_description": "Too short",
            "language": "en"
        }
    )
    assert response.status_code == 422  # Validation error


def test_validate_with_invalid_language(client, device_id):
    """Test validation with invalid language fails."""
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "Test Idea",
            "idea_description": "This is a valid test description.",
            "language": "invalid"
        }
    )
    assert response.status_code == 422


@patch("app.api.v1.validate.validate_idea")
def test_validate_success(mock_validate, client, device_id):
    """Test successful validation."""
    mock_validate.return_value = {
        "overall_score": 75,
        "market_analysis": {"tam": "10B", "score": 70},
        "competition_analysis": {"direct_competitors": ["Competitor A"], "score": 65},
        "technical_feasibility": {"complexity": "medium", "score": 80},
        "business_model": {"revenue_streams": ["SaaS"], "score": 75},
        "risks": {"market_risks": ["Competition"], "overall_risk_level": "medium"},
        "suggestions": {"improvements": ["Add feature X"]},
        "summary": "A promising startup idea."
    }
    
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "AI Food Planner",
            "idea_description": "An AI-powered meal planning application that helps users create personalized weekly meal plans based on their dietary preferences and health goals.",
            "language": "en"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["overall_score"] == 75
    assert "report_id" in data


@patch("app.api.v1.validate.validate_idea")
def test_validate_consumes_free_trial(mock_validate, client, db, device_id):
    """Test that validation consumes free trial."""
    mock_validate.return_value = {
        "overall_score": 75,
        "market_analysis": {},
        "competition_analysis": {},
        "technical_feasibility": {},
        "business_model": {},
        "risks": {},
        "suggestions": {},
        "summary": "Test"
    }
    
    # First validation should succeed (free trial)
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "Test Idea",
            "idea_description": "This is a valid test description for the idea.",
            "language": "en"
        }
    )
    assert response.status_code == 200
    
    # Check free trial is now used
    status = client.get(f"/api/v1/tokens/status?device_id={device_id}")
    assert status.json()["free_trial_used"] is True


@patch("app.api.v1.validate.validate_idea")
def test_validate_fails_without_credits(mock_validate, client, db, device_id):
    """Test validation fails when no credits available."""
    mock_validate.return_value = {
        "overall_score": 75,
        "market_analysis": {},
        "competition_analysis": {},
        "technical_feasibility": {},
        "business_model": {},
        "risks": {},
        "suggestions": {},
        "summary": "Test"
    }
    
    # Use up free trial
    from app.services.token_service import use_generation
    use_generation(db, device_id)
    
    # Second validation should fail (no tokens)
    response = client.post(
        f"/api/v1/validate?device_id={device_id}",
        json={
            "idea_title": "Test Idea",
            "idea_description": "This is a valid test description for the idea.",
            "language": "en"
        }
    )
    assert response.status_code == 402
    
    # Verify error message is a string
    data = response.json()
    detail = data.get("detail")
    assert isinstance(detail, str), f"402 error detail should be string, got: {type(detail)}"
    assert "[object Object]" not in str(detail)
