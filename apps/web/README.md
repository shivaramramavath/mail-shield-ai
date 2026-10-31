# MailShield AI — Black & White Multi-page Web App

Responsive Next.js App Router frontend using a strict black-and-white design. Dark mode is enabled by default, with a persistent light/dark toggle.

## Install (PowerShell)
```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```
Open http://localhost:3000. Root redirects to `/dashboard`.

## Pages
- `/dashboard` — aggregate overview and recent activity
- `/analyze` — single email spam classification
- `/batch` — batch classification (up to 20 messages)
- `/generate` — AI email generation
- `/improve` — improve email writing
- `/security` — AI security review
- `/history` — recent classification records
- `/settings` — theme and privacy notes

## API
Browser calls NestJS only, using `NEXT_PUBLIC_API_URL` and `/api/v1`:
- `POST email/analyze` `{ text }`
- `POST email/batch-analyze` `{ emails }`
- `POST email/generate` `{ prompt, tone, length }`
- `POST email/improve` `{ text }`
- `POST email/security-scan` `{ text }`
- `GET analytics/overview`
- `GET analytics/recent`

## Markdown
AI generation, improvement, and security report output is rendered with `react-markdown` and `remark-gfm` (tables, headings, lists, links, code).

## Privacy and limitations
The frontend does not store submitted email bodies in local storage. Backend analytics is metadata-only as configured. Security scan is an AI heuristic, not a technical validation of sender identity, SPF/DKIM/DMARC, URLs, or attachments. Avoid sending secrets or sensitive information.
