from typing import List, Dict, Any, Tuple
from urllib.parse import urlparse


OFFICIAL_DOMAINS = {
    "sebi.gov.in",
    "rbi.org.in",
    "nseindia.com",
    "bseindia.com",
    "gov.in",
    "nic.in",
}


def get_domain(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().replace(
            "www.",
            ""
        )
    except Exception:
        return ""


def is_authoritative(url: str) -> bool:
    domain = get_domain(url)

    return any(
        domain == official
        or domain.endswith("." + official)
        for official in OFFICIAL_DOMAINS
    )


def _relevant_evidence(
    claim_text: str,
    evidence: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:

    claim_words = {
        word.lower().strip(".,!?():;\"'")
        for word in claim_text.split()
        if len(word) >= 4
    }

    matches = []

    for item in evidence:

        page_text = (
            item.get("page_text")
            or item.get("excerpt")
            or ""
        ).lower()

        if not page_text:
            continue

        matched_words = [
            word
            for word in claim_words
            if word in page_text
        ]

        # This is only evidence retrieval.
        # It is NOT used to declare a claim true.
        if len(matched_words) >= max(
            2,
            min(
                6,
                len(claim_words) // 3
            )
        ):
            matches.append(item)

    return matches


def verify_claims_with_evidence(
    claims: List[Dict[str, Any]],
    evidence_list: List[Dict[str, Any]],
    red_flags: List[Dict[str, Any]],
    disclosure: Dict[str, Any]
) -> Tuple[str, str, str]:

    if not claims:
        return (
            "Unverifiable",
            "Low",
            "No factual claim could be extracted from the supplied content."
        )

    has_supported = False
    has_contradicted = False
    has_unverified = False

    for claim in claims:

        relevant = _relevant_evidence(
            claim["text"],
            evidence_list
        )

        authoritative = [
            item
            for item in relevant
            if is_authoritative(
                item.get(
                    "source_url",
                    ""
                )
            )
        ]

        claim["evidence"] = (
            authoritative
            if authoritative
            else relevant
        )

        # Important:
        # Retrieval alone does NOT prove a claim.
        # Semantic verification happens in the LLM layer.
        claim["status"] = "Unverified"
        claim["confidence"] = None

        if claim["evidence"]:
            for item in claim["evidence"]:
                item["status"] = "Inconclusive"

        else:
            has_unverified = True

    # Until semantic verification happens,
    # the safe result is unverified.
    if has_contradicted:
        return (
            "Contradicted",
            "High",
            "The supplied claim conflicts with authoritative evidence."
        )

    if has_supported and not has_unverified:
        return (
            "Verified",
            "Low",
            "The supplied claim is supported by authoritative evidence."
        )

    return (
        "Unverified",
        "Medium",
        "Relevant information could not be established as sufficient "
        "evidence for the supplied claim."
    )