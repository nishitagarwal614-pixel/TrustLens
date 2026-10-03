from datetime import datetime
import re

from typing import Dict, Any, Optional
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.services.claim_extractor import (
    extract_claims_and_recommendations
)

from app.services.red_flag_detector import detect_red_flags
from app.services.disclosure_detector import detect_disclosure

from app.services.search_service import (
    perform_web_search,
    fetch_page,
    get_domain,
    is_official_source
)

from app.services.url_extractor import extract_text_from_url
from app.services.vision_extractor import extract_text_from_image

from app.config import settings

from app.ai.verification_engine import (
    verify_claims_with_evidence
)

from app.ai.llm_provider import llm_provider

from app.models.database_models import (
    Post,
    Claim,
    RedFlag,
    Evidence,
    Creator
)


# =========================================================
# EVIDENCE NORMALIZATION
# =========================================================

def _normalize_evidence(
    item: Dict[str, Any]
) -> Dict[str, Any]:

    source_url = (
        item.get("source_url")
        or item.get("href")
        or item.get("url")
        or ""
    )

    return {
        "id": item.get("id"),

        "source_name": (
            item.get("source_name")
            or "Web Source"
        ),

        "document_title": (
            item.get("document_title")
            or item.get("title")
            or "Retrieved Web Source"
        ),

        "document_date": item.get(
            "document_date"
        ),

        "excerpt": (
            item.get("excerpt")
            or item.get("body")
            or item.get("snippet")
            or ""
        ),

        "source_url": source_url,

        "relevance": item.get(
            "relevance",
            0.0
        ),

        "source_type": item.get(
            "source_type",
            "Web Source"
        ),

        "status": item.get(
            "status",
            "Inconclusive"
        ),

        "page_text": item.get(
            "page_text",
            ""
        ),

        "is_authoritative": item.get(
            "is_authoritative",
            False
        )
    }


# =========================================================
# DIRECT SOURCE EVIDENCE
# =========================================================

def _build_direct_source_evidence(
    source_url: str,
    source_text: str
) -> Optional[Dict[str, Any]]:

    if not source_url or not source_text:
        return None

    source_url = source_url.strip()
    source_text = source_text.strip()

    if not source_text:
        return None

    domain = get_domain(source_url)

    return {
        "id": None,

        "source_name": (
            domain
            or "User Supplied Source"
        ),

        "document_title": (
            "User-supplied source"
        ),

        "document_date": None,

        "excerpt": source_text[:6000],

        "source_url": source_url,

        "relevance": 1.0,

        "source_type": (
            "Official Source"
            if is_official_source(source_url)
            else "User Supplied Source"
        ),

        "status": "Retrieved",

        "page_text": source_text,

        "is_authoritative": (
            is_official_source(source_url)
        )
    }


# =========================================================
# CLAIM TEXT NORMALIZATION
# =========================================================

def _normalize_claim_text(text: str) -> str:

    if not text:
        return ""

    text = str(text).lower().strip()

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    months = (
        "january|february|march|april|may|june|july|"
        "august|september|october|november|december"
    )

    # Fix:
    # 6 June2025
    # -> 6 June 2025

    text = re.sub(
        rf"(\d{{1,2}}\s+({months}))\s*(\d{{4}})",
        r"\1 \3",
        text
    )

    text = re.sub(
        r"\s+([,.!?;:])",
        r"\1",
        text
    )

    return text.strip()


# =========================================================
# BUILD CLAIMS
# =========================================================

def _extract_claims(
    user_text: str,
    image_text: str,
    source_text: str
):

    """
    Claims are taken from actual user-provided material.

    Priority:

    1. Text entered by user
    2. Image content
    3. URL page content

    This allows text-only, image-only and URL-only
    verification.
    """

    if user_text:
        claim_source = user_text

    elif image_text:
        claim_source = image_text

    elif source_text:
        claim_source = source_text

    else:
        claim_source = ""

    if not claim_source:
        return [], False

    claims, recommendation_detected = (
        extract_claims_and_recommendations(
            claim_source
        )
    )

    clean_claims = []

    for claim in claims:

        if not isinstance(
            claim,
            dict
        ):
            continue

        claim_text = (
            claim.get("text")
            or claim.get("claim")
            or ""
        ).strip()

        if not claim_text:
            continue

        if claim_text.startswith(
            "[Source URL Content]"
        ):
            continue

        if claim_text.startswith(
            "[Image Content]"
        ):
            continue

        claim["text"] = claim_text

        if not claim.get("type"):
            claim["type"] = (
                "Factual assertion"
            )

        claim["status"] = "Unverified"

        claim["confidence"] = None

        claim["evidence"] = []

        clean_claims.append(
            claim
        )

    # If the extractor fails to identify
    # a claim, use the submitted material
    # itself as one factual assertion.

    if not clean_claims:

        clean_claims = [
            {
                "text": claim_source.strip(),
                "type": "Factual assertion",
                "status": "Unverified",
                "confidence": None,
                "evidence": []
            }
        ]

    return (
        clean_claims,
        recommendation_detected
    )


# =========================================================
# MAIN ANALYSIS FUNCTION
# =========================================================

def run_content_analysis(
    content: str,
    source_url: Optional[str] = None,
    creator_name: Optional[str] = None,
    image_bytes: Optional[bytes] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:

    # =====================================================
    # 1. INPUT VALIDATION
    # =====================================================

    user_text = (
        content.strip()
        if content
        else ""
    )

    source_url = (
        source_url.strip()
        if source_url
        else None
    )

    if (
        not user_text
        and not source_url
        and not image_bytes
    ):
        raise ValueError(
            "No readable content was available "
            "from the supplied input."
        )

    # =====================================================
    # 2. IMAGE EXTRACTION
    # =====================================================

    image_text = ""

    if image_bytes:

        try:

            extracted_image_text = (
                extract_text_from_image(
                    image_bytes,
                    settings.LLM_API_KEY
                )
            )

            if (
                extracted_image_text
                and extracted_image_text.strip()
                and not extracted_image_text.startswith(
                    "Image analysis unavailable"
                )
            ):

                image_text = (
                    extracted_image_text.strip()
                )

                print(
                    "[TrustLens AI] Image content "
                    "extracted successfully."
                )

        except Exception as exc:

            print(
                "[TrustLens AI] Image extraction "
                f"failed: {type(exc).__name__}: {exc}"
            )

    # =====================================================
    # 3. URL EXTRACTION
    # =====================================================

    source_text = ""

    if source_url:

        try:

            url_text = extract_text_from_url(
                source_url
            )

            if url_text:

                cleaned_url_text = (
                    url_text.strip()
                )

                invalid_outputs = [
                    "[Source URL Content]",
                    "Unable to extract",
                    "URL extraction failed",
                    "No readable content"
                ]

                is_invalid = any(
                    cleaned_url_text.startswith(
                        value
                    )
                    for value in invalid_outputs
                )

                if (
                    cleaned_url_text
                    and not is_invalid
                ):

                    source_text = (
                        cleaned_url_text
                    )

        except Exception as exc:

            print(
                "[TrustLens AI] URL extraction "
                f"failed: {type(exc).__name__}: {exc}"
            )

    # =====================================================
    # 4. DIRECT URL FETCH FALLBACK
    # =====================================================

    if source_url and not source_text:

        try:

            direct_page_text = fetch_page(
                source_url
            )

            if direct_page_text:

                source_text = (
                    direct_page_text.strip()
                )

                print(
                    "[TrustLens AI] Direct URL "
                    "retrieval succeeded."
                )

        except Exception as exc:

            print(
                "[TrustLens AI] Direct URL "
                f"retrieval failed: "
                f"{type(exc).__name__}: {exc}"
            )

    # =====================================================
    # 5. BUILD FINAL CONTENT FOR GEMINI
    # =====================================================

    content_parts = []

    if user_text:

        content_parts.append(
            user_text
        )

    if image_text:

        content_parts.append(
            "[Image Content]\n"
            + image_text
        )

    if source_text:

        content_parts.append(
            "[Source URL Content]\n"
            + source_text
        )

    final_content = (
        "\n\n".join(content_parts)
        .strip()
    )

    if not final_content:

        raise ValueError(
            "No readable content was available "
            "from the supplied input."
        )

    # =====================================================
    # 6. CLAIM EXTRACTION
    # =====================================================

    claims, recommendation_detected = (
        _extract_claims(
            user_text=user_text,
            image_text=image_text,
            source_text=source_text
        )
    )

    # =====================================================
    # 7. NO CLAIMS
    # =====================================================

    if not claims:

        return {
            "id": None,
            "overall_status": "Needs more evidence",
            "risk_level": "Medium",
            "claims": [],
            "recommendation_detected": (
                recommendation_detected
            ),
            "red_flags": [],
            "disclosure": {
                "detected": False,
                "status": "No disclosure detected",
                "trigger_text": None,
                "explanation": (
                    "No factual claim could be "
                    "identified for verification."
                )
            },
            "evidence": [],
            "explanation": (
                "No factual claim could be "
                "identified for verification."
            ),
            "created_at": (
                datetime.utcnow().isoformat()
            )
        }

    # =====================================================
    # 8. RED FLAGS
    # =====================================================

    red_flags = detect_red_flags(
        user_text
        or image_text
        or source_text
    )

    # =====================================================
    # 9. DISCLOSURE
    # =====================================================

    disclosure = detect_disclosure(
        user_text
        or image_text
        or source_text
    )

    # =====================================================
    # 10. LIVE WEB EVIDENCE COLLECTION
    # =====================================================

    all_evidence = []

    seen_urls = set()

    # -----------------------------------------------------
    # DIRECT USER-SUPPLIED URL
    # -----------------------------------------------------

    if source_url and source_text:

        direct_evidence = (
            _build_direct_source_evidence(
                source_url,
                source_text
            )
        )

        if direct_evidence:

            direct_url = (
                direct_evidence[
                    "source_url"
                ]
            )

            seen_urls.add(
                direct_url
            )

            all_evidence.append(
                direct_evidence
            )

            # The supplied URL is evidence,
            # not proof by itself.

            for claim in claims:

                claim["evidence"].append(
                    direct_evidence.copy()
                )

            print(
                "[TrustLens AI] Added user "
                "supplied URL as evidence: "
                f"{source_url}"
            )

    # -----------------------------------------------------
    # PREFERRED DOMAIN
    # -----------------------------------------------------

    preferred_domain = None

    if source_url:

        try:

            preferred_domain = (
                urlparse(source_url)
                .netloc
                .lower()
                .replace(
                    "www.",
                    ""
                )
            )

        except Exception:

            preferred_domain = None

    # -----------------------------------------------------
    # SEARCH EVERY CLAIM
    # -----------------------------------------------------

    for claim in claims:

        query = (
            claim.get("text", "")
            .strip()
        )

        if not query:
            continue

        try:

            results = perform_web_search(
                query=query,
                max_results=6,
                preferred_domain=preferred_domain
            )

        except Exception as exc:

            print(
                "[SearchService] Search failed "
                f"for '{query}': "
                f"{type(exc).__name__}: {exc}"
            )

            results = []

        for result in results:

            if not isinstance(
                result,
                dict
            ):
                continue

            url = result.get(
                "source_url",
                ""
            )

            if not url:
                continue

            if url in seen_urls:
                continue

            seen_urls.add(url)

            evidence = (
                _normalize_evidence(
                    result
                )
            )

            all_evidence.append(
                evidence
            )

            claim["evidence"].append(
                evidence
            )

    print(
        "[TrustLens AI] Total live evidence "
        f"sources: {len(all_evidence)}"
    )

    # =====================================================
    # 11. SAFE VERIFICATION GATE
    # =====================================================

    (
        overall_status,
        risk_level,
        explanation
    ) = verify_claims_with_evidence(
        claims=claims,
        evidence_list=all_evidence,
        red_flags=red_flags,
        disclosure=disclosure
    )

    # =====================================================
    # 12. GEMINI SEMANTIC VERIFICATION
    # =====================================================

    llm_result = None

    # IMPORTANT:
    #
    # Gemini is allowed to reason about evidence,
    # but it is NOT allowed to invent evidence.
    #
    # Only URLs actually retrieved above can be used
    # to mark a claim Verified/Contradicted.

    if all_evidence:

        try:

            llm_result = (
                llm_provider.analyze_with_llm(
                    content=final_content,
                    claims=claims,
                    retrieved_evidence=all_evidence
                )
            )

        except Exception as exc:

            print(
                "[TrustLens AI] LLM verification "
                f"failed: {type(exc).__name__}: {exc}"
            )

    else:

        print(
            "[TrustLens AI] No live web evidence "
            "available. Gemini verification skipped."
        )

    # =====================================================
    # 13. APPLY GEMINI RESULTS SAFELY
    # =====================================================

    if llm_result:

        llm_claims = llm_result.get(
            "claims",
            []
        )

        llm_by_text = {}

        for item in llm_claims:

            if not isinstance(
                item,
                dict
            ):
                continue

            returned_claim = item.get(
                "claim"
            )

            if not returned_claim:
                continue

            normalized = (
                _normalize_claim_text(
                    returned_claim
                )
            )

            if normalized:

                llm_by_text[
                    normalized
                ] = item

        for claim in claims:

            original_text = (
                claim.get(
                    "text",
                    ""
                )
            )

            normalized_original = (
                _normalize_claim_text(
                    original_text
                )
            )

            decision = llm_by_text.get(
                normalized_original
            )

            if not decision:

                print(
                    "[TrustLens AI] Could not "
                    "match Gemini result to claim: "
                    f"{original_text}"
                )

                continue

            status = str(
                decision.get(
                    "status",
                    "UNVERIFIABLE"
                )
            ).upper()

            evidence_urls = set(
                decision.get(
                    "evidence_urls",
                    []
                )
            )

            # -------------------------------------------------
            # ONLY ACCEPT URLs THAT WERE ACTUALLY RETRIEVED
            # -------------------------------------------------

            actual_claim_urls = {
                evidence.get(
                    "source_url"
                )
                for evidence in claim.get(
                    "evidence",
                    []
                )
                if evidence.get(
                    "source_url"
                )
            }

            valid_evidence_urls = (
                evidence_urls
                & actual_claim_urls
            )

            # -------------------------------------------------
            # SAFETY RULE
            # -------------------------------------------------
            #
            # Gemini cannot mark a claim as supported or
            # contradicted without citing at least one
            # source that our backend actually retrieved.
            # -------------------------------------------------

            if (
                status in {
                    "SUPPORTED",
                    "CONTRADICTED",
                    "PARTIALLY_SUPPORTED"
                }
                and not valid_evidence_urls
            ):

                print(
                    "[TrustLens AI] Gemini returned "
                    f"{status} without valid retrieved "
                    "evidence. Forcing Unverified."
                )

                status = "UNVERIFIABLE"

            mapping = {
                "SUPPORTED": "Verified",

                "CONTRADICTED": "Contradicted",

                "PARTIALLY_SUPPORTED":
                    "Partially Verified",

                "UNVERIFIABLE":
                    "Unverified"
            }

            claim["status"] = mapping.get(
                status,
                "Unverified"
            )

            confidence = decision.get(
                "confidence"
            )

            if isinstance(
                confidence,
                (int, float)
            ):

                claim["confidence"] = max(
                    0.0,
                    min(
                        1.0,
                        float(confidence)
                    )
                )

            else:

                claim["confidence"] = None

            claim[
                "verification_explanation"
            ] = decision.get(
                "explanation",
                ""
            )

            # -------------------------------------------------
            # MARK ONLY VALID EVIDENCE
            # -------------------------------------------------

            for evidence in claim.get(
                "evidence",
                []
            ):

                evidence_url = evidence.get(
                    "source_url"
                )

                if (
                    evidence_url
                    not in valid_evidence_urls
                ):
                    continue

                if status == "SUPPORTED":

                    evidence[
                        "status"
                    ] = "Supports"

                elif status == "CONTRADICTED":

                    evidence[
                        "status"
                    ] = "Contradicts"

                else:

                    evidence[
                        "status"
                    ] = "Inconclusive"

        # -------------------------------------------------
        # OVERALL GEMINI RESULT
        # -------------------------------------------------

        llm_overall_status = str(
            llm_result.get(
                "overall_status",
                ""
            )
        ).strip()

        llm_risk_level = str(
            llm_result.get(
                "risk_level",
                ""
            )
        ).strip()

        llm_explanation = str(
            llm_result.get(
                "explanation",
                ""
            )
        ).strip()

        # -------------------------------------------------
        # DO NOT ACCEPT "VERIFIED" OVERALL RESULT
        # IF NO CLAIM WAS ACTUALLY VERIFIED.
        # -------------------------------------------------

        verified_claims = [
            claim
            for claim in claims
            if claim.get(
                "status"
            ) == "Verified"
        ]

        contradicted_claims = [
            claim
            for claim in claims
            if claim.get(
                "status"
            ) == "Contradicted"
        ]

        partially_verified_claims = [
            claim
            for claim in claims
            if claim.get(
                "status"
            ) == "Partially Verified"
        ]

        unverified_claims = [
            claim
            for claim in claims
            if claim.get(
                "status"
            ) == "Unverified"
        ]

        if verified_claims:

            overall_status = (
                llm_overall_status
                or "Verified"
            )

        elif contradicted_claims:

            overall_status = (
                llm_overall_status
                or "Contradicted"
            )

        elif partially_verified_claims:

            overall_status = (
                "Partially Verified"
            )

        else:

            overall_status = (
                "Needs more evidence"
            )

        if llm_risk_level:

            risk_level = llm_risk_level

        if llm_explanation:

            explanation = (
                llm_explanation
            )

    else:

        # =================================================
        # GEMINI FAILED
        # =================================================

        overall_status = (
            "Needs more evidence"
        )

        risk_level = "Medium"

        for claim in claims:

            claim["status"] = (
                "Unverified"
            )

            claim["confidence"] = None

            claim[
                "verification_explanation"
            ] = (
                "Live web evidence was "
                "retrieved, but semantic AI "
                "verification was unavailable. "
                "The claim was not marked "
                "as verified."
            )

        explanation = (
            "Live web sources were searched, "
            "but semantic AI verification was "
            "unavailable. No claim was marked "
            "as verified without semantic "
            "comparison against retrieved evidence."
        )

    # =====================================================
    # 14. FINAL SAFETY CHECK
    # =====================================================

    #
    # If there is no live evidence, nothing can be verified.
    #

    if not all_evidence:

        overall_status = (
            "Needs more evidence"
        )

        for claim in claims:

            claim["status"] = (
                "Unverified"
            )

            claim["confidence"] = None

        explanation = (
            "No live web evidence could be "
            "retrieved for the submitted claim. "
            "More evidence is required."
        )

    # =====================================================
    # 15. UNCERTAINTY NOTICE
    # =====================================================

    explanation = (
        f"{explanation.strip()}\n\n"
        "Uncertainty: AI-based verification can "
        "contain errors. Verify important "
        "information against the original "
        "authoritative source."
    )

    # =====================================================
    # 16. DATABASE STORAGE
    # =====================================================

    post_id = None

    if db is not None:

        try:

            creator_id = None

            # -------------------------------------------------
            # CREATOR
            # -------------------------------------------------

            if creator_name:

                creator = (
                    db.query(Creator)
                    .filter(
                        Creator.handle
                        == creator_name
                    )
                    .first()
                )

                if not creator:

                    creator = Creator(
                        handle=creator_name,

                        name=(
                            creator_name
                            .replace(
                                "@",
                                ""
                            )
                            .capitalize()
                        ),

                        platform="Social Media"
                    )

                    db.add(
                        creator
                    )

                    db.flush()

                creator_id = (
                    creator.id
                )

            # -------------------------------------------------
            # POST
            # -------------------------------------------------

            post = Post(
                content=content,

                source_url=source_url,

                creator_id=creator_id,

                overall_status=(
                    overall_status
                ),

                risk_level=risk_level,

                recommendation_detected=(
                    recommendation_detected
                ),

                disclosure_status=(
                    disclosure.get(
                        "status",
                        "No disclosure detected"
                    )
                ),

                explanation=explanation,

                created_at=datetime.utcnow()
            )

            db.add(
                post
            )

            db.flush()

            post_id = post.id

            # -------------------------------------------------
            # CLAIMS
            # -------------------------------------------------

            for claim in claims:

                claim_db = Claim(
                    post_id=post.id,

                    claim_text=claim[
                        "text"
                    ],

                    claim_type=claim.get(
                        "type",
                        "Factual assertion"
                    ),

                    status=claim.get(
                        "status",
                        "Unverified"
                    ),

                    confidence=claim.get(
                        "confidence"
                    )
                )

                db.add(
                    claim_db
                )

                db.flush()

                # -------------------------------------------------
                # EVIDENCE
                # -------------------------------------------------

                for evidence in claim.get(
                    "evidence",
                    []
                ):

                    evidence_db = Evidence(
                        claim_id=claim_db.id,

                        source_name=evidence.get(
                            "source_name",
                            "Web Source"
                        ),

                        document_title=evidence.get(
                            "document_title",
                            "Retrieved Web Source"
                        ),

                        document_date=evidence.get(
                            "document_date"
                        ),

                        excerpt=evidence.get(
                            "excerpt",
                            ""
                        ),

                        source_url=evidence.get(
                            "source_url"
                        ),

                        relevance=evidence.get(
                            "relevance",
                            0.0
                        ),

                        source_type=evidence.get(
                            "source_type",
                            "Web Source"
                        ),

                        status=evidence.get(
                            "status",
                            "Inconclusive"
                        )
                    )

                    db.add(
                        evidence_db
                    )

            # -------------------------------------------------
            # RED FLAGS
            # -------------------------------------------------

            for flag in red_flags:

                flag_db = RedFlag(
                    post_id=post.id,

                    category=flag.get(
                        "type",
                        "Unknown"
                    ),

                    severity=flag.get(
                        "severity",
                        "medium"
                    ),

                    explanation=flag.get(
                        "explanation",
                        ""
                    ),

                    trigger_text=flag.get(
                        "trigger_text"
                    )
                )

                db.add(
                    flag_db
                )

            db.commit()

        except Exception as exc:

            db.rollback()

            print(
                "[Orchestrator DB Error] "
                f"{type(exc).__name__}: {exc}"
            )

    # =====================================================
    # 17. FINAL RESPONSE
    # =====================================================

    return {

        "id": post_id,

        "overall_status": (
            overall_status
        ),

        "risk_level": risk_level,

        "claims": claims,

        "recommendation_detected": (
            recommendation_detected
        ),

        "red_flags": red_flags,

        "disclosure": disclosure,

        "evidence": all_evidence,

        "explanation": explanation,

        "created_at": (
            datetime.utcnow().isoformat()
        )
    }