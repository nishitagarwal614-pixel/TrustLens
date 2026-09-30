from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, ClaimItem, EvidenceItem, RedFlagItem, DisclosureResult
from app.services.orchestrator import run_content_analysis
from app.rag.vector_store import vector_store
from app.ai.verification_engine import verify_claims_with_evidence

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_content(req: AnalyzeRequest, db: Session = Depends(get_db)):
    if not req.content or len(req.content.strip()) < 3:
        raise HTTPException(status_code=400, detail="Content must be at least 3 characters long.")
    
    result = run_content_analysis(
        content=req.content,
        source_url=req.source_url,
        creator_name=req.creator_name,
        db=db
    )
    return result

@router.post("/verify-claim")
def verify_single_claim(claim_text: str):
    if not claim_text or len(claim_text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Claim text required.")

    matches = vector_store.search(claim_text, top_k=3)
    claims = [{
        "text": claim_text,
        "type": "Specific user claim",
        "status": "Unverified",
        "confidence": 0.85
    }]
    
    status, risk, explanation = verify_claims_with_evidence(
        claims=claims,
        evidence_list=matches,
        red_flags=[],
        disclosure={"status": "No disclosure detected"}
    )
    
    return {
        "claim": claims[0],
        "overall_status": status,
        "risk_level": risk,
        "evidence": matches,
        "explanation": explanation
    }
