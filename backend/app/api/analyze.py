from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.orchestrator import run_content_analysis


router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse
)
async def analyze_content(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Main Satark Sight verification endpoint.

    Accepts:

    1. JSON
       {
           "content": "...",
           "source_url": "...",
           "creator_name": "..."
       }

    2. multipart/form-data
       - content / text
       - source_url / url
       - creator_name / creator
       - image / file / evidence_image

    3. Plain text body
    """

    content_value = ""
    source_value = None
    creator_value = None

    image_bytes = None
    image_mime = "image/jpeg"

    content_type = (
        request.headers
        .get("content-type", "")
        .lower()
    )

    # --------------------------------------------------
    # JSON REQUEST
    # --------------------------------------------------

    if content_type.startswith(
        "application/json"
    ):

        try:
            body = await request.json()

            req = AnalyzeRequest.model_validate(
                body
            )

            content_value = (
                req.content or ""
            )

            source_value = (
                req.source_url
            )

            creator_value = (
                req.creator_name
            )

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid JSON request: "
                    f"{exc}"
                )
            )

    # --------------------------------------------------
    # MULTIPART REQUEST
    # --------------------------------------------------

    elif content_type.startswith(
        "multipart/form-data"
    ):

        try:

            form = await request.form()

            content_value = str(
                form.get("content")
                or form.get("text")
                or ""
            )

            source_value = (
                str(
                    form.get("source_url")
                    or form.get("url")
                    or ""
                ).strip()
                or None
            )

            creator_value = (
                str(
                    form.get("creator_name")
                    or form.get("creator")
                    or ""
                ).strip()
                or None
            )

            upload = (
                form.get("image")
                or form.get("file")
                or form.get("evidence_image")
            )

            if (
                upload is not None
                and hasattr(upload, "read")
            ):

                image_bytes = await upload.read()

                image_mime = (
                    getattr(
                        upload,
                        "content_type",
                        None
                    )
                    or "image/jpeg"
                )

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid multipart request: "
                    f"{exc}"
                )
            )

    # --------------------------------------------------
    # PLAIN TEXT REQUEST
    # --------------------------------------------------

    else:

        raw = await request.body()

        content_value = raw.decode(
            "utf-8",
            errors="ignore"
        )

    # --------------------------------------------------
    # VALIDATION
    # --------------------------------------------------

    if (
        not content_value.strip()
        and not source_value
        and not image_bytes
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Provide text, a URL, "
                "or an image."
            )
        )

    # --------------------------------------------------
    # RUN REAL VERIFICATION
    # --------------------------------------------------

    try:

        # IMPORTANT:
        # Do not pass image_mime_type here.
        # The current orchestrator accepts image_bytes
        # directly and handles extraction itself.

        result = run_content_analysis(
            content=content_value,
            source_url=source_value,
            creator_name=creator_value,
            db=db,
            image_bytes=image_bytes
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except Exception as exc:

        print(
            "[Analyze API Error] "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Verification processing failed. "
                "Please retry the analysis."
            )
        )


@router.post("/verify-claim")
def verify_single_claim(
    claim_text: str,
    db: Session = Depends(get_db)
):

    if (
        not claim_text
        or len(claim_text.strip()) < 3
    ):

        raise HTTPException(
            status_code=400,
            detail="Claim text required."
        )

    return run_content_analysis(
        content=claim_text,
        db=db
    )