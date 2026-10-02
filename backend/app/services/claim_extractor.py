import re
from typing import List, Dict, Any, Tuple


RECOMMENDATION_PATTERNS = [
    r"\bbuy\b",
    r"\bsell\b",
    r"\binvest\b",
    r"\baccumulate\b",
    r"\btarget price\b",
    r"\bprice target\b",
    r"\bentry price\b",
    r"\bstop loss\b",
    r"\bsubscribe\b",
]


QUESTION_PATTERNS = [
    r"^\s*(is|are|was|were|does|did|do|can|could|would|will|should)\b",
    r"\bverify whether\b",
    r"\bcan you verify\b",
    r"\bis this (claim|statement|true|correct)\b",
    r"\bplease verify\b",
    r"\bcheck whether\b",
    r"\bverify (this|the claim|the statement)\b",
]


REGULATORY_TERMS = [
    "rbi",
    "reserve bank",
    "repo rate",
    "reverse repo",
    "interest rate",
    "monetary policy",
    "cash reserve ratio",
    "crr",
    "statutory liquidity ratio",
    "slr",
    "inflation",
    "sebi",
    "regulation",
    "regulatory",
    "nse",
    "bse",
    "central bank",
    "policy rate",
]


FINANCIAL_TERMS = [
    "revenue",
    "profit",
    "quarterly",
    "financial results",
    "growth",
    "margin",
    "ebitda",
    "pat",
    "year-over-year",
    "year over year",
    "yoy",
    "units",
    "earnings",
    "sales",
    "turnover",
]


PROMOTIONAL_TERMS = [
    "referral",
    "premium",
    "discount",
    "tips group",
    "subscription",
    "affiliate",
    "promo",
    "promotional",
]


FUTURE_CLAIM_PATTERNS = [
    r"\bwill rise\b",
    r"\bwill fall\b",
    r"\bwill increase\b",
    r"\bwill decrease\b",
    r"\bwill double\b",
    r"\bwill surge\b",
    r"\bwill crash\b",
    r"\bexpected to rise\b",
    r"\bexpected to fall\b",
    r"\bexpected to increase\b",
    r"\bexpected to decrease\b",
    r"\blikely to rise\b",
    r"\blikely to fall\b",
    r"\blikely to increase\b",
    r"\blikely to decrease\b",
    r"\bguaranteed return\b",
    r"\bguaranteed profit\b",
    r"\btarget price\b",
    r"\bprice target\b",
    r"\b\d+x\b",
]


def _is_instruction_or_question(sentence: str) -> bool:
    text = sentence.strip().lower()

    if not text:
        return True

    for pattern in QUESTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def _classify_claim(sentence: str) -> str:
    text = sentence.lower()

    # Regulatory/macro check comes BEFORE percentage/future checks.
    # This prevents:
    # "repo rate reduced by 50%" from being treated as
    # a future-return claim.
    if any(term in text for term in REGULATORY_TERMS):
        return "Regulatory / macroeconomic statement"

    if any(term in text for term in FINANCIAL_TERMS):
        return "Financial metric"

    if any(term in text for term in PROMOTIONAL_TERMS):
        return "Promotional claim"

    if any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in RECOMMENDATION_PATTERNS
    ):
        return "Investment recommendation"

    if any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in FUTURE_CLAIM_PATTERNS
    ):
        return "Future price / return claim"

    return "Factual assertion"


def _split_sentences(text: str) -> List[str]:
    """
    Split normal prose into sentences while preserving the
    complete sentence text.
    """

    text = text.strip()

    if not text:
        return []

    # Normalize whitespace but preserve sentence content.
    text = re.sub(r"[ \t]+", " ", text)

    # Split after ., ! or ?
    sentences = re.split(
        r"(?<=[.!?])\s+|\n+",
        text
    )

    cleaned = []

    for sentence in sentences:
        sentence = sentence.strip()

        if not sentence:
            continue

        # Remove common bullet characters only.
        sentence = re.sub(
            r"^[•●▪◦\-*]+\s*",
            "",
            sentence
        ).strip()

        if len(sentence) < 10:
            continue

        cleaned.append(sentence)

    return cleaned


def extract_claims_and_recommendations(
    text: str,
) -> Tuple[List[Dict[str, Any]], bool]:

    if not text:
        return [], False

    cleaned = text.strip()

    if not cleaned:
        return [], False

    recommendation_detected = any(
        re.search(
            pattern,
            cleaned,
            re.IGNORECASE
        )
        for pattern in RECOMMENDATION_PATTERNS
    )

    sentences = _split_sentences(cleaned)

    claims: List[Dict[str, Any]] = []

    for sentence in sentences:

        if _is_instruction_or_question(sentence):
            continue

        sentence = sentence.strip()

        if not sentence:
            continue

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

    # Important fallback:
    # If the input is a valid factual statement but sentence
    # splitting somehow produced nothing, use the entire input.
    if not claims:
        fallback = cleaned.strip()

        if fallback and not _is_instruction_or_question(fallback):
            claims.append(
                {
                    "text": fallback,
                    "type": _classify_claim(fallback),
                    "status": "Unverified",
                    "confidence": None,
                    "evidence": [],
                }
            )

    return claims, recommendation_detected