# MailShield AI

Full-stack demonstration: Next.js frontend, NestJS API, FastAPI ML inference, LangChain/Groq generation, MongoDB aggregate analytics. No login.

## Requirements
- Docker Desktop with Docker Compose
- Optional Groq API key for AI features

## Start (Windows PowerShell)
```powershell
Copy-Item .env.example .env
# Edit .env and set GROQ_API_KEY (optional for classification)
docker compose up --build -d
```
Open http://localhost:3000. API http://localhost:4000/api/v1/health; ML http://localhost:8000/ml/health.

## Test
```powershell
Invoke-RestMethod http://localhost:4000/api/v1/email/analyze -Method Post -ContentType 'application/json' -Body '{"text":"Congratulations claim your prize now"}'
Invoke-RestMethod http://localhost:4000/api/v1/analytics/overview
```

## Local development (without Docker)
Requires Node 22+, Python 3.12+, MongoDB locally, and a Groq key for AI.
```powershell
cd apps/ml-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python training/train.py
uvicorn app.main:app --reload --port 8000
```
In a second terminal:
```powershell
cd apps/server
npm install
$env:MONGO_URI='mongodb://localhost:27017/mailshield'
$env:ML_URL='http://localhost:8000'
$env:WEB_ORIGIN='http://localhost:3000'
$env:GROQ_API_KEY='YOUR_KEY'
npm run start:dev
```
In a third terminal:
```powershell
cd apps/web
npm install
$env:NEXT_PUBLIC_API_URL='http://localhost:4000'
npm run dev
```

## Security / limitations
- Bundled 20-row dataset is intentionally tiny and **not a validated spam detector**. Replace with a properly licensed real dataset, split train/test before tuning, report precision/recall/F1 and calibration. No accuracy claim is made.
- The API stores only prediction metadata, not raw email text. The anonymous feedback endpoint acknowledges feedback but does not persist it; this avoids accepting unreviewed labels as ground truth.
- Batch input uses newline-separated messages, not CSV; add CSV parsing and safe export for production.
- The app includes the core routes and a functional single-page UI, not production-grade email header validation, phishing URL reputation, model drift, or full auditability.
- The AI security scan is LLM commentary, not verified threat intelligence.
- Add reverse proxy, TLS, authentication for internal ML endpoints, strict egress, privacy policy, request limits per IP at edge, model monitoring, tests, and provider cost controls before public deployment.
- If Groq model availability changes, set GROQ_MODEL in .env to a supported model.
- No lockfiles are shipped; run npm install and commit generated lockfiles for reproducible production builds.
