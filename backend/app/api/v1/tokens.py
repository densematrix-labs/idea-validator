"""Token management API."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.token_service import get_token_status

router = APIRouter(prefix="/api/v1/tokens", tags=["tokens"])


class TokenStatusResponse(BaseModel):
    """Token status response."""
    free_trial_used: bool
    tokens_total: int
    tokens_used: int
    tokens_remaining: int
    can_generate: bool


@router.get("/status", response_model=TokenStatusResponse)
async def get_status(device_id: str = "", db: Session = Depends(get_db)):
    """Get token status for a device."""
    if not device_id:
        raise HTTPException(status_code=400, detail="Device ID is required")
    
    status = get_token_status(db, device_id)
    return TokenStatusResponse(**status)
