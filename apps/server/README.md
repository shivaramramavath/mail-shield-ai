# MailShield AI — NestJS API

NestJS API layer for the MailShield AI application. The browser calls this API; this API calls the internal FastAPI classifier and Groq.

## Architecture

```text
Next.js browser (localhost:3000)
          |
          | HTTP /api/v1
          v
NestJS API (localhost:4000)
    |                 |
    |                 +---- Groq Chat Completions API
    |
    +---- FastAPI ML service (localhost:8000)
    |
    +---- MongoDB (analytics metadata only)
```

The API does **not** store raw email bodies. Analytics stores only label, spam probability, duration, and timestamp.

## Requirements

- Node.js 20+
- npm
- MongoDB 7 or compatible MongoDB deployment
- Python FastAPI ML service running separately
- Groq API key for generate / improve / security-scan routes

## Setup (PowerShell)

From this backend folder:

```powershell
Copy-Item .env.example .env
# Edit .env and set MONGODB_URI, GROQ_API_KEY, and ML_SERVICE_URL.
npm install
npm run start:dev
```

The API listens on `http://localhost:4000`; the global prefix is `/api/v1`.

If your project already has a NestJS package.json, merge dependencies rather than blindly replacing your existing package manifest.

## Environment

See `.env.example`. `MONGODB_URI` is required because the analytics module persists metadata. `GROQ_API_KEY` is required only for AI routes. `ML_SERVICE_URL` must point to the FastAPI service.

For local Windows development, `http://127.0.0.1:8000` is typical. In Docker Compose, use the service DNS name, for example `http://ml-service:8000`, not `localhost`.

## API contract

All routes are prefixed with `/api/v1`.

### POST `/email/analyze`

Request:
```json
{ "text": "Congratulations, claim your free prize now!" }
```

Response:
```json
{
  "label": "spam",
  "spamProbability": 0.98,
  "hamProbability": 0.02,
  "durationMs": 23,
  "modelVersion": "2026-01"
}
```

FastAPI contract expected by `MlService`:

- `POST {ML_SERVICE_URL}/predict`
- Request: `{ "text": "..." }`
- Response fields accepted:
  - `label` or `prediction`: `"spam"` or `"ham"`
  - `spamProbability` or `spam_probability`
  - `hamProbability` or `ham_probability`
  - optional `durationMs` or `duration_ms`
  - optional `modelVersion` or `model_version`

Probabilities must be numeric values from 0 to 1. The Nest service rejects missing/invalid probability values.

### POST `/email/generate`

```json
{
  "prompt": "Write a meeting request to my manager",
  "tone": "professional",
  "length": "medium"
}
```

Response: `{ "content": "Subject: ..." }`

### POST `/email/improve`

Request: `{ "text": "..." }`

Response: `{ "content": "..." }`

### POST `/email/security-scan`

Request: `{ "text": "..." }`

Response: `{ "report": "## Risk assessment..." }`

This is an AI heuristic report, not a technical URL/attachment scanner or guarantee of safety.

### POST `/email/batch-analyze`

Request: `{ "emails": ["email one...", "email two..."] }`

Maximum 20 emails per request. Response:
```json
{
  "total": 2,
  "results": [
    {
      "index": 0,
      "label": "ham",
      "spamProbability": 0.01,
      "hamProbability": 0.99,
      "durationMs": 18,
      "modelVersion": null
    }
  ]
}
```

Per-email failures are returned as `{ "index": n, "error": "..." }`.

### GET `/analytics/overview`

Response: `{ "total": 12, "spam": 4, "ham": 8, "avgDurationMs": 21 }`

### GET `/analytics/recent`

Returns the 10 most recent metadata-only analysis records.

## Frontend Axios configuration

Example `apps/web/src/lib/axios.ts`:

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export default api;
export { api };
```

If `NEXT_PUBLIC_API_URL` is set to `http://localhost:4000`, include `/api/v1` in each request path instead. Do not include the prefix twice.

## Important integration note

The provided backend expects the FastAPI service to expose `POST /predict` with the request/response contract above. If your current FastAPI app uses a different path or field names, update `MlService.predict()` to match it. Do not expose the ML service directly to the browser.

## Operational and security notes

- Do not commit `.env`; keep the Groq key server-side only.
- Add rate limiting before public deployment. This starter intentionally does not claim to provide production-grade abuse protection.
- Set a strict `FRONTEND_ORIGIN` in production.
- Use HTTPS in production.
- Consider request size limits, IP-based throttling, monitoring, and retention policies.
- AI-generated security advice is not a substitute for mail gateway scanning, URL reputation checks, SPF/DKIM/DMARC validation, or attachment sandboxing.
- This starter records analytics after successful predictions. If analytics persistence fails, the current request will also fail; decide whether you prefer fail-open analytics for your deployment.
