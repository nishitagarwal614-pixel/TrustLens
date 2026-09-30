import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.database_models import Report
from app.models.schemas import ReportCreate, ReportResponse

router = APIRouter()

REGULATORY_GUIDANCE = {
    "notice": "TrustLens AI recorded your report for internal trust assessment and community protection. TrustLens AI is an independent verification platform and does not directly forward complaints to statutory regulators.",
    "official_reporting_channels": [
        {
            "authority": "SEBI SCORES 2.0 (Securities & Exchange Board of India)",
            "purpose": "Official redressal against unregistered investment advisers, fraudulent tip channels, or listed entity irregularities.",
            "portal": "https://scores.sebi.gov.in",
            "toll_free": "1800 266 7575 / 1800 22 7575"
        },
        {
            "authority": "National Cyber Crime Reporting Portal",
            "purpose": "Report online financial fraud, Telegram/WhatsApp phishing groups, and advance fee scams.",
            "portal": "https://cybercrime.gov.in",
            "helpline": "1930"
        },
        {
            "authority": "Advertising Standards Council of India (ASCI)",
            "purpose": "Complaints against influencer marketing without #Sponsored/#Ad disclosures.",
            "portal": "https://www.ascionline.in"
        }
    ]
}

@router.post("/report", response_model=ReportResponse)
def submit_report(req: ReportCreate, db: Session = Depends(get_db)):
    if not req.reason or not req.description:
        raise HTTPException(status_code=400, detail="Reason and description are required.")

    # Generate TL-XXXXXX ID
    report_id = f"TL-{random.randint(100000, 999999)}"

    new_report = Report(
        id=report_id,
        post_id=req.post_id,
        content_url=req.content_url,
        creator_name=req.creator_name,
        reason=req.reason,
        description=req.description,
        detected_claim=req.detected_claim,
        screenshot_name=req.screenshot_name,
        status="Received",
        created_at=datetime.utcnow()
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {
        "id": new_report.id,
        "post_id": new_report.post_id,
        "content_url": new_report.content_url,
        "creator_name": new_report.creator_name,
        "reason": new_report.reason,
        "description": new_report.description,
        "status": new_report.status,
        "created_at": new_report.created_at,
        "regulatory_guidance": REGULATORY_GUIDANCE
    }

@router.get("/reports")
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return [{
        "id": r.id,
        "content_url": r.content_url,
        "creator_name": r.creator_name or "Anonymous",
        "reason": r.reason,
        "description": r.description,
        "status": r.status,
        "created_at": r.created_at.isoformat() if r.created_at else None
    } for r in reports]
