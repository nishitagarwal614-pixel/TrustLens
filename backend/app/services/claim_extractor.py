import re
from typing import List, Dict, Any, Tuple


RECOMMENDATION_PATTERNS = [
    r"\bbuy\b(?:\s+[A-Za-z0-9]+|\s+now|\s+immediately)?",
    r"\bsell\b(?:\s+[A-Za-z0-9]+|\s+now)?",
    r"\binvest\s+(?:₹|in|\$|\d+)",
    r"\baccumulate\b",
    r"\btarget price\b",
    r"\bentry price\b",
    r"\bstop loss\b",
]


def _split_sentences(text: str) -> List[str]:
    """
    Split text into sentences without breaking decimal numbers.

    Examples:
        6.00% -> stays together
        5.50% -> stays together
        6.00% to 5.50%. Next sentence -> splits correctly
    """

    cleaned = re.sub(r"\s+", " ", text.strip())

    if not cleaned:
        return []

    # Protect decimal points temporarily.
    # 6.00 -> 6<DECIMAL>00
    # 5.50 -> 5<DECIMAL>50
    protected = re.sub(
        r"(?<=\d)\.(?=\d)",
        "<DECIMAL>",
        cleaned,
    )

    # Split only on actual sentence-ending punctuation.
    parts = re.split(
        r"[.!?]+(?=\s+|$)|\n+",
        protected,
    )

    sentences = []

    for part in parts:
        restored = part.replace("<DECIMAL>", ".").strip()

        if len(restored) > 5:
            sentences.append(restored)

    return sentences


def _contains_recommendation(text: str) -> bool:
    """Return True when the text contains an investment recommendation."""

    for pattern in RECOMMENDATION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def _classify_claim(sentence: str) -> str:
    """
    Classify a claim.

    IMPORTANT:
    This function does NOT decide whether a claim is true.
    Verification happens later using live web evidence.
    """

    sentence_lower = sentence.lower()

    # Future price prediction / return claim
    future_terms = [
        "will rise",
        "will definitely rise",
        "will double",
        "will surge",
        "will fall",
        "will definitely fall",
        "to rise",
        "guaranteed profit",
        "guaranteed to rise",
        "target of",
        "next week",
        "next month",
        "10x",
    ]

    if any(term in sentence_lower for term in future_terms):
        return "Future price prediction"

    # Official financial metric / company performance
    financial_terms = [
        "revenue",
        "profit",
        "quarterly report",
        "results",
        "growth",
        "margin",
        "ebitda",
        "pat",
        "year-over-year",
        "yoy",
        "units",
    ]

    if any(term in sentence_lower for term in financial_terms):
        return "Official financial metric"

    # Macroeconomic / educational statement
    macro_terms = [
        "interest rate",
        "borrowing cost",
        "inflation",
        "monetary policy",
        "rbi",
        "repo rate",
        "fed",
        "sectors",
    ]

    if any(term in sentence_lower for term in macro_terms):
        return "Educational / Macroeconomic statement"

    # Promotional / subscription claim
    promotional_terms = [
        "referral",
        "code",
        "join",
        "premium",
        "discount",
        "tips group",
    ]

    if any(term in sentence_lower for term in promotional_terms):
        return "Promotional / Advisory offer"

    # Investment recommendation
    if _contains_recommendation(sentence):
        return "Investment recommendation"

    return "Factual assertion"


def extract_claims_and_recommendations(
    text: str,
) -> Tuple[List[Dict[str, Any]], bool]:
    """
    Extract distinct claims from user-provided text.

    This function:
    - preserves decimal numbers such as 6.00% and 5.50%
    - detects investment recommendations
    - classifies claims
    - NEVER marks a claim as verified
    """

    cleaned = text.strip()

    if not cleaned:
        return [], False

    sentences = _split_sentences(cleaned)

    recommendation_detected = _contains_recommendation(cleaned)

    claims: List[Dict[str, Any]] = []

    for sentence in sentences:
        claim_type = _classify_claim(sentence)

        claims.append(
            {
                "text": sentence,
                "type": claim_type,
                "status": "Unverified",
                "confidence": None,
                "evidence": [],
            }
        )

    # If sentence extraction somehow fails,
    # preserve the complete original input.
    if not claims:
        claims.append(
            {
                "text": cleaned,
                "type": "Factual assertion",
                "status": "Unverified",
                "confidence": None,
                "evidence": [],
            }
        )

    return claims, recommendation_detected