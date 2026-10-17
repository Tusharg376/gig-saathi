# Validation — 17 October 2026

## Passed

- TypeScript check: `npm run typecheck`.
- Production build: `npm run build` (all five build stages and all five API routes).
- Ten focused tests: paise arithmetic, edited totals, negative net, invalid dates/numbers, CSV escaping, official-source URL validation, citation IDs, malformed AI output, Hindi/Hinglish request validation, WAV encoding, and grievance confirmation (related assertions are grouped).
- Local API boundary checks: health, malformed request, cross-origin rejection, missing-key errors, invalid document signature, 21-page rejection, oversized document rejection, 2 MB request reaching the route, and overlong recording rejection.
- Browser flow: created a QA worker profile; saved ₹900 income / ₹150 expenses / 8 hours; observed ₹750 net; refreshed and confirmed persistence; edited expense to ₹200 and observed ₹700 net.
- Browser flow: Hindi/English switching retained records; absent-key guidance was clear and bilingual; document selection remained disabled until upload consent; grievance confirmation fields displayed correctly.
- Responsive visual checks: desktop at 1365 × 1000 and phone at 390 × 844; no horizontal page overflow. Hindi text rendered correctly. Offscreen mobile navigation is hidden from keyboard focus until opened.
- Data deletion confirmation displayed correctly. The user explicitly requested keeping the QA data, so the destructive deletion step was not executed.

## Pending live Gemini verification

A Gemini API key was configured after the initial build. A live greeting through /api/assistant returned HTTP 200 with a generated KaamSaathi response. Retrieved-source quality, document analysis, transcription, generated speech, and the journey-specific live checks below remain unverified. The application has no simulated response fallback.

Remaining live acceptance checks:

1. Hindi, English and Hinglish earnings extraction and confirmation.
2. Source-backed safety and state-specific welfare guidance; unsupported facts withheld.
3. Readable/unclear documents and instructions embedded in a document; extraction corrections carried into follow-up.
4. Grievance generation only from confirmed facts; editing, saved-draft persistence, copy/download and print output.
5. Hindi and English transcription, microphone denial, 60-second stop, cancellation and speech playback.
6. Provider quota, invalid-key, timeout and unavailable-model handling.

## Delivery state

- Local preview: `http://127.0.0.1:5173/`.
- QA data kept at the user's request: Delivery partner / Delhi profile; one clearly labeled test earnings entry, ₹900 income, ₹200 expenses, 8 hours, ₹700 net.
- These are browser-entered QA records, not seeded application data. A new browser profile starts empty.
- Screenshots: `outputs/desktop-preview.jpg` and `outputs/mobile-hindi-preview.jpg`.
- No deployment, worker accounts, government submission or third-party messaging was performed.
