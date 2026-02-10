"""Main FastAPI application."""
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.api.v1.validate import router as validate_router
from app.api.v1.tokens import router as tokens_router
from app.api.v1.payment import router as payment_router
from app.metrics import (
    metrics_router,
    http_requests,
    http_request_duration,
    crawler_visits,
)

settings = get_settings()

# Bot detection patterns
BOT_PATTERNS = ["Googlebot", "bingbot", "Baiduspider", "YandexBot", "DuckDuckBot", "Slurp", "facebookexternalhit"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    init_db()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="AI Startup Idea Validator",
    description="Validate your startup ideas with AI-powered analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://idea-validator.demo.densematrix.ai",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Track request metrics."""
    start_time = time.time()
    
    # Track crawler visits
    ua = request.headers.get("user-agent", "")
    for bot in BOT_PATTERNS:
        if bot.lower() in ua.lower():
            crawler_visits.labels(tool=settings.tool_name, bot=bot).inc()
            break
    
    response = await call_next(request)
    
    # Track request metrics
    duration = time.time() - start_time
    endpoint = request.url.path
    method = request.method
    status = response.status_code
    
    http_requests.labels(
        tool=settings.tool_name,
        endpoint=endpoint,
        method=method,
        status=status
    ).inc()
    
    http_request_duration.labels(
        tool=settings.tool_name,
        endpoint=endpoint,
        method=method
    ).observe(duration)
    
    return response


# Include routers
app.include_router(validate_router)
app.include_router(tokens_router)
app.include_router(payment_router)
app.include_router(metrics_router)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "idea-validator"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "AI Startup Idea Validator API",
        "version": "1.0.0",
        "docs": "/docs",
    }
