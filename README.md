# 🛡️ TrustLens AI

> **"Verify before you trust."**  
> AI-powered financial content verification and retail-investor protection platform.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 1. Project Overview

**TrustLens AI** is an AI-powered financial content verification and retail investor protection platform. It analyzes financial content—such as social media posts, captions, articles, newsletters, and manually entered text—to detect unsupported financial assertions, manipulative urgency language, guaranteed return traps, and undisclosed sponsorships.

By cross-referencing extracted assertions against audited corporate filings (NSE/BSE) and statutory regulatory directives (SEBI/RBI) using a lightweight Retrieval-Augmented Generation (RAG) pipeline, TrustLens AI provides evidence-backed transparency without acting as a financial advisor.

> **CRITICAL LEGAL NOTICE:**  
> TrustLens AI provides informational verification and financial literacy assistance. It does **NOT** provide investment advice, stock ratings, or buy/sell recommendations.

---

## 🎯 2. Problem Statement

Retail investor participation in equity markets has expanded dramatically. However, this has been accompanied by a surge in:
1. **Unregistered Finfluencers & Stock-Tip Channels:** Telegram and WhatsApp channels promising "100% sure-shot intraday gains" or "guaranteed 50% weekly returns".
2. **Manufactured Urgency & FOMO:** Artificial scarcity ("only 10 spots left", "buy immediately before market open") that pressures retail investors to bypass fundamental due diligence.
3. **Missing Sponsorship Disclosures:** Covert commercial partnerships, referral kickbacks, and affiliate discount funnels operating without `#Sponsored` or `#Ad` tags.
4. **Factual Distortions:** Unverified or contradictory numbers circulated on social media that clash directly with audited stock exchange disclosures.

---

## 💡 3. Solution

TrustLens AI delivers an objective, five-stage verification pipeline:

```
USER ENTERS FINANCIAL CONTENT
              ↓
      AI EXTRACTS CLAIMS
              ↓
     CLAIM CLASSIFICATION
              ↓
     RED-FLAG DETECTION
              ↓
  OFFICIAL-SOURCE VERIFICATION (RAG)
              ↓
     DISCLOSURE ANALYSIS
              ↓
      RISK CLASSIFICATION
              ↓
     EVIDENCE + EXPLANATION
              ↓
USER CAN REPORT / LEARN IN SIMULATOR
```

Statuses used:
- ✅ **Verified:** Supported by audited primary filings or official central bank releases.
- 🟡 **Partially Verified:** Some claims substantiated; others lack documentary record.
- ⚠️ **Unverified:** No documentary corroboration in official disclosures.
- ❌ **Contradicted:** Claims conflict with audited numbers in primary sources.
- 🚨 **Potential Risk:** High-severity red flags (guaranteed returns, artificial scarcity) detected.

---

## ✨ 4. Key Features

1. **Forensic Claim Extraction & Classification:**
   - Detects future price targets, return promises, official metric claims, and direct investment recommendations.
2. **Multi-Category Red-Flag Detector:**
   - **Guaranteed Returns:** "risk-free", "100% profit", "sure-shot", "cannot lose".
   - **Urgency:** "buy now", "act immediately", "last chance", "limited spots".
   - **Unrealistic Claims:** "10x guaranteed", "rise 50% next week", "double your money".
   - **Emotional Manipulation:** "everyone is getting rich", "you'll regret missing this".
   - **Hidden Promotion:** Promo codes (`INVEST20`), referral links, paid Telegram funnels.
3. **Lightweight RAG Document Corroboration:**
   - Vector search across audited exchange filings (XYZ Ltd, Tata Motors, ABC Tech) and regulatory circulars (SEBI, RBI).
   - Generates exact documentary citations, excerpt quotes, and match relevance scores.
4. **Sponsorship & Disclosure Engine:**
   - Detects `#Sponsored`, `#Advertisement`, `Paid Partnership`, affiliate mechanics.
   - Clarifies: *"No disclosure detected must not be interpreted as proof of regulatory non-compliance."*
5. **Content Transparency Profiles for Creators:**
   - Objective metrics (Posts Analyzed, Verified Claims, Unverified Claims, Contradicted Claims).
   - Statutory registration verification notice (`SEBI Registered Research Analyst` vs `Not independently verified`).
6. **"Spot the Red Flag" Financial Literacy Simulator:**
   - 10 interactive real-world deceptive scenarios.
   - Instant educational feedback, +10 points per correct answer, streak counters, leveling system, and 4 milestone badges.
7. **Community Reporting & Statutory Guidance:**
   - Generates persistent reference IDs (`TL-XXXXXX`).
   - Detailed regulatory guidance with official links to SEBI SCORES 2.0 (`scores.sebi.gov.in`), National Cyber Crime portal (`cybercrime.gov.in` / 1930), and ASCI.
8. **Chrome Browser Extension:**
   - Manifest v3 popup with active webpage text selection.
   - Communicates with FastAPI backend for instantaneous risk assessment.

---

## 🏗️ 5. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React Frontend                       │
│    (Vite, Tailwind CSS, Recharts, Lucide Icons)        │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI Backend                       │
│             (Pydantic, SQLAlchemy, SQLite)             │
├────────────────────────────────────────────────────────┤
│                Analysis Orchestrator                   │
│   ┌────────────────────────────────────────────────┐   │
│   │ 1. Claim Extractor & Recommendation Scanner    │   │
│   │ 2. Red-Flag Pattern Detector                   │   │
│   │ 3. Sponsorship & Disclosure Analyzer           │   │
│   │ 4. RAG Vector Knowledge Base (Cosine / BM25)   │   │
│   │ 5. Hybrid Verification & Cross-Referencer      │   │
│   │ 6. Pluggable LLM Provider (with local fallback)│   │
│   └────────────────────────────────────────────────┘   │
└───────────────────────────┬────────────────────────────┘
                            │ Document Match
┌───────────────────────────▼────────────────────────────┐
│               Official Source Documents                │
│    (XYZ Ltd Q3, SEBI Circular, RBI MPC, Tata Motors)   │
└────────────────────────────────────────────────────────┘
```

---

## 💻 6. Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS 3.4, Recharts 2.15, Lucide React icons.
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, SQLite.
- **RAG & Vector Retrieval:** In-memory TF-IDF + n-gram vectorizer with cosine similarity and sub-paragraph chunking. Zero native C-compilation failures on Windows/Linux.
- **AI/NLP Layer:** Pluggable LLM interface supporting OpenAI / Gemini API keys, with an automatic, 100% self-contained local rule and semantic fallback engine.
- **Browser Extension:** Google Chrome Manifest v3, Content Script, Popup DOM controller.

---

## 🚀 7. Installation & Quickstart

### Prerequisites
- **Node.js:** v18+ (Node v20+ recommended)
- **Python:** v3.10+ (Tested on Python 3.10 – 3.14)

### Clone / Navigate to Project
```bash
cd trustlens-ai
```

---

### Step A: Setup & Run Backend

#### 1. Create and Activate Virtual Environment

**Windows (PowerShell / Command Prompt):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

**macOS / Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 2. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Run Backend Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*The FastAPI backend will start at `http://127.0.0.1:8000` and automatically initialize and seed the SQLite database and vector knowledge base.*

---

### Step B: Setup & Run Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

*The Vite dev server will start at `http://localhost:5173`. Open this URL in your web browser.*

---

### Step C: Load the Chrome Browser Extension (Optional)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** (top-right corner).
3. Click **Load unpacked**.
4. Select the `trustlens-ai/extension` folder.
5. Highlight financial text on any webpage or paste text into the popup to analyze instantly!

---

## 🧪 8. Demo Mode & Ready-to-Test Scenarios

TrustLens AI comes with **pre-seeded test cases** that execute completely offline without requiring any external LLM API key:

| Case | Category | Input Text | Expected Verdict | Corroborating Source |
|---|---|---|---|---|
| **Case 1** | **High Risk** | *"XYZ stock is guaranteed to rise 50% next week. Buy immediately!"* | **High Risk / Potential Risk** | Contradicts company disclosure (No guaranteed returns) |
| **Case 2** | **Verified** | *"According to XYZ Ltd's quarterly report, revenue increased by 8.4% year-over-year."* | **Safe / Verified** | Matches XYZ Ltd Q3 filing (8.4% YoY) |
| **Case 3** | **Promotional** | *"Use my referral code INVEST20 to join my premium stock-tip group."* | **Medium Risk / Possible Promotional** | Flags referral code without `#Sponsored` tag |
| **Case 4** | **Educational** | *"An increase in interest rates can affect borrowing costs and may influence certain sectors."* | **Safe / Verified** | Matches RBI Monetary Policy assessment |
| **Case 5** | **Contradicted** | *"ABC Tech reported revenue growth of 40% this quarter... stock will double!"* | **High Risk / Contradicted** | Contradicted by audited filing (Actual: 4.2%) |

### One-Click Hackathon Judge Testing
Click the **"⚡ Try Demo Analysis"** button in the header or landing page. It immediately loads Case 1, runs the AI verification pipeline, and displays the structured result dashboard.

---

## 📡 9. API Documentation

Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

### Primary Endpoints:
- `POST /api/analyze` — Analyzes financial text, extracts claims, detects red flags, queries RAG evidence, and records analysis in DB.
- `POST /api/verify-claim` — Cross-checks a single financial claim against official document chunks.
- `GET /api/history` — Returns analysis history (supports `?status_filter=High Risk`).
- `GET /api/analysis/{id}` — Fetches complete forensic audit details of an analysis record.
- `DELETE /api/analysis/{id}` — Deletes an analysis record.
- `GET /api/creators` — Lists creator Content Transparency Profiles.
- `GET /api/creator/{id}` — Returns granular creator metrics and post breakdowns.
- `POST /api/report` — Submits community report and returns unique `TL-XXXXXX` ID.
- `GET /api/reports` — Lists recorded community reports.
- `GET /api/simulator/questions` — Fetches 10 financial literacy quiz scenarios.
- `POST /api/simulator/answer` — Validates answer, increments points/streaks, and unlocks badges.
- `GET /api/dashboard/stats` — Provides aggregated telemetry for Recharts dashboard.
- `GET /api/evidence/search?query=...` — RAG vector search across official filings.
- `POST /api/documents/upload` — Ingests a new corporate disclosure into the vector store.

---

## 🔒 10. Security & Privacy

1. **Zero Frontend API Keys:** No external LLM or database credentials are ever delivered to or exposed in the client-side bundle.
2. **Environment Variable Isolation:** External providers are managed exclusively via backend environment configurations (`.env`).
3. **CORS Restrictions:** Configured to whitelist authorized origins.
4. **Resilient Local Fallback:** Operates securely offline even in air-gapped or restricted network environments.

---

## ⚖️ 11. Limitations & Future Scope

### Current Limitations:
- The prototype includes a curated demo knowledge base of exchange filings.
- Does not replace formal legal counsel or statutory dispute resolution.
- Community reports are recorded for local audit and community awareness rather than direct statutory submission.

### Future Scope:
- **Direct Exchange Firehose:** Streaming ingestion of live corporate announcements from NSE, BSE, and EDGAR APIs.
- **Multimodal Video Forensics:** Audio transcription and frame-by-frame ticker OCR for YouTube Shorts, Instagram Reels, and TikTok finfluencer videos.
- **API Connector to SEBI SCORES:** Direct integration with statutory dispute portals for automated report filing with user consent.
- **Federated Community Consensus:** Decentralized community verification staking for high-traffic financial claims.

---

## 📄 License
This project is open-source under the MIT License.
