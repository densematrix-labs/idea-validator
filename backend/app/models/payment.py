"""Payment transaction model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON
from app.database import Base


class PaymentTransaction(Base):
    """Payment transaction record."""
    
    __tablename__ = "payment_transactions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    checkout_id = Column(String(64), unique=True, nullable=False, index=True)
    device_id = Column(String(64), nullable=False, index=True)
    product_sku = Column(String(64), nullable=False)
    
    # Payment details
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(String(20), default="pending")  # pending, completed, failed
    
    # Creem data
    creem_order_id = Column(String(64), nullable=True)
    webhook_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "checkout_id": self.checkout_id,
            "product_sku": self.product_sku,
            "amount_cents": self.amount_cents,
            "currency": self.currency,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
