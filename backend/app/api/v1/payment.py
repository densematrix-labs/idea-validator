"""Payment API for Creem integration."""
import json
import hmac
import hashlib
import httpx
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.config import get_settings
from app.models.payment import PaymentTransaction
from app.services.token_service import add_tokens
from app.metrics import payment_success, payment_revenue_cents

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])
settings = get_settings()


# Product configuration
PRODUCTS = {
    "validator_3": {"tokens": 3, "amount_cents": 499},
    "validator_10": {"tokens": 10, "amount_cents": 999},
    "validator_30": {"tokens": 30, "amount_cents": 1999},
}


class CheckoutRequest(BaseModel):
    """Checkout request."""
    product_sku: str
    device_id: str


class CheckoutResponse(BaseModel):
    """Checkout response with redirect URL."""
    checkout_url: str
    checkout_id: str


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(request: CheckoutRequest, db: Session = Depends(get_db)):
    """Create a Creem checkout session."""
    if request.product_sku not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product SKU")
    
    product = PRODUCTS[request.product_sku]
    
    # Get product ID from config
    try:
        product_ids = json.loads(settings.creem_product_ids)
        creem_product_id = product_ids.get(request.product_sku)
    except json.JSONDecodeError:
        creem_product_id = None
    
    if not creem_product_id:
        raise HTTPException(status_code=500, detail="Product not configured")
    
    # Create payment record
    import uuid
    checkout_id = str(uuid.uuid4())
    
    transaction = PaymentTransaction(
        checkout_id=checkout_id,
        device_id=request.device_id,
        product_sku=request.product_sku,
        amount_cents=product["amount_cents"],
        status="pending",
    )
    db.add(transaction)
    db.commit()
    
    # Create Creem checkout
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.creem.io/v1/checkouts",
                headers={
                    "Authorization": f"Bearer {settings.creem_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "product_id": creem_product_id,
                    "success_url": f"{settings.frontend_url}/payment/success?checkout_id={checkout_id}",
                    "request_id": checkout_id,
                    "metadata": {
                        "device_id": request.device_id,
                        "product_sku": request.product_sku,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()
            
            return CheckoutResponse(
                checkout_url=data["checkout_url"],
                checkout_id=checkout_id,
            )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    db: Session = Depends(get_db),
    creem_signature: Optional[str] = Header(None, alias="Creem-Signature"),
):
    """Handle Creem webhook for payment completion."""
    body = await request.body()
    
    # Verify signature
    if settings.creem_webhook_secret and creem_signature:
        expected = hmac.new(
            settings.creem_webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(creem_signature, expected):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    event_type = payload.get("type")
    
    if event_type == "checkout.completed":
        checkout_data = payload.get("data", {})
        request_id = checkout_data.get("request_id")
        
        if not request_id:
            return {"status": "ignored", "reason": "no request_id"}
        
        # Find transaction
        transaction = db.query(PaymentTransaction).filter(
            PaymentTransaction.checkout_id == request_id
        ).first()
        
        if not transaction:
            return {"status": "ignored", "reason": "transaction not found"}
        
        if transaction.status == "completed":
            return {"status": "ignored", "reason": "already processed"}
        
        # Update transaction
        transaction.status = "completed"
        transaction.completed_at = datetime.utcnow()
        transaction.creem_order_id = checkout_data.get("id")
        transaction.webhook_data = payload
        
        # Add tokens
        product = PRODUCTS.get(transaction.product_sku, {"tokens": 0})
        add_tokens(
            db,
            transaction.device_id,
            product["tokens"],
            transaction.id,
            transaction.product_sku,
        )
        
        # Track metrics
        payment_success.labels(
            tool="idea-validator",
            product_sku=transaction.product_sku
        ).inc()
        payment_revenue_cents.labels(tool="idea-validator").inc(transaction.amount_cents)
        
        db.commit()
        
        return {"status": "success", "tokens_added": product["tokens"]}
    
    return {"status": "ignored", "reason": f"unhandled event: {event_type}"}


@router.get("/verify/{checkout_id}")
async def verify_payment(checkout_id: str, db: Session = Depends(get_db)):
    """Verify payment status."""
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.checkout_id == checkout_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "status": transaction.status,
        "product_sku": transaction.product_sku,
        "tokens_added": PRODUCTS.get(transaction.product_sku, {"tokens": 0})["tokens"] if transaction.status == "completed" else 0,
    }
