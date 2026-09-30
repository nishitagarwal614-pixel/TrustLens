import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database.init_db import init_database
from app.api import analyze, history, creators, reports, simulator, dashboard, evidence

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and demo data are initialized
    print("[TrustLens AI] Initializing database and RAG index...")
    init_database()
    print("[TrustLens AI] Ready for verification requests.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered financial content verification and retail-investor protection platform.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Friendly error handler avoiding raw stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[TrustLens Error] Internal error: {exc}", file=sys.stderr)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Verification processing error",
            "message": "The system encountered an issue analyzing the specified content. Please verify input and retry.",
            "type": exc.__class__.__name__
        }
    )

# Routers
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(creators.router, prefix="/api", tags=["Creators"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(simulator.router, prefix="/api", tags=["Simulator"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(evidence.router, prefix="/api", tags=["Evidence"])

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "TrustLens AI",
        "version": settings.VERSION,
        "purpose": "Financial Content Verification & Retail Investor Protection",
        "disclaimer": "TrustLens AI does not provide investment advice or stock recommendations."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
