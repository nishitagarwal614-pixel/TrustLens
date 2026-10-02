import json
import time
import requests

from typing import Dict, Any, Optional, List

from app.config import settings

from google import genai
from google.genai import types


class LLMProvider:

    def __init__(self):

        self.api_key = (
            settings.LLM_API_KEY
        )

        self.provider = (
            settings.LLM_PROVIDER.lower()
        )


    # =====================================================
    # AVAILABILITY
    # =====================================================

    def is_available(self) -> bool:

        return bool(
            self.api_key
            and len(
                self.api_key.strip()
            ) > 5
        )


    # =====================================================
    # PROMPT
    # =====================================================

    def _build_prompt(
        self,
        content: str,
        claims: List[Dict[str, Any]],
        evidence: List[Dict[str, Any]]
    ) -> str:

        return f"""
You are TrustLens AI, an evidence-verification system.

Your job is NOT to give investment advice.

You must verify factual claims using ONLY the evidence
actually retrieved and supplied below.

USER CONTENT:
{content}

EXTRACTED CLAIMS:
{json.dumps(claims, indent=2)}

RETRIEVED EVIDENCE:
{json.dumps(evidence, indent=2)}

STRICT RULES:

1. Never invent facts.
2. Never invent sources.
3. Never cite a source that is not present in RETRIEVED EVIDENCE.
4. Do not treat a search-engine snippet alone as proof.
5. Prefer primary and official sources.
6. Similar wording is NOT enough to establish a claim as true.
7. If evidence directly supports the claim, use SUPPORTED.
8. If evidence directly contradicts the claim, use CONTRADICTED.
9. If evidence supports only part of the claim, use PARTIALLY_SUPPORTED.
10. If evidence is insufficient, use UNVERIFIABLE.
11. Future stock-price predictions cannot be treated as verified facts.
12. Do not infer certainty that is not present in the evidence.
13. A regulatory source is relevant only if it actually addresses the claim.
14. Questions and instructions are not factual claims.
15. Keep explanations concise.
16. Do not provide investment recommendations.
17. Use ONLY the retrieved evidence supplied above.
18. Do not claim that a date is verified unless the evidence actually
    contains or clearly establishes that date.
19. If an official source confirms the numbers but not the date,
    use PARTIALLY_SUPPORTED.

For every claim return:

- claim
- status
- confidence
- explanation
- evidence_urls

Confidence must represent confidence in the VERIFICATION DECISION,
not confidence that the underlying claim is true.

Use confidence only when there is enough evidence to justify it.
Otherwise use null.

Allowed statuses:

SUPPORTED
CONTRADICTED
PARTIALLY_SUPPORTED
UNVERIFIABLE

Return ONLY valid JSON:

{{
  "claims": [
    {{
      "claim": "...",
      "status": "SUPPORTED",
      "confidence": 0.0,
      "explanation": "...",
      "evidence_urls": []
    }}
  ],
  "overall_status": "UNVERIFIABLE",
  "risk_level": "Medium",
  "explanation": "..."
}}
"""


    # =====================================================
    # GEMINI CALL
    # =====================================================

    def _call_gemini(
        self,
        client,
        model: str,
        prompt: str
    ) -> Dict[str, Any]:

        print(
            f"[LLMProvider] Trying Gemini model: {model}"
        )

        start_time = time.time()

        response = client.models.generate_content(

            model=model,

            contents=prompt,

            config=types.GenerateContentConfig(

                response_mime_type=(
                    "application/json"
                ),

                # Keep the output small.
                max_output_tokens=1500,

                # Prevent long unnecessary responses.
                candidate_count=1,

                # IMPORTANT:
                # Disable automatic function calling.
                automatic_function_calling=(
                    types.AutomaticFunctionCallingConfig(
                        disable=True
                    )
                )
            )
        )

        elapsed = (
            time.time()
            - start_time
        )

        print(
            f"[LLMProvider] {model} response "
            f"received in {elapsed:.2f}s"
        )

        if not response.text:

            raise ValueError(
                "Gemini returned an empty response."
            )

        return json.loads(
            response.text
        )


    # =====================================================
    # MAIN LLM ANALYSIS
    # =====================================================

    def analyze_with_llm(
        self,
        content: str,
        claims: List[Dict[str, Any]],
        retrieved_evidence: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:

        if not self.is_available():

            print(
                "[LLMProvider] API key is not available."
            )

            return None


        prompt = self._build_prompt(
            content,
            claims,
            retrieved_evidence
        )


        # =================================================
        # GEMINI
        # =================================================

        if self.provider == "gemini":

            try:

                # 30-second HARD timeout.
                #
                # Google GenAI SDK uses milliseconds
                # for HttpOptions.timeout.

                client = genai.Client(

                    api_key=self.api_key,

                    http_options=types.HttpOptions(
                        timeout=30000
                    )
                )

            except Exception as exc:

                print(
                    "[LLMProvider] Failed to create "
                    f"Gemini client: {exc}"
                )

                return None


            models_to_try = [

                "gemini-3.8-flash",

                "gemini-3.7-flash",

                "gemini-3.6-flash",
            ]


            for model in models_to_try:

                try:

                    result = (
                        self._call_gemini(
                            client,
                            model,
                            prompt
                        )
                    )


                    print(
                        "[LLMProvider] Gemini "
                        f"verification succeeded "
                        f"using {model}."
                    )


                    try:
                        client.close()
                    except Exception:
                        pass


                    return result


                except Exception as exc:

                    error_text = (
                        str(exc).lower()
                    )


                    print(
                        f"[LLMProvider] "
                        f"{model} failed: "
                        f"{type(exc).__name__}: "
                        f"{exc}"
                    )


                    # -----------------------------------------
                    # TEMPORARY / TIMEOUT ERRORS
                    # -----------------------------------------

                    temporary_error = (

                        "503"
                        in error_text

                        or "unavailable"
                        in error_text

                        or "high demand"
                        in error_text

                        or "temporarily"
                        in error_text

                        or "timeout"
                        in error_text

                        or "timed out"
                        in error_text

                        or "deadline"
                        in error_text

                        or "connection"
                        in error_text
                    )


                    if temporary_error:

                        print(
                            "[LLMProvider] "
                            "Gemini model unavailable "
                            "or timed out."
                        )

                        print(
                            "[LLMProvider] "
                            "Trying next model..."
                        )

                        # Small delay only.
                        time.sleep(1)

                        continue


                    # -----------------------------------------
                    # INVALID / NON-RETRYABLE
                    # -----------------------------------------

                    print(
                        "[LLMProvider] "
                        "Non-retryable Gemini error."
                    )

                    break


            try:
                client.close()
            except Exception:
                pass


            print(
                "[LLMProvider] All Gemini models "
                "were unavailable or timed out."
            )


            return None


        # =================================================
        # OPENAI FALLBACK
        # =================================================

        if self.provider == "openai":

            try:

                headers = {

                    "Authorization":
                        f"Bearer {self.api_key}",

                    "Content-Type":
                        "application/json"
                }


                payload = {

                    "model":
                        "gpt-4o-mini",

                    "messages": [

                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],

                    "response_format": {

                        "type":
                            "json_object"
                    },

                    "temperature":
                        0.0
                }


                response = requests.post(

                    "https://api.openai.com/v1/chat/completions",

                    headers=headers,

                    json=payload,

                    timeout=30
                )


                response.raise_for_status()


                data = (
                    response.json()
                )


                return json.loads(

                    data[
                        "choices"
                    ][0][
                        "message"
                    ][
                        "content"
                    ]
                )


            except Exception as exc:

                print(
                    "[LLMProvider] OpenAI "
                    "verification failed: "
                    f"{type(exc).__name__}: "
                    f"{exc}"
                )

                return None


        # =================================================
        # UNKNOWN PROVIDER
        # =================================================

        print(
            "[LLMProvider] Unsupported provider: "
            f"{self.provider}"
        )

        return None


# =========================================================
# SINGLETON
# =========================================================

llm_provider = LLMProvider()