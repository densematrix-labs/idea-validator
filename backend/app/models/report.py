"""Validation report model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, JSON
from app.database import Base


class ValidationReport(Base):
    """Validation report database model."""
    
    __tablename__ = "validation_reports"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_title = Column(String(255), nullable=False)
    idea_description = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    
    # Report content
    overall_score = Column(Integer, nullable=True)  # 0-100
    market_analysis = Column(JSON, nullable=True)
    competition_analysis = Column(JSON, nullable=True)
    technical_feasibility = Column(JSON, nullable=True)
    business_model = Column(JSON, nullable=True)
    risks = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    
    # Metadata
    device_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "idea_title": self.idea_title,
            "idea_description": self.idea_description,
            "language": self.language,
            "overall_score": self.overall_score,
            "market_analysis": self.market_analysis,
            "competition_analysis": self.competition_analysis,
            "technical_feasibility": self.technical_feasibility,
            "business_model": self.business_model,
            "risks": self.risks,
            "suggestions": self.suggestions,
            "summary": self.summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
