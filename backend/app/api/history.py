from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.database_models import Post, Claim, RedFlag, Evidence

router = APIRouter()

@router.get("/history")
def get_verification_history(
    status_filter: Optional[str] = Query(None, description="Filter by status: High Risk, Unverified, Verified, Contradicted"),
    db: Session = Depends(get_db)
):
    query = db.query(Post).order_by(Post.created_at.desc())
    posts = query.all()
    results = []

    for p in posts:
        # Determine filter match
        if status_filter:
            sf_lower = status_filter.lower().replace(" ", "")
            status_match = False
            if sf_lower in p.overall_status.lower().replace(" ", "") or sf_lower in p.risk_level.lower():
                status_match = True
            if not status_match:
                continue

        claims_count = len(p.claims)
        red_flags_count = len(p.red_flags)
        
        results.append({
            "id": p.id,
            "content": p.content,
            "source_url": p.source_url,
            "creator_handle": p.creator.handle if p.creator else "Anonymous / Unknown",
            "overall_status": p.overall_status,
            "risk_level": p.risk_level,
            "claims_count": claims_count,
            "red_flags_count": red_flags_count,
            "recommendation_detected": p.recommendation_detected,
            "disclosure_status": p.disclosure_status,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })

    return results

@router.get("/analysis/{post_id}")
def get_analysis_detail(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    claims_data = []
    all_evidence = []
    for c in post.claims:
        ev_items = []
        for ev in c.evidence_items:
            item = {
                "source_name": ev.source_name,
                "document_title": ev.document_title,
                "document_date": ev.document_date,
                "excerpt": ev.excerpt,
                "source_url": ev.source_url,
                "relevance": ev.relevance,
                "source_type": ev.source_type,
                "status": ev.status
            }
            ev_items.append(item)
            all_evidence.append(item)

        claims_data.append({
            "id": c.id,
            "text": c.claim_text,
            "type": c.claim_type,
            "status": c.status,
            "confidence": c.confidence,
            "evidence": ev_items
        })

    red_flags_data = []
    for rf in post.red_flags:
        red_flags_data.append({
            "type": rf.category,
            "severity": rf.severity,
            "explanation": rf.explanation,
            "trigger_text": rf.trigger_text
        })

    return {
        "id": post.id,
        "content": post.content,
        "source_url": post.source_url,
        "creator_handle": post.creator.handle if post.creator else "Anonymous",
        "overall_status": post.overall_status,
        "risk_level": post.risk_level,
        "recommendation_detected": post.recommendation_detected,
        "disclosure": {
            "detected": "detected" in post.disclosure_status.lower() and "no" not in post.disclosure_status.lower(),
            "status": post.disclosure_status,
            "explanation": "Stored historical disclosure assessment."
        },
        "claims": claims_data,
        "red_flags": red_flags_data,
        "evidence": all_evidence,
        "explanation": post.explanation or "Historical analysis record.",
        "created_at": post.created_at.isoformat() if post.created_at else None
    }

@router.delete("/analysis/{post_id}")
def delete_analysis_record(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Record not found.")
    db.delete(post)
    db.commit()
    return {"status": "success", "message": f"Analysis {post_id} removed."}

@router.delete("/history")
def clear_all_history(db: Session = Depends(get_db)):
    from app.models.database_models import Report
    db.query(Report).filter(Report.post_id.isnot(None)).update({"post_id": None})
    db.query(Evidence).delete()
    db.query(RedFlag).delete()
    db.query(Claim).delete()
    db.query(Post).delete()
    db.commit()
    return {"status": "success", "message": "All verification history removed."}

