# KaamSaathi

Live: **https://gig-saathi.honeygautam0.workers.dev**

A local-first, Hindi/English assistant for Indian gig and informal workers. React, TypeScript, Tailwind, Vinext, and Google Gemini. No seeded worker data or simulated AI responses.

## Run locally

Requirements: Node.js 22.13 or newer, npm, and a Gemini API key with access to the configured models and Google Search grounding.

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and add `GEMINI_API_KEY`. Keep this file private. Never put the key in browser code or chat.
3. Optionally change `GEMINI_MODEL` and `GEMINI_TTS_MODEL` to model IDs available to your account. Defaults are `gemini-3.8-flash` and `gemini-3.8-flash-tts`. Model availability and API quotas are account-dependent.
4. Run `npm run dev` and visit the printed URL, normally `http://localhost:5173`.
5. Set your language, work type and state. Start with your own earnings or question. Restart the server after editing environment variables.

The local dev configuration loads only the three `GEMINI_` settings into server-side Worker bindings. It does not expose them to the client or embed them in production bundles. `npm run build` checks production packaging; serving that build requires supplying runtime secrets separately. The Cloudflare deployment target is configured in `vite.config.ts`; production Gemini credentials are stored as encrypted Worker secrets.

## Journeys

- **Earnings:** type or speak income, expenses and hours. Review AI-extracted entries before saving, or enter them manually. Edit, delete, filter and export records. Currency arithmetic uses integer paise.
- **Safety:** situation-specific, source-backed guidance. Unverified answers are withheld.
- **Rights and schemes:** Gemini searches current sources, then synthesis uses only grounding segments supported by official government sources. Citations include retrieval dates. Eligibility is provisional.
- **Documents:** consent-based JPEG/PNG/PDF upload, explanation, extracted fields, correction and follow-up. Max 10 MB, 20 PDF pages. Encrypted/unreadable PDFs are rejected.
- **Grievances:** conversational fact gathering plus an explicit confirmed-facts form, editable drafts, explicit local save, copy, text download and print. No submission integration.
- **Voice:** tap the microphone, consent, record up to 60 seconds, then review the transcript before sending. Use Listen on assistant messages for Gemini-generated audio.

## Storage and privacy

IndexedDB holds the worker profile, confirmed entries and explicitly saved drafts. Chat history is in memory and disappears on refresh. Uploads and audio are transient in this app. Requests transmit the current question and needed context to Google; earnings records are only included for the earnings journey. Documents and audio are sent only for their requested processing. Google's own retention and processing policies still apply. Local deletion does not delete upstream provider data. Use caution on shared devices; clearing browser storage also clears saved work.

The app does not log request contents or credentials. Responses are rendered as text, not injected HTML. Official citation links are checked server-side. Uploaded instructions are treated as data. Model instructions and output validation reduce risk, but source attribution is not an independent legal review. Questions outside the rights/safety journey are directed to the appropriate source-checking journey.

## API

All routes are same-origin, server-side and return `Cache-Control: no-store`.

- `GET /api/health`: whether a key is configured; never returns the key or claims access is verified.
- `POST /api/assistant`: profile, selected mode, message, bounded history, and confirmed earnings for relevant requests. Returns message, follow-ups, source citations and optional reviewable actions.
- `POST /api/documents`: multipart `file` and JSON `profile`.
- `POST /api/transcribe`: multipart `audio` and duration in seconds.
- `POST /api/speech`: JSON `text` and `language`; returns WAV audio.

AI errors return stable codes with bilingual UI messages. Missing keys, quota limits, timeouts, invalid model output and absent evidence never fall back to fabricated content. The public deployment rejects cross-origin API posts and applies a best-effort limit of 20 AI requests per minute per IP per Cloudflare location. Shared networks share this limit. This is a burst control, not a strict billing cap; Gemini quotas still apply. Worker records remain in each visitor’s browser.

## Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:routes` (with the local server running; no live AI requests are made)

Tests use isolated fixtures only; the application has no sample records. See `VALIDATION.md` for executed checks and outstanding live-provider verification.

## Cloudflare deployment

- Worker project: `gig-saathi`
- Live URL: https://gig-saathi.honeygautam0.workers.dev
- Dashboard: https://dash.cloudflare.com/ab65894ceb7937adae03ccf1950e6c45/workers/services/view/gig-saathi/production
- After authenticating with `npx wrangler login`, run `npm run deploy` to build and deploy updates. Existing production secrets are preserved.
- For initial setup or deliberate secret updates, run `npm run build` followed by `npx wrangler deploy --config dist/server/wrangler.json --secrets-file .env.local`. This sends the ignored local environment values to Cloudflare as secrets; never commit the file.
- Deployment is currently manual. Pushing to GitHub alone does not trigger a Cloudflare deployment.
- New visitors begin with empty browser storage. Local QA records are not uploaded or shared.
