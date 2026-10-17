# Feature directory source review — 17 October 2026

The user supplied `/Users/tushar/hackathon warmup claude/saathi` and its localhost:3000 app as feature examples. Its SOS, scheme browser, document result and complaint wizard informed the interaction design. No credentials, personal records or unverified knowledge-base claims were copied. Its recalled e-Shram age ceiling was replaced with the current official FAQ (age 16+ subject to other criteria). Its canned complaint fallback was not adopted.

The app now contains a **selected** worker-focused directory, not an exhaustive or automatically refreshed database of every Indian scheme. Each card links to its official source and application service, with the review date shown above the directory. myScheme supplies the wider national/state directory. Personal eligibility questions continue through live Gemini with Google Search grounding; listing a scheme never confirms eligibility.

## Primary sources

- Emergency numbers (112, 1930, 181, 1098): https://www.india.gov.in/directory/helpline and https://www.112.gov.in/about . SOS opens `tel:112`; it does not dispatch assistance. WhatsApp drafts are addressed by the worker, never sent automatically.
- e-Shram registration, age, Aadhaar/mobile requirements, free registration, helpdesk 14434: https://eshram.gov.in/faqs . Registration is not a promise of cash benefits.
- PM-SYM eligibility, contribution and pension: https://labour.gov.in/FAQ-0 ; CSC process, Aadhaar/account requirements and helpline 18002676888: https://www.labour.gov.in/static/uploads/2025/06/49a10165d1cf6f46e3bfbb52ba14f325.pdf . Current eligibility corroboration: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2293891&lang=1&reg=48 . Maandhan is the linked official application service even though its hostname is not gov.in.
- PMSBY age, premium and cover: https://www.financialservices.gov.in/pmsby ; https://www.pib.gov.in/PressReleasePage.aspx?PRID=2157540&lang=2&reg=3 . Enrolment forms and common national helplines: https://jansuraksha.gov.in/forms-pmsby.aspx . The PDF rules endpoint intermittently failed in the research tool; the financial-services page and PIB independently support the card's main figures.
- PMJJBY age/account/one-account rule and forms: https://www.indiapost.gov.in/insurance-services/pmjjby ; current premium and coverage: https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=154428&id=154428 . National Jan Suraksha phone numbers are scheme information contacts, not emergency numbers.
- PM-JAY overview: https://nha.gov.in/PM-JAY ; age 70+ coverage: https://nha.gov.in/img/resources/English_FAQs_related_to_the_benefits_for_senior_citizens.pdf ; 14555: https://nha.gov.in/img/resources/School-Guidebook-English.pdf ; family cover: https://nha.gov.in/img/resources/Press_Release.pdf . No claim that gig work alone makes every worker eligible. Verify beneficiary status at https://beneficiary.nha.gov.in/ .
- ONORC existing NFSA entitlement, portability and 14445: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2021/mar/doc202131221.pdf ; official state ration-card services: https://www.nfsa.gov.in/portal/Ration_Card_State_Portals_ . This source is older; the directory presents portability rather than new or extra benefits, and asks workers to confirm service availability.
- PMJDY basic account and bank/Bank Mitra application: https://pmjdy.gov.in/scheme ; national helplines: https://pmjdy.gov.in/hi-scheme . No unconditional insurance or overdraft promise.
- Employment/labour complaint scope: https://samadhan.labour.gov.in/ and its official FAQ. The app explicitly says coverage depends on work relationship and jurisdiction; it does not send every gig-platform dispute there.
- Consumer complaints: https://consumerhelpline.gov.in/public/about . NCH 1915 is offered for purchases, not unpaid work.
- Legal guidance / 15100: https://himachalpradesh.nalsa.gov.in/legal-aid/ and https://madhyapradesh.nalsa.gov.in/contact-us/ . Eligibility for legal aid remains with the authority.

## Maintenance boundary

Review these sources before updating benefits, eligibility, contacts or the displayed date. Do not simply advance the date without checking. Static directory facts are public reference content explicitly requested by the user; they are distinct from generated AI guidance and from worker-owned records. Do not scrape the reference project's recalled data into production. Synced `sources/` remains read-only.
