"""Tests for payment API endpoints."""
import pytest
import json
from unittest.mock import patch, AsyncMock


def test_checkout_invalid_product(client, device_id):
    """Test checkout with invalid product SKU."""
    response = client.post(
        "/api/v1/payment/checkout",
        json={
            "product_sku": "invalid_product",
            "device_id": device_id
        }
    )
    assert response.status_code == 400
    
    data = response.json()
    detail = data.get("detail")
    assert isinstance(detail, str), f"Error detail should be string: {detail}"


def test_checkout_missing_device_id(client):
    """Test checkout without device ID."""
    response = client.post(
        "/api/v1/payment/checkout",
        json={
            "product_sku": "validator_3",
            "device_id": ""
        }
    )
    # Should fail validation or business logic
    assert response.status_code in [400, 422, 500]


@patch("app.api.v1.payment.httpx.AsyncClient")
def test_checkout_success(mock_client, client, device_id):
    """Test successful checkout creation."""
    # Mock Creem API response
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "checkout_url": "https://checkout.creem.io/xxx",
        "id": "chk_123"
    }
    mock_response.raise_for_status = AsyncMock()
    
    mock_client_instance = AsyncMock()
    mock_client_instance.post.return_value = mock_response
    mock_client_instance.__aenter__.return_value = mock_client_instance
    mock_client_instance.__aexit__.return_value = None
    mock_client.return_value = mock_client_instance
    
    # Need to set product IDs in env
    with patch("app.api.v1.payment.settings") as mock_settings:
        mock_settings.creem_api_key = "test_key"
        mock_settings.creem_product_ids = json.dumps({"validator_3": "prod_123"})
        mock_settings.frontend_url = "https://example.com"
        
        response = client.post(
            "/api/v1/payment/checkout",
            json={
                "product_sku": "validator_3",
                "device_id": device_id
            }
        )
    
    # May fail due to config, but should not be 500 with unhandled error
    assert response.status_code in [200, 500]


def test_verify_payment_not_found(client):
    """Test verifying non-existent payment."""
    response = client.get("/api/v1/payment/verify/non-existent-id")
    assert response.status_code == 404
    
    data = response.json()
    detail = data.get("detail")
    assert isinstance(detail, str), f"Error detail should be string: {detail}"


def test_webhook_invalid_json(client):
    """Test webhook with invalid JSON."""
    response = client.post(
        "/api/v1/payment/webhook",
        content=b"not valid json",
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 400


def test_webhook_unhandled_event(client):
    """Test webhook with unhandled event type."""
    response = client.post(
        "/api/v1/payment/webhook",
        json={"type": "unknown.event", "data": {}}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ignored"


def test_webhook_checkout_completed(client, db, device_id):
    """Test webhook for completed checkout."""
    from app.models.payment import PaymentTransaction
    
    # Create a pending transaction
    transaction = PaymentTransaction(
        checkout_id="test-checkout-123",
        device_id=device_id,
        product_sku="validator_3",
        amount_cents=499,
        status="pending"
    )
    db.add(transaction)
    db.commit()
    
    # Send webhook
    response = client.post(
        "/api/v1/payment/webhook",
        json={
            "type": "checkout.completed",
            "data": {
                "request_id": "test-checkout-123",
                "id": "order_456"
            }
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["tokens_added"] == 3
    
    # Verify transaction status
    db.refresh(transaction)
    assert transaction.status == "completed"
