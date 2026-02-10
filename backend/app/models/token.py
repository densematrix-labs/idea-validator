"""Generation token model for payment tracking."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean
from app.database import Base


class GenerationToken(Base):
    """Token balance for paid generations."""
    
    __tablename__ = "generation_tokens"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(64), nullable=False, index=True)
    tokens_total = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    free_trial_used = Column(Boolean, default=False)
    
    # Payment reference
    payment_id = Column(String(64), nullable=True)
    product_sku = Column(String(64), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def tokens_remaining(self) -> int:
        """Get remaining tokens."""
        return max(0, self.tokens_total - self.tokens_used)
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "device_id": self.device_id,
            "tokens_total": self.tokens_total,
            "tokens_used": self.tokens_used,
            "tokens_remaining": self.tokens_remaining,
            "free_trial_used": self.free_trial_used,
        }
