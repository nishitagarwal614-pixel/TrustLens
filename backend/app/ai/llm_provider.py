import json
from typing import Dict, Any, Optional, List

from app.config import settings


class LLMProvider:
    """
    LLM provider for TrustLens AI.

    Gemini is used for semantic comparison between user claims
    and live web evidence.

    The LLM is never allowed to invent evidence URLs.
    It can only select URLs that were actually retrieved
    by the web-search layer.
    """

    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.provider = settings.LLM_PROVIDER.lower().strip()

        self.client = None

        if self.provider == "gemini" and self.is_available():
            try:
                from google import genai

                self.client = genai.Client(
                    api_key=self.api_key
                )

                print(
                    "[LLMProvider] Gemini client initialized."
                )

            except Exception as exc:
                print(
                    "[LLMProvider] Gemini initialization failed: "
                    f"{type(exc).__name__}: {exc}"
                )

    def is_available(self) -> bool:
        return bool(
            self.api_key
            and len(self.api_key.strip()) > 5
        )

    # =========================================================
    # GEMINI
    # =========================================================

    def _analyze_with_gemini(
        self,
        content: str,
        claims: List[Dict[str, Any]],
        retrieved_evidence: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            print(
                "[LLMProvider] Gemini API key is missing."
            )
            return None

        if self.client is None:
            print(
                "[LLMProvider] Gemini client is unavailable."
            )
            return None

        # -----------------------------------------------------
        # Build compact evidence for Gemini
        # -----------------------------------------------------

        evidence_for_llm = []

        for index, evidence in enumerate(
            retrieved_evidence or [],
            start=1
        ):
            if not isinstance(evidence, dict):
                continue

            source_url = evidence.get(
                "source_url"
            )

            if not source_url:
                continue

            evidence_for_llm.append(
                {
                    "evidence_id": index,
                    "source_name": evidence.get(
                        "source_name",
                        "Web Source"
                    ),
                    "title": evidence.get(
                        "document_title",
                        "Retrieved Web Source"
                    ),
                    "url": source_url,
                    "excerpt": evidence.get(
                        "excerpt",
                        ""
                    )[:4000],
                }
            )

        # -----------------------------------------------------
        # Build claims
        # -----------------------------------------------------

        claims_for_llm = []

        for index, claim in enumerate(
            claims or [],
            start=1
        ):
            if not isinstance(claim, dict):
                continue

            claim_text = str(
                claim.get("text", "")
            ).strip()

            if not claim_text:
                continue

            claims_for_llm.append(
                {
                    "claim_id": index,
                    "claim": claim_text,
                    "type": claim.get(
                        "type",
                        "Factual assertion"
                    ),
                }
            )

        if not claims_for_llm:
            return None

        # -----------------------------------------------------
        # Prompt
        # -----------------------------------------------------

        prompt = f"""
You are the semantic verification engine for TrustLens AI.

Your task is to verify factual claims against ONLY the
web evidence supplied below.

IMPORTANT RULES:

1. Do NOT use your own memory as evidence.
2. Do NOT invent facts.
3. Do NOT invent URLs.
4. Do NOT create evidence that is not present below.
5. A claim is SUPPORTED only when the supplied evidence
   directly supports the important factual parts of the claim.
6. A claim is CONTRADICTED only when the supplied evidence
   directly conflicts with the important factual parts.
7. If the evidence is insufficient, use UNVERIFIABLE.
8. If only some important parts are supported, use
   PARTIALLY_SUPPORTED.
9. Evidence URLs must come ONLY from the supplied evidence.
10. Be conservative. When uncertain, use UNVERIFIABLE.
11. This is verification, not financial advice.
12. Do not recommend buying, selling, or investing.

USER CONTENT:
{content}

CLAIMS:
{json.dumps(claims_for_llm, indent=2, ensure_ascii=False)}

LIVE WEB EVIDENCE:
{json.dumps(evidence_for_llm, indent=2, ensure_ascii=False)}

Return ONLY valid JSON.

Required JSON structure:

{{
  "overall_status": "Verified",
  "risk_level": "Low",
  "recommendation_detected": false,
  "explanation": "Short explanation based only on the supplied evidence.",
  "claims": [
    {{
      "claim": "Exact claim text from the CLAIMS section",
      "status": "SUPPORTED",
      "confidence": 0.95,
      "explanation": "Why the evidence supports or contradicts the claim.",
      "evidence_urls": [
        "https://example.com/source"
      ]
    }}
  ]
}}

Allowed claim statuses:

SUPPORTED
CONTRADICTED
PARTIALLY_SUPPORTED
UNVERIFIABLE

Allowed overall statuses:

Verified
Partially Verified
Unverified
Contradicted
PotentialRisk

Allowed risk levels:

High
Medium
Low
Safe

The confidence must be a number from 0.0 to 1.0.

If a claim cannot be verified, use:

"status": "UNVERIFIABLE"

and:

"evidence_urls": []

Do not put URLs in evidence_urls unless they appear
exactly in the supplied LIVE WEB EVIDENCE.
"""

        # -----------------------------------------------------
        # Models
        # -----------------------------------------------------

        models = [
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
        ]

        last_error = None

        for model_name in models:
            try:
                print(
                    "[LLMProvider] Trying Gemini model: "
                    f"{model_name}"
                )

                from google.genai import types

                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0,
                        max_output_tokens=2500,
                        response_mime_type="application/json",
                    ),
                )

                raw_text = getattr(
                    response,
                    "text",
                    None
                )

                if not raw_text:
                    print(
                        "[LLMProvider] Gemini returned empty response."
                    )
                    continue

                raw_text = raw_text.strip()

                # Remove accidental markdown JSON fences.
                if raw_text.startswith("```"):
                    raw_text = raw_text.replace(
                        "```json",
                        "",
                        1
                    )
                    raw_text = raw_text.replace(
                        "```",
                        ""
                    )
                    raw_text = raw_text.strip()

                result = json.loads(raw_text)

                if not isinstance(result, dict):
                    print(
                        "[LLMProvider] Gemini response was "
                        "not a JSON object."
                    )
                    continue

                print(
                    "[LLMProvider] Gemini verification succeeded "
                    f"using {model_name}."
                )

                return self._sanitize_result(
                    result=result,
                    claims=claims,
                    retrieved_evidence=retrieved_evidence,
                )

            except Exception as exc:
                last_error = exc

                print(
                    "[LLMProvider] Gemini model failed "
                    f"({model_name}): "
                    f"{type(exc).__name__}: {exc}"
                )

        if last_error:
            print(
                "[LLMProvider] All Gemini models failed."
            )

        return None

    # =========================================================
    # RESULT SANITIZATION
    # =========================================================

    def _sanitize_result(
        self,
        result: Dict[str, Any],
        claims: List[Dict[str, Any]],
        retrieved_evidence: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        allowed_urls = {
            str(
                evidence.get("source_url")
            ).strip()
            for evidence in (
                retrieved_evidence or []
            )
            if isinstance(evidence, dict)
            and evidence.get("source_url")
        }

        allowed_statuses = {
            "SUPPORTED",
            "CONTRADICTED",
            "PARTIALLY_SUPPORTED",
            "UNVERIFIABLE",
        }

        sanitized_claims = []

        llm_claims = result.get(
            "claims",
            []
        )

        if not isinstance(llm_claims, list):
            llm_claims = []

        for item in llm_claims:
            if not isinstance(item, dict):
                continue

            claim_text = str(
                item.get("claim", "")
            ).strip()

            if not claim_text:
                continue

            status = str(
                item.get(
                    "status",
                    "UNVERIFIABLE"
                )
            ).upper().strip()

            if status not in allowed_statuses:
                status = "UNVERIFIABLE"

            confidence = item.get(
                "confidence"
            )

            try:
                confidence = float(
                    confidence
                )

                confidence = max(
                    0.0,
                    min(
                        1.0,
                        confidence
                    )
                )

            except (
                TypeError,
                ValueError
            ):
                confidence = None

            evidence_urls = item.get(
                "evidence_urls",
                []
            )

            if not isinstance(
                evidence_urls,
                list
            ):
                evidence_urls = []

            # CRITICAL:
            # Only allow URLs that actually came
            # from the live search results.
            evidence_urls = [
                str(url).strip()
                for url in evidence_urls
                if str(url).strip()
                in allowed_urls
            ]

            sanitized_claims.append(
                {
                    "claim": claim_text,
                    "status": status,
                    "confidence": confidence,
                    "explanation": str(
                        item.get(
                            "explanation",
                            ""
                        )
                    ).strip(),
                    "evidence_urls": evidence_urls,
                }
            )

        overall_status = str(
            result.get(
                "overall_status",
                "Unverified"
            )
        ).strip()

        allowed_overall = {
            "Verified",
            "Partially Verified",
            "Unverified",
            "Contradicted",
            "PotentialRisk",
        }

        if overall_status not in allowed_overall:
            overall_status = "Unverified"

        risk_level = str(
            result.get(
                "risk_level",
                "Medium"
            )
        ).strip()

        if risk_level not in {
            "High",
            "Medium",
            "Low",
            "Safe",
        }:
            risk_level = "Medium"

        recommendation_detected = bool(
            result.get(
                "recommendation_detected",
                False
            )
        )

        explanation = str(
            result.get(
                "explanation",
                ""
            )
        ).strip()

        return {
            "overall_status": overall_status,
            "risk_level": risk_level,
            "recommendation_detected": (
                recommendation_detected
            ),
            "explanation": explanation,
            "claims": sanitized_claims,
        }

    # =========================================================
    # PUBLIC API
    # =========================================================

    def analyze_with_llm(
        self,
        content: str,
        claims: Optional[
            List[Dict[str, Any]]
        ] = None,
        retrieved_evidence: Optional[
            List[Dict[str, Any]]
        ] = None,
    ) -> Optional[Dict[str, Any]]:

        claims = claims or []
        retrieved_evidence = (
            retrieved_evidence or []
        )

        if not self.is_available():
            print(
                "[LLMProvider] No valid LLM API key."
            )
            return None

        if self.provider == "gemini":
            return self._analyze_with_gemini(
                content=content,
                claims=claims,
                retrieved_evidence=retrieved_evidence,
            )

        print(
            "[LLMProvider] Unsupported provider: "
            f"{self.provider}"
        )

        return None


llm_provider = LLMProvider()