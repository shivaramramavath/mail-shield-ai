# MailShield AI — Updated Web App

Next.js frontend compatible with the NestJS backend API.

## Requirements
- Node.js 20+
- NestJS API at port 4000 by default
- FastAPI ML service at port 8000 (called by NestJS, not by the browser)
- MongoDB and Groq configured on the backend for analytics and AI features

## Windows PowerShell setup
```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```
Open http://localhost:3000.

## Environment
Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local`.

The browser calls NestJS only. It never calls FastAPI or Groq directly.

## API contract
All routes use `/api/v1`:
- `POST /email/analyze` — `{ "text": "..." }`
- `POST /email/generate` — `{ "prompt": "...", "tone": "professional", "length": "medium" }`
- `POST /email/improve` — `{ "text": "..." }`
- `POST /email/security-scan` — `{ "text": "..." }`
- `POST /email/batch-analyze` — `{ "emails": ["...", "..."] }` (maximum 20)
- `GET /analytics/overview`
- `GET /analytics/recent`

## Notes
- Analytics stores classification metadata, not submitted email bodies.
- Security scan is a heuristic AI assessment, not technical verification of sender identity, URLs, SPF/DKIM/DMARC, or attachments.
- ML/AI results can be wrong; do not rely on this demo as the sole basis for security decisions.
