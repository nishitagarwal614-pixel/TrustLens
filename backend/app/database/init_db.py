from datetime import datetime, timedelta
from app.database.session import engine, SessionLocal, Base
from app.models.database_models import User, Creator, Post, Claim, RedFlag, Evidence, Report, OfficialSource, LearningAttempt
from app.rag.vector_store import vector_store

SIMULATOR_QUESTIONS = [
    {
        "id": "sim-1",
        "title": "Guaranteed Return Trap",
        "author": "@QuickBucksTrader",
        "post_text": "Invest ₹5,000 today and get ₹20,000 guaranteed within 30 days! Zero risk. DM now for our VIP group.",
        "question": "What is the primary red flag in this post?",
        "options": [
            {"id": "A", "text": "Guaranteed 4x return on market-linked investment"},
            {"id": "B", "text": "Urgency and VIP group invite"},
            {"id": "C", "text": "Lack of risk disclosure or regulatory registration"},
            {"id": "D", "text": "All of the above"}
        ],
        "correct_option": "D",
        "explanation": "Guaranteed returns on equity/market investments are prohibited by SEBI regulations. Combined with zero-risk claims and private VIP invites, this is a classic high-risk advance-fee or pump scheme.",
        "category": "Guaranteed Returns",
        "points": 10
    },
    {
        "id": "sim-2",
        "title": "The Referral Discount Funnel",
        "author": "@AlphaSignalsPro",
        "post_text": "Use code PROFIT20 to unlock 20% discount on our private algorithmic call service. Limited to 15 users!",
        "question": "What regulatory issue is present in this promotional post?",
        "options": [
            {"id": "A", "text": "No issue; promotional codes are completely exempt"},
            {"id": "B", "text": "Missing mandatory '#Sponsored' / '#Advertisement' disclosure and RA registration"},
            {"id": "C", "text": "Stock algorithms are illegal"},
            {"id": "D", "text": "Discount codes cannot be alphanumeric"}
        ],
        "correct_option": "B",
        "explanation": "SEBI and advertising bodies require explicit commercial tags (#Sponsored or #Advertisement) when distributing commercial incentives or advisory subscription links.",
        "category": "Hidden Promotion",
        "points": 10
    },
    {
        "id": "sim-3",
        "title": "Interest Rates & Macro Basics",
        "author": "@MacroWise",
        "post_text": "When central banks raise policy repo rates, retail home loan and auto loan interest rates typically increase.",
        "question": "How should this financial statement be evaluated?",
        "options": [
            {"id": "A", "text": "Contradicted claim"},
            {"id": "B", "text": "Verified macroeconomic relationship supported by central bank mechanics"},
            {"id": "C", "text": "Illegal investment advice"},
            {"id": "D", "text": "Unverified speculation"}
        ],
        "correct_option": "B",
        "explanation": "This is an objective, educational statement accurately explaining monetary policy transmission to retail lending rates.",
        "category": "Educational",
        "points": 10
    },
    {
        "id": "sim-4",
        "title": "Unrealistic 10x Claim",
        "author": "@CryptoMoonX",
        "post_text": "This small-cap coin will do 100x next week. Everyone is getting rich while you sleep. Don't be left behind!",
        "question": "Which psychological manipulation tactic is being deployed here?",
        "options": [
            {"id": "A", "text": "Fear Of Missing Out (FOMO) and emotional envy"},
            {"id": "B", "text": "Audited fundamental analysis"},
            {"id": "C", "text": "Conservative capital protection"},
            {"id": "D", "text": "Tax loss harvesting"}
        ],
        "correct_option": "A",
        "explanation": "'Everyone is getting rich while you sleep' is an emotional manipulation trigger designed to override rational risk assessment with FOMO.",
        "category": "Emotional Manipulation",
        "points": 10
    },
    {
        "id": "sim-5",
        "title": "Unofficial Leaks vs Audited Filings",
        "author": "@InsiderLeaks_HQ",
        "post_text": "Secret leak: ABC Tech signed a confidential $1B defense AI contract, stock will rocket tomorrow at market open!",
        "question": "Where should a prudent investor check before acting on such rumours?",
        "options": [
            {"id": "A", "text": "Telegram tip channels"},
            {"id": "B", "text": "Official Stock Exchange (NSE/BSE) corporate disclosures section"},
            {"id": "C", "text": "Anonymous Twitter comments"},
            {"id": "D", "text": "Execute a market buy order immediately"}
        ],
        "correct_option": "B",
        "explanation": "Under SEBI LODR Regulation 30, listed companies are legally required to file material events on stock exchange portals before any public announcements.",
        "category": "Official Verification",
        "points": 10
    },
    {
        "id": "sim-6",
        "title": "Sure-Shot Intraday Tips",
        "author": "@IntradaySniper",
        "post_text": "100% sure-shot call today in Nifty Options! Guaranteed 50 points profit before 11:00 AM.",
        "question": "Why is 'sure-shot intraday call' a major red flag?",
        "options": [
            {"id": "A", "text": "Derivatives trading has zero volatility"},
            {"id": "B", "text": "SEBI studies show over 90% of retail F&O traders make net losses; no trade is 100% sure"},
            {"id": "C", "text": "Intraday trading only occurs in the afternoon"},
            {"id": "D", "text": "All options expire at opening bell"}
        ],
        "correct_option": "B",
        "explanation": "Official SEBI market studies indicate 93% of retail individual traders in Equity F&O segment incurred net losses. Promising 100% sure-shot profits in options is deceptive.",
        "category": "Guaranteed Returns",
        "points": 10
    },
    {
        "id": "sim-7",
        "title": "Missing Registration Disclosures",
        "author": "@WealthGuruSuresh",
        "post_text": "Buy Stock XYZ at ₹450 with target ₹720. My track record has 98% accuracy. Message for portfolio management.",
        "question": "What credential should an investor look for before accepting portfolio management advice?",
        "options": [
            {"id": "A", "text": "Number of YouTube subscribers"},
            {"id": "B", "text": "Blue verification checkmark on X/Twitter"},
            {"id": "C", "text": "SEBI Registered Investment Adviser (RIA) or Research Analyst (RA) registration number"},
            {"id": "D", "text": "High-end luxury car photos"}
        ],
        "correct_option": "C",
        "explanation": "Legitimate financial advice in India requires a valid SEBI registration number (INH... for RA or INA... for IA) verifiable on sebi.gov.in.",
        "category": "Regulatory Registration",
        "points": 10
    },
    {
        "id": "sim-8",
        "title": "Contradicting Official Numbers",
        "author": "@BullsEyeIndia",
        "post_text": "XYZ Ltd announced phenomenal 40% Q3 revenue growth today! Stock is massively undervalued.",
        "question": "If the audited exchange filing states revenue increased by 8.4%, what is the status of this claim?",
        "options": [
            {"id": "A", "text": "Verified"},
            {"id": "B", "text": "Contradicted by audited filing"},
            {"id": "C", "text": "Partially true"},
            {"id": "D", "text": "Safe"}
        ],
        "correct_option": "B",
        "explanation": "When social media numbers inflate audited regulatory filings (40% vs 8.4%), the claim is directly contradicted by primary sources.",
        "category": "Contradiction",
        "points": 10
    },
    {
        "id": "sim-9",
        "title": "High Urgency Pressure",
        "author": "@FastMoversClub",
        "post_text": "Only 3 minutes left to enter! Institutional buyers are stepping in. Buy immediately or regret forever!",
        "question": "Why do predatory promoters use artificial time scarcity?",
        "options": [
            {"id": "A", "text": "To give buyers sufficient time for fundamental analysis"},
            {"id": "B", "text": "To provoke panic and FOMO so investors buy without verifying company balance sheets"},
            {"id": "C", "text": "Because markets close every 3 minutes"},
            {"id": "D", "text": "To adhere to regulatory deadlines"}
        ],
        "correct_option": "B",
        "explanation": "Artificial time limits pressure retail investors into rash action before they have an opportunity to cross-check verified filings.",
        "category": "Urgency",
        "points": 10
    },
    {
        "id": "sim-10",
        "title": "Distinguishing Analysis from Advice",
        "author": "@PrudentCapital",
        "post_text": "Analysis: The company's operating margin improved from 9% to 11.4%. Investors should assess debt ratios and read full filings at NSE. Not financial advice.",
        "question": "What makes this content transparent and credible?",
        "options": [
            {"id": "A", "text": "Explicit disclaimer, factual metric citations, and directing readers to official exchange filings"},
            {"id": "B", "text": "Promises 100% risk-free returns"},
            {"id": "C", "text": "Urges immediate execution"},
            {"id": "D", "text": "Offers private Telegram signals"}
        ],
        "correct_option": "A",
        "explanation": "Transparent financial communication cites verifiable metrics, advises checking official exchanges, and explicitly clarifies it is not personalized advice.",
        "category": "Transparency",
        "points": 10
    }
]

def init_database():
    """Initializes tables and populates realistic demo dataset."""
    Base.metadata.create_all(bind=engine)
    vector_store.initialize()

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Creator).count() == 0:
            print("Seeding database with demo records...")
            # 1. Creators
            c1 = Creator(
                handle="@FinWhiz_India",
                name="Aarav Sharma (FinWhiz)",
                bio="Independent market commentator & personal finance educator. Content focuses on retail budgeting and equity basics.",
                platform="YouTube & X",
                is_registered_verified=False
            )
            c2 = Creator(
                handle="@DailyPennyPicks",
                name="Daily Penny Picks VIP",
                bio="Aggressive short-term breakout calls, momentum alerts, and high-frequency trading groups.",
                platform="Telegram & X",
                is_registered_verified=False
            )
            c3 = Creator(
                handle="@FundamentalFocus",
                name="Dr. Sneha Roy, CFA",
                bio="SEBI Registered Research Analyst (INH000012345). Balance sheet forensics, macroeconomic trends, and corporate filings breakdown.",
                platform="LinkedIn & Substack",
                is_registered_verified=True
            )
            db.add_all([c1, c2, c3])
            db.commit()

            # 2. Sample User & Learning Attempt
            now = datetime.utcnow()
            u = User(name="Retail Investor Demo", email="demo@trustlens.ai")
            db.add(u)
            db.flush()

            la = LearningAttempt(
                user_id=u.id,
                question_id="sim-1",
                answer="D",
                correct=True,
                points=10,
                created_at=now - timedelta(days=1)
            )
            db.add(la)

            # 3. Sample Reports
            r1 = Report(
                id="TL-849201",
                post_id=None,
                content_url="https://twitter.com/DailyPennyPicks/status/1892837",
                creator_name="@DailyPennyPicks",
                reason="Unregistered investment advisory & guaranteed returns",
                description="Promoted guaranteed 50% returns with high urgency, funneling retail investors into a paid Telegram room.",
                status="Received",
                created_at=now - timedelta(days=1)
            )
            r2 = Report(
                id="TL-512093",
                content_url="https://telegram.me/pumpgroups/8812",
                creator_name="@RocketPumpCalls",
                reason="Speculative pump-and-dump coordination",
                description="Coordinating synchronized market purchase spikes in illiquid small-cap penny stocks without disclosures.",
                status="Under Review",
                created_at=now - timedelta(hours=6)
            )
            db.add_all([r1, r2])
            db.commit()
            print("Database successfully initialized and seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error during db initialization: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
