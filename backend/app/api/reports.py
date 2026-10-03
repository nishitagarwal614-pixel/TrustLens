import secrets

from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.database_models import (
    Report,
    Post
)

from app.models.schemas import (
    ReportCreate,
    ReportResponse
)


router = APIRouter()


REGULATORY_GUIDANCE = {
    "notice": (
        "Satark Sight recorded your report for "
        "internal trust assessment and community "
        "protection. Satark Sight is an independent "
        "verification platform and does not directly "
        "forward complaints to statutory regulators."
    ),

    "official_reporting_channels": [

        {
            "authority": (
                "SEBI SCORES 2.0 "
                "(Securities & Exchange Board of India)"
            ),
            "purpose": (
                "Official redressal against unregistered "
                "investment advisers, fraudulent tip "
                "channels, or listed entity irregularities."
            ),
            "portal": (
                "https://scores.sebi.gov.in"
            ),
            "toll_free": (
                "1800 266 7575 / 1800 22 7575"
            )
        },

        {
            "authority": (
                "National Cyber Crime Reporting Portal"
            ),
            "purpose": (
                "Report online financial fraud, "
                "phishing groups, and advance-fee scams."
            ),
            "portal": (
                "https://cybercrime.gov.in"
            ),
            "helpline": "1930"
        },

        {
            "authority": (
                "Advertising Standards Council of India"
            ),
            "purpose": (
                "Complaints involving advertising and "
                "influencer disclosure issues."
            ),
            "portal": (
                "https://www.ascionline.in"
            )
        }
    ]
}


def _generate_report_id(
    db: Session
) -> str:
    """
    Generate a collision-checked tracking ID.

    Example:
        TL-A4F82C
    """

    for _ in range(20):

        candidate = (
            "TL-"
            + secrets.token_hex(3).upper()
        )

        exists = (
            db.query(Report)
            .filter(
                Report.id == candidate
            )
            .first()
        )

        if not exists:
            return candidate

    raise RuntimeError(
        "Unable to generate a unique report ID."
    )


def _serialize_report(
    report: Report
):
    return {
        "id": report.id,
        "post_id": report.post_id,
        "content_url": report.content_url,
        "creator_name": report.creator_name,
        "reason": report.reason,
        "description": report.description,
        "detected_claim": report.detected_claim,
        "screenshot_name": report.screenshot_name,
        "status": report.status,
        "created_at": (
            report.created_at.isoformat()
            if report.created_at
            else None
        )
    }


def _build_report_response(
    report: Report
):
    return {
        **_serialize_report(report),
        "created_at": report.created_at,
        "regulatory_guidance": REGULATORY_GUIDANCE
    }


def _create_report(
    req: ReportCreate,
    db: Session
):
    if not req.reason.strip():
        raise HTTPException(
            status_code=400,
            detail="Reason is required."
        )

    if not req.description.strip():
        raise HTTPException(
            status_code=400,
            detail="Description is required."
        )

    # If a post_id was supplied, make sure the
    # referenced analysis actually exists.
    if req.post_id is not None:

        post = (
            db.query(Post)
            .filter(
                Post.id == req.post_id
            )
            .first()
        )

        if not post:

            raise HTTPException(
                status_code=404,
                detail=(
                    "The referenced analysis "
                    "record was not found."
                )
            )

    report_id = _generate_report_id(
        db
    )

    new_report = Report(
        id=report_id,
        post_id=req.post_id,
        content_url=req.content_url,
        creator_name=req.creator_name,
        reason=req.reason.strip(),
        description=req.description.strip(),
        detected_claim=(
            req.detected_claim.strip()
            if req.detected_claim
            else None
        ),
        screenshot_name=(
            req.screenshot_name.strip()
            if req.screenshot_name
            else None
        ),
        status="Received",
        created_at=datetime.utcnow()
    )

    try:

        db.add(new_report)

        db.commit()

        db.refresh(new_report)

    except Exception as exc:

        db.rollback()

        print(
            "[Reports API Error] "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save the report."
            )
        )

    return new_report


# --------------------------------------------------
# CREATE REPORT
# --------------------------------------------------

@router.post(
    "/report",
    response_model=ReportResponse
)
def submit_report(
    req: ReportCreate,
    db: Session = Depends(get_db)
):

    report = _create_report(
        req,
        db
    )

    return _build_report_response(
        report
    )


# Backward/forward compatible endpoint.
#
# Some frontend code may use:
#   POST /api/report
#
# while newer code may use:
#   POST /api/reports
#
# Both are supported.

@router.post(
    "/reports",
    response_model=ReportResponse
)
def submit_report_plural(
    req: ReportCreate,
    db: Session = Depends(get_db)
):

    report = _create_report(
        req,
        db
    )

    return _build_report_response(
        report
    )


# --------------------------------------------------
# LIST REPORTS
# --------------------------------------------------

@router.get("/reports")
def list_reports(
    db: Session = Depends(get_db)
):

    reports = (
        db.query(Report)
        .order_by(
            Report.created_at.desc()
        )
        .all()
    )

    return [
        _serialize_report(report)
        for report in reports
    ]


# --------------------------------------------------
# GET ONE REPORT BY TRACKING ID
# --------------------------------------------------

@router.get(
    "/reports/{report_id}"
)
def get_report(
    report_id: str,
    db: Session = Depends(get_db)
):

    normalized_id = (
        report_id.strip().upper()
    )

    report = (
        db.query(Report)
        .filter(
            Report.id == normalized_id
        )
        .first()
    )

    if not report:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Report '{normalized_id}' "
                "was not found."
            )
        )

    response = _build_report_response(
        report
    )

    # Include the linked verification result
    # when this report came from an analysis.
    if report.post_id is not None:

        post = (
            db.query(Post)
            .filter(
                Post.id == report.post_id
            )
            .first()
        )

        if post:

            response["analysis"] = {
                "id": post.id,
                "overall_status": (
                    post.overall_status
                ),
                "risk_level": (
                    post.risk_level
                ),
                "recommendation_detected": (
                    post.recommendation_detected
                ),
                "disclosure_status": (
                    post.disclosure_status
                ),
                "explanation": (
                    post.explanation
                ),
                "created_at": (
                    post.created_at.isoformat()
                    if post.created_at
                    else None
                )
            }

    return response