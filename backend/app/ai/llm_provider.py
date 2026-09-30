import os
import json
import requests
from typing import Dict, Any, Optional
from app.config import settings

class LLMProvider:
    """
    Pluggable LLM interface allowing provider swaps (OpenAI, Gemini, Anthropic)
    with automatic, seamless local demo/rule fallback when no API key is provided.
    """
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.provider = settings.LLM_PROVIDER.lower()

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def analyze_with_llm(self, content: str, retrieved_evidence: list) -> Optional[Dict[str, Any]]:
        """
        Calls external LLM if configured; returns structured dict or None to trigger local fallback.
        """
        if not self.is_available():
            return None

        prompt = f"""
You are TrustLens AI, a financial content verification analyst.
Analyze the following financial post:
\"\"\"{content}\"\"\"

Retrieved Official Evidence:
{json.dumps(retrieved_evidence, indent=2)}

Produce a JSON object with:
- overall_status: "Verified" | "Partially Verified" | "Unverified" | "Contradicted" | "Potential Risk"
- risk_level: "High" | "Medium" | "Low" | "Safe"
- recommendation_detected: boolean
- explanation: brief justification
"""

        try:
            if self.provider == "openai":
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1
                }
                res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=8)
                if res.status_code == 200:
                    data = res.json()
                    return json.loads(data["choices"][0]["message"]["content"])
        except Exception as e:
            print(f"[LLMProvider Warning] LLM call failed, falling back to local engine: {e}")

        return None

llm_provider = LLMProvider()
