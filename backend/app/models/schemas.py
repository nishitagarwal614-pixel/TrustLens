from typing import List, Optional, Any
from pydantic import BaseModel, Field


# =========================================================
# EVIDENCE
# =========================================================

class EvidenceItem(BaseModel):
    title: str = ""
    snippet: str = ""
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    relevance: float = 0.0
    source_type: str = "web"
    status: str = "retrieved"


# =========================================================
# CLAIMS
# =========================================================

class ClaimItem(BaseModel):
    claim: str
    claim_type: str = "factual"
    confidence: Optional[float] = None
    status: str = "Unverified"
    explanation: Optional[str] = None
    evidence: List[EvidenceItem] = Field(default_factory=list)


# =========================================================
# RED FLAGS
# =========================================================

class RedFlagItem(BaseModel):
    flag: str
    severity: str = "medium"
    explanation: Optional[str] = None


# =========================================================
# DISCLOSURE
# =========================================================

class DisclosureResult(BaseModel):
    disclosed: bool = False
    disclosure_text: Optional[str] = None
    explanation: Optional[str] = None


# =========================================================
# ANALYZE RESPONSE
# =========================================================

class AnalyzeResponse(BaseModel):
    overall_status: str = "Potential Risk"
    risk_level: str = "Medium"
    summary: Optional[str] = None

    claims: List[ClaimItem] = Field(default_factory=list)
    red_flags: List[RedFlagItem] = Field(default_factory=list)

    disclosure: Optional[DisclosureResult] = None

    official_source_verification: Optional[str] = None

    actions: List[str] = Field(default_factory=list)

    uncertainty: Optional[str] = (
        "AI-based verification can contain errors. "
        "Verify important claims against the original authoritative source."
    )

    sources: List[EvidenceItem] = Field(default_factory=list)

    metadata: Optional[dict[str, Any]] = None


# =========================================================
# REPORT CREATE
# =========================================================

class ReportCreate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    source_url: Optional[str] = None
    creator_handle: Optional[str] = None


# =========================================================
# REPORT RESPONSE
# =========================================================

class ReportResponse(BaseModel):
    id: Any
    title: Optional[str] = None
    content: Optional[str] = None
    source_url: Optional[str] = None
    creator_handle: Optional[str] = None


# =========================================================
# SIMULATOR
# =========================================================

class SimulatorQuestion(BaseModel):
    question: str
    options: List[str] = Field(default_factory=list)
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None


class SimulatorAnswerRequest(BaseModel):
    question: str
    answer: str


class SimulatorAnswerResponse(BaseModel):
    correct: bool = False
    score: Optional[float] = None
    explanation: Optional[str] = None
    correct_answer: Optional[str] = None


# =========================================================
# DASHBOARD
# =========================================================

class DashboardStatsResponse(BaseModel):
    total_reports: int = 0
    total_claims: int = 0
    verified_claims: int = 0
    unverified_claims: int = 0
    contradicted_claims: int = 0
    high_risk_reports: int = 0
    medium_risk_reports: int = 0
    low_risk_reports: int = 0