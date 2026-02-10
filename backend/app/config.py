"""Application configuration."""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    
    # App
    app_name: str = "Idea Validator"
    debug: bool = False
    tool_name: str = "idea-validator"
    
    # LLM Proxy
    llm_proxy_url: str = "https://llm-proxy.densematrix.ai"
    llm_proxy_key: str = ""
    llm_model: str = "anthropic/claude-sonnet-4-20250514"
    
    # Database
    database_url: str = "sqlite:///./app.db"
    
    # Creem Payment
    creem_api_key: str = ""
    creem_webhook_secret: str = ""
    creem_product_ids: str = "{}"
    
    # Frontend URL (for CORS and redirects)
    frontend_url: str = "https://idea-validator.demo.densematrix.ai"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings."""
    return Settings()
