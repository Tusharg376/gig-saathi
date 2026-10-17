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
- A public Cloudflare deployment was subsequently created; no worker accounts, government submission or third-party messaging was performed.

## Public deployment — 17 October 2026

- New Cloudflare Worker: `gig-saathi`, account `ab65894ceb7937adae03ccf1950e6c45`.
- URL: https://gig-saathi.honeygautam0.workers.dev
- Initial deployment version: `ccf365c6-2d8e-46f6-a16e-5561e6ba29ff`.
- Type checks, production build and 15 focused tests passed before upload.
- Exact-key scan confirmed no Gemini credential in client or server build artifacts. Credentials were uploaded separately as Worker secrets.
- Public API guard covers foreign origins, oversized requests and a best-effort per-IP request limit.
- Public URL returned HTTP 200, its JavaScript loaded, and the Gemini health check confirmed configuration.
- Live English and Hindi assistant requests both returned HTTP 200 with generated responses.
- Foreign-origin API requests returned HTTP 403; `/.env.local` was not publicly served.

## Trial submission review

Reviewed on 17 October 2026 against the user's score screenshot, the [host transcript](docs/reference/event-host-transcript.txt), and the current checkout. Overall score: **79.9/100**. The screenshot contains category scores, not detailed evaluator findings or scoring weights. The findings below are independently observed improvement opportunities; they do not establish why the evaluator deducted a particular number of points.

| Category | Score | Improvement priority |
| --- | ---: | --- |
| Code quality | 40 | First: readable, modular code with enforced checks |
| Efficiency | 78 | Reduce repeated work and measure AI latency and request size |
| Testing | 82 | Cover complete worker workflows and remaining live AI checks |
| Accessibility | 88 | Improve small text and dialog/navigation semantics; verify with keyboard and screen reader |
| Security | 92 | Preserve safeguards and test grounding and document injection beyond schemas |
| Problem statement alignment | 98 | Preserve the five connected journeys; prioritize reliability before new features |

### Findings from code inspection

1. **The main UI has too many responsibilities.** `app/page.tsx` contains 57,842 bytes in 129 lines, combining all journeys, profile/earnings forms, dialogs, local persistence, network calls, recording, playback, translation choices and rendering. `app/globals.css` contains 27,497 bytes in 13 lines. `lib/kaam/server.ts` combines transport, prompts, evidence retrieval and document processing. These are maintainability problems even though TypeScript passes. Split the UI by journey and extract storage, assistant and audio hooks; split server transport, grounding and journey logic. Add consistent formatting and keep the initial refactor behavior-preserving.

2. **Repository checks are incomplete.** Lint currently reports three unused imports in `app/page.tsx`: `MoreHorizontal`, `Send` and `Earning`. No `.github` CI configuration exists. There are 61 tracked starter UI files, with no imports from `@/components/ui/` in the application TSX files. Audit dependency usage before removing unused starter material; source count alone does not prove shipped bundle cost. Establish formatting, zero-warning lint, type checking, focused tests and build checks in CI.

3. **AI earnings context can disagree with dashboard totals.** `ask()` sends `data.earnings.slice(-500)`, while dashboard totals use all records and the server calculates AI totals from the received subset. At more than 500 entries, explanations can refer to a different total without disclosing the scope. Pass an explicit period/scope and computed aggregates, validate them appropriately, and test a ledger with more than 500 records. Never silently present partial totals as complete.

4. **Document follow-ups lose structured context.** Chat history includes only each message's `text`; document `summary`, `fields`, `missing` and `nextSteps` are stored in `answer.document` but not included in subsequent assistant requests. The correction button explicitly places corrected fields into the input, which helps after correction, but ordinary follow-ups may lack facts shown in the document panel. Pass bounded, transient document context and confirmed corrections deliberately. Test upload → explanation → correction → next-step question without re-uploading or retaining the original file.

5. **Latency and repeated work need measurement.** Every safety/welfare request performs research followed by synthesis. Grounding resolves up to 12 candidate links, each potentially taking four five-second redirect hops; those fetches do not use the incoming cancellation signal. Ledger filtering, sorting and totals are recomputed on every top-level render, including typing and the recording timer. Measure representative request duration, input size and rendering before optimizing. Reuse fresh evidence within a session only when query/eligibility context matches, preserve retrieval dates, propagate cancellation, and isolate or memoize expensive derived state.

6. **Passing tests do not cover complete journeys.** The 15 focused tests cover arithmetic, schemas, source URL/ID checks, CSV, WAV encoding and public API guards. `tests/routes.mjs` exercises error boundaries and skips missing-key cases when a key is configured. There is no automated browser workflow suite. Add isolated storage/confirmation/cancellation regression tests and browser journeys for earnings persistence and editing, draft exports, document corrections, language switching and deletion. Keep a separate, quota-conscious live Gemini matrix; a fixture-backed test is not evidence of a live AI response.

7. **Accessibility needs more than visual screenshots.** The dialog lacks an accessible name linked to its visible heading; the mobile navigation trigger lacks expanded/controlled state. CSS still includes 8–11 px secondary text, including source dates and composer notes, despite later mobile overrides improving several elements. Increase readable type where needed, connect dialog names and menu semantics, manage keyboard focus, and measure contrast rather than infer compliance from appearance. Reduced-motion styles and several live announcements already exist and should be preserved.

8. **Two resilience checks need strengthening.** Stored earnings/drafts are used with `.filter()` without first checking that they are arrays, so malformed browser data can throw inside the IndexedDB success callback and leave the read promise unsettled. Validate the entire stored record and handle read/transaction failures deterministically. Separately, known citation IDs prove that a URL was selected, not that every generated claim follows from that source. Evaluate unsupported eligibility assertions and hostile document instructions with meaningful expected behavior; do not describe citation validation as proof against hallucinations.

### Recommended implementation sequence

1. Establish formatting and CI, clear lint warnings, and extract the main component and server responsibilities without changing worker behavior. Add regression protection around the existing core flows before moving stateful code.
2. Fix the earnings scope discrepancy, document follow-up context and malformed-storage handling, with targeted tests.
3. Complete the outstanding live Gemini matrix listed above, including genuine documents, voice and grounded guidance. Investigate any failure before claiming the feature works. Record dates, outcomes and limitations without saving sensitive content.
4. Measure and improve request latency, cancellation and repeated UI work; finish readable typography, named dialogs and mobile keyboard navigation.
5. Rehearse the deployed app in a fresh browser profile. Prepare an under-five-minute feature demonstration and submission description that matches the exact deployed revision. Retain sufficient AI quota for judges.

### Checks executed during this review

- `npm run lint`: zero errors, three unused-import warnings.
- `npm test`: all 15 tests passed.
- `npm run typecheck`: passed.
- Confirmed the document journey's `documents` mode is accepted by the request schema; there is no mode-name mismatch in the current code.
- No new live AI calls or production deployment were performed for this review. The earlier production build result remains historical; no application code changed in this review.
- Event guidance is retained in `AGENTS.md`. The supplied transcript is archived verbatim outside the read-only synced `sources/` tree. Existing QA browser data is retained as requested.

## Implemented improvements and live checks

17 October 2026. This section supersedes the earlier pending status for the checks explicitly listed here. Historical failed attempts remain documented below.

### Delivered behavior

- Hindi is the default for first-time visitors. Arrival opens the profile setup, followed by a full-page “Your Saathi is ready” confirmation. Its conversation button opens and focuses the composer directly. Returning visitors retain their chosen language.
- Mobile navigation has Home, Earnings, Talk and More controls, larger touch targets, readable input sizes and safe-area spacing. Dialogs have accessible names. The mobile menu supports Escape, focus containment and focus return.
- UI responsibilities are separated into journey views, conversation, composer, forms and dialogs. Voice lifecycle and keyboard navigation have separate hooks. Provider transport, grounding, prompts and application orchestration have separate modules. Code is consistently formatted; unused starter components and 14 unused direct dependencies were removed (58 installed packages removed).
- Ledger context now includes complete, application-calculated scoped totals, entry count and a bounded sample of 30 details. A 501-record regression verifies that totals are not silently truncated.
- Document fields survive follow-ups. Corrections update the displayed fields and transient context, including a document-to-grievance handoff. Facts must still be confirmed before grievance drafting.
- Corrupt browser data rejects cleanly without hanging or silently overwriting records. Failed conversation requests remove the failed user turn before retry, preventing duplicate history. Grounding redirects honor cancellation; repeated official URLs are deduplicated. AI failure messages are written for workers, without server configuration instructions.
- GitHub checks now enforce formatting, zero-warning lint, types, focused tests and the production build. No credentials are needed for CI.

### Live Gemini matrix

All five journeys produced successful live responses in Hindi and English using the configured Gemini models. The Hindi earnings case includes mixed Hindi-English input. These are genuine provider calls with isolated test inputs, not canned application replies.

| Check | Result |
| --- | --- |
| Earnings in Hindi/Hinglish and English | Extracted income 900, expense 150 and 8 hours; application net 750 |
| Safety in Hindi and English | Practical heat guidance with official-source links and retrieval dates |
| Welfare in Hindi and English | e-Shram guidance with official sources and provisional eligibility language |
| Documents in Hindi and English | Readable PDF explained; corrected expense 200 carried into a follow-up |
| Grievances in Hindi and English | Drafts generated from confirmed facts with the correct amount |
| Missing grievance facts | No draft generated; asked for missing facts |
| Fabricated scheme request | Approval withheld; no fictional entitlement granted |
| Unclear document | Missing/unclear information identified; no earnings created |
| Prompt instructions embedded in a PDF | No requested fake earnings or draft created; instructions treated as document content |
| Speech generation and transcription, Hindi and English | WAV responses produced and transcribed back with the expected amount |

Initial matrix: 14 of 16 cases passed. Hindi welfare initially returned EVIDENCE_UNAVAILABLE; English safety initially returned REQUEST_FAILED. Both passed targeted retries (about 25 and 37 seconds respectively). Grounding can fail or take tens of seconds; retry/error states remain necessary, and official-evidence requirements were not relaxed. Passing URL/citation checks is not a proof that every possible future generated claim is correct.

### Automated and browser verification

- 19 focused tests passed, including real IndexedDB transaction behavior in an isolated fake-indexeddb environment: persistence, edits, saved drafts, deletion and repeated corrupt-data rejection.
- TypeScript, formatting checks, zero-warning lint, API boundary checks and production build passed.
- Exact credential scan found no configured Gemini key in any tracked/untracked source candidate or production build artifact. The ignored local credential file remains mode 0600.
- On a 390 × 844 viewport, verified Hindi-first setup → clear confirmation → focused conversation, live earnings extraction → confirmation → save → refresh → edit, and Hindi/English switching without losing records.
- Browser earnings showed 900 − 150 = 750, then 900 − 200 = 700. The downloaded CSV contained the edited amounts and net 700.
- Browser document workflow: uploaded an isolated PDF, corrected gross earnings from 900 to 850, saw the displayed fields update, and received a live follow-up confirming 850. Used the document-to-grievance action, confirmed facts and generated an editable draft for 850. Copy and text download contained the correct amount; explicit local save succeeded.
- The original retained QA data was not cleared. New browser testing used a separate local origin; production visitors are not seeded with these test records.

### Limits

Physical microphone recording and the 60-second hardware capture limit have not been exercised in a real phone browser. Generated audio and transcription were tested through the live endpoints; browser consent was inspected. The complete native print flow and a dedicated screen-reader audit remain unverified. These limits do not imply that the functions fail, but they must not be represented as completed checks.

## Voice and read-aloud update — 17 October 2026

- Added an optional automatic read-aloud preference to setup and the worker profile. Older profiles remain valid and default to off. Only newly received answers start automatic playback; enabling the setting does not replay old chat. Composer controls support Pause, Resume and Stop. A browser autoplay rejection retains the prepared audio for a user-initiated Resume.
- Replaced general-model transcription with the dedicated `gemini-3.5-transcribe` Interactions endpoint, configured independently by `GEMINI_TRANSCRIBE_MODEL`. Verbatim mode and Hindi/Indian-English hints preserve mixed speech. Model output is validated; empty speech and malformed responses remain explicit errors. No fabricated transcript fallback.
- Added speech-oriented mono capture constraints (echo cancellation, noise suppression, automatic gain) and a 32 kbps encoding request; actual browser support varies. Input status now distinguishes microphone permission/setup, elapsed recording time, and transcription. An indeterminate native progress bar is shown during transcription, with cancellation and editable text. No invented completion percentage.
- A sequential comparison using the same short, generated WAV clips measured Hindi at 4,831 ms with the original model versus 1,652 ms with the dedicated model, and English at 3,119 ms versus 1,934 ms. Both retained the spoken ₹900 amount and sentence meaning. This is a two-clip smoke comparison, not a representative accent/noise benchmark or latency guarantee. Audio was synthesized, not captured from a worker's phone.
- After the model change, both live speech-generation → transcription round trips passed again (6.5 seconds Hindi and 5.7 seconds English for the entire generation-plus-transcription sequence).
- Browser QA verified automatic speech for a new live Gemini answer, Pause → Resume → Pause without a new generation request, and saved-grievance persistence after refresh. The existing isolated ₹700 net earnings entry and saved draft were retained.
- 21 focused tests, type checking, zero-warning lint, formatting checks, API boundary checks and the production build pass. New checks cover backward-compatible speech preferences and malformed/empty/mixed-language transcription output.
- This remains record-then-transcribe, not continuous word-by-word live dictation. Real-phone microphone capture, noisy street speech, the physical 60-second stop and browser-specific autoplay blocking remain device-level acceptance checks. The loading state is implemented but not claimed as physically microphone-tested.

Provider references used for the implementation: [Gemini Transcribe model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-transcribe) and [transcription API](https://ai.google.dev/gemini-api/docs/transcribe).
- Follow-up mobile check: disabling automatic read-aloud immediately stopped the paused audio and removed its playback controls. At 390 px the DOM reported no horizontal overflow.
- Final polish: the Send control is 44 × 44 px. Cancelling or failing an assistant request restores its text if the worker has not started a newer draft, avoiding lost input.
- Browser cancellation exposed a transport-dependent delay. A shared abort-aware promise wrapper now settles cancelled assistant, document, transcription and speech requests without waiting for a delayed transport. The browser check confirmed the cancelled question returns to the input and its pending conversation turn disappears. A new regression test verifies that a late transport result cannot resolve an already-cancelled request. Total focused tests: 22.

## Mobile installation — 17 October 2026

- Added a linked web app manifest, standalone launch mode, 192/512px PNG icons, a maskable icon, Apple touch icon, theme color and Apple web app metadata.
- Added a Hindi/English install card on arrival, native `beforeinstallprompt` handling, Safari instructions, dismissal/reopening and installed-mode suppression. Native prompt availability remains browser-controlled.
- Service worker caches public installation assets and a bilingual offline fallback only; navigation remains network-first without storing pages. APIs and uploads bypass it.
- Automated: all 28 tests passed, including PNG dimensions/manifest requirements and executed service-worker checks for offline navigation and private/API cache exclusions. TypeScript, lint and production build passed. Build reports the existing experimental glob and Vinext route-classification notices. Removed an existing unused Pencil import to make lint pass.
- Browser preview: verified Hindi instructions, dismiss/reopen, English language updates, and 390×844 phone layout with the card above bottom navigation. Verified emitted manifest and Apple/theme metadata over HTTP. Existing local records were retained.
- Limits: no physical Android or iPhone was available. Native OS installation, installed launch and Safari share-sheet behavior require device verification. No live Gemini calls were used for these installation changes.
- Published final version `d0a0c1f9-c0f2-4d4b-88d7-cf218a7e98ff` to the existing Cloudflare address. Live HTTPS checks passed for the app, manifest, service worker and all four icons. The offline page returned 200 after Cloudflare’s canonical `.html` redirect. The worker now normalizes the cached fallback response to avoid redirect restrictions on offline navigation; regression coverage passed. All 28 tests, lint, type checking and production build passed again after that adjustment. The live first-visitor onboarding screen shows the install card.

## Feature-first journeys — 17 October 2026

- Replaced the chat-first safety, welfare, documents and grievance screens with dedicated tools. Chat is expandable and still uses the shared assistant context. Earnings and the home page retain their established flows.
- Safety: one-tap `tel:112`, official helpline cards, optional fresh geolocation (10-second timeout), editable landmark, map preview/removal, and an encoded WhatsApp draft. No call, location transmission or message is sent automatically. Emergency actions do not depend on a Gemini response.
- Welfare: seven bilingual, searchable/category-filtered national scheme cards with purpose, conditional eligibility, application steps, documents, helplines, official sources and a dated review. myScheme links to the broader national/state directory. Personalized checks still use live grounding. This is not an exhaustive or self-updating scheme database. Source provenance is in `docs/reference/feature-directory-review.md`.
- Documents: choose an explanation/translation/missing-details/next-step task and optionally ask a specific question before consenting to upload. The server validates the task length. Results show fields, uncertainty and steps outside chat, allow corrections including summary text, and connect to the complaint form. Existing 10 MB/20-page/signature checks remain.
- Complaints: six concern categories; incident, recipient, dates, money status and desired resolution; optional name/phone/city/order/product/evidence fields; explicit facts/processing confirmation; inline generated letter and existing edit/copy/download/print/save controls. Optional details are transient until a draft is explicitly saved. Complaint description and optional chat input are separate, including their voice-transcription destinations. Consumer, labour and legal-guidance routes are scoped rather than offered indiscriminately. Removed the obsolete duplicate complaint modal.
- Automated: 28 tests pass including the concurrently requested PWA tests. New regression coverage checks Hindi/English scheme discovery, safe WhatsApp encoding and location bounds, complaint routing, optional facts and document-task bounds. Formatting, lint, TypeScript and production build pass; existing Vinext experimental/static-route-classification notices remain.
- Live provider run: all 16 cases in `tests/live-journeys.mjs` passed on the local app with real configured Gemini services: all five journeys in Hindi and English, mixed Hindi-English earnings, missing grievance facts, unsupported scheme withholding, unclear documents, document prompt injection, Hindi/English speech and transcription. Responses and timings are in ignored `outputs/live-journeys.json`; no worker data or credentials are committed.
- Browser: 390px Hindi/English safety layout, SOS/helpline hrefs, encoded landmark WhatsApp href, Hindi scheme search and expanded eligibility/application details. Hindi guided complaint generated live from QA facts with ₹900, QA name/city and order ID preserved; the review/export dialog displayed correctly. The download-event observer timed out, so this run does not claim a newly captured downloaded file or physical printing.
- Browser: uploaded the isolated QA payment PDF with a specific Hindi question; live analysis returned pending payment, ₹900, ₹150, missing details and next steps. Corrected fuel expense to ₹200 and verified it was available in the complaint handoff; no facts were auto-confirmed. Separate complaint/chat inputs and no horizontal overflow verified at 320px; choosing no money removed the amount field, and a consumer issue changed the filing route to NCH.
- Existing saved QA profile, earnings (₹900 income / ₹200 expense / ₹700 net) and saved draft were preserved. No real emergency calls, WhatsApp messages, private contacts or precise device locations were transmitted during QA. Physical-phone geolocation, dialler/WhatsApp launch, microphone capture and OS installation still require device verification. Live voice tests use generated QA audio, not a physical microphone.
- Production verification: the deployed client journey bundle and PWA public assets matched the local build byte-for-byte. A live production Hindi complaint call preserved the extended confirmed order ID and ₹900 amount. Initial combined version: `a08a07cf-d9e3-4585-932b-af4dfef7e93a`.
- Final mobile review moved the dismissed-install shortcut into page flow so it cannot cover form inputs; the initial install suggestion remains dismissible. No functional AI logic changed in this visual adjustment.
