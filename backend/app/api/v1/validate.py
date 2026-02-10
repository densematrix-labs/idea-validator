"""Validation API endpoint."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.report import ValidationReport
from app.services.llm_service import validate_idea
from app.services.token_service import check_can_generate, use_generation
from app.metrics import (
    core_function_calls,
    tokens_consumed,
    free_trial_used,
)

router = APIRouter(prefix="/api/v1", tags=["validation"])


class ValidateRequest(BaseModel):
    """Request schema for validation."""
    idea_title: str = Field(..., min_length=3, max_length=200)
    idea_description: str = Field(..., min_length=20, max_length=5000)
    language: str = Field(default="en", pattern="^(en|zh|ja|de|fr|ko|es)$")


class ValidateResponse(BaseModel):
    """Response schema for validation."""
    report_id: str
    overall_score: int
    market_analysis: dict
    competition_analysis: dict
    technical_feasibility: dict
    business_model: dict
    risks: dict
    suggestions: dict
    summary: str


@router.post("/validate", response_model=ValidateResponse)
async def validate_startup_idea(
    request: ValidateRequest,
    device_id: str = "",
    db: Session = Depends(get_db),
):
    """
    Validate a startup idea using AI analysis.
    
    Requires either free trial or paid tokens.
    """
    if not device_id:
        raise HTTPException(status_code=400, detail="Device ID is required")
    
    # Check if user can generate
    can_generate, reason = check_can_generate(db, device_id)
    if not can_generate:
        raise HTTPException(
            status_code=402,
            detail="No generation credits remaining. Please purchase more validations."
        )
    
    try:
        # Call LLM for validation
        result = await validate_idea(
            title=request.idea_title,
            description=request.idea_description,
            language=request.language,
        )
        
        # Consume token
        use_generation(db, device_id)
        
        # Track metrics
        core_function_calls.labels(tool="idea-validator").inc()
        if reason == "free_trial":
            free_trial_used.labels(tool="idea-validator").inc()
        else:
            tokens_consumed.labels(tool="idea-validator").inc()
        
        # Save report to database
        report = ValidationReport(
            idea_title=request.idea_title,
            idea_description=request.idea_description,
            language=request.language,
            overall_score=result.get("overall_score", 0),
            market_analysis=result.get("market_analysis"),
            competition_analysis=result.get("competition_analysis"),
            technical_feasibility=result.get("technical_feasibility"),
            business_model=result.get("business_model"),
            risks=result.get("risks"),
            suggestions=result.get("suggestions"),
            summary=result.get("summary", ""),
            device_id=device_id,
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return ValidateResponse(
            report_id=report.id,
            overall_score=result.get("overall_score", 0),
            market_analysis=result.get("market_analysis", {}),
            competition_analysis=result.get("competition_analysis", {}),
            technical_feasibility=result.get("technical_feasibility", {}),
            business_model=result.get("business_model", {}),
            risks=result.get("risks", {}),
            suggestions=result.get("suggestions", {}),
            summary=result.get("summary", ""),
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.get("/reports/{report_id}")
async def get_report(report_id: str, db: Session = Depends(get_db)):
    """Get a validation report by ID."""
    report = db.query(ValidationReport).filter(
        ValidationReport.id == report_id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report.to_dict()
