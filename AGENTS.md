# ANZRBO repository rules

## Branch policy — mandatory
- All code, configuration, documentation, and database migration changes MUST be committed directly to the existing default branch `main`.
- NEVER create a secondary branch, feature branch, hotfix branch, release branch, worktree, or pull request for routine work.
- Before any write, confirm the target branch is `main`; pass `branch: "main"` explicitly to GitHub write operations.
- Do not force-push, rewrite history, or reset `main`.
- Do not use an existing secondary branch for new work. Delete obsolete secondary branches only when repository-owner authorization and an explicit delete-branch operation are available.

## Data architecture — mandatory
- Supabase/Postgres is the authoritative source of truth for every persisted business record, all searches, all listings, all detail views, dashboard metrics, card generation/verification, payments, dependants, NSIA records, and status changes.
- Never use demo fixtures, hard-coded arrays, browser storage, or in-memory state as the source for business searches or persisted records.
- All create/update/delete actions must write to the database and report success only after the database confirms success.
- Local storage is permitted ONLY as an offline outbox for user-submitted changes that have not yet been confirmed by the database. It must never be used to search, list, or display the authoritative member directory.
- When connectivity returns, automatically retry pending writes, use idempotency keys to prevent duplicate records, and remove a draft from the outbox only after the database and its related records have been confirmed.
- On reload or device restart, pending writes must be retried when the application is online. If synchronization fails, retain the pending draft and clearly show the pending count/error.
- Do not claim a write succeeded when it exists only locally. Do not silently swallow database errors.
- Keep member fields, dependants, payment evidence, and uploaded files persisted in their correct database/storage locations. Do not mark a payment as paid merely because a form was submitted.
- Public card verification must query the official member registry and return only minimum public fields. Never expose CNI, emergency contacts, dependants, payment details, or other private data.
- Every frontend module that reads or writes business data must use the central database. Audit existing pages for fixtures and migrate them; do not leave local-only pages behind.

## Validation
- After changes, inspect the exact final file contents and run build/type checks and focused database integration tests when available.
- Never claim production verification without a successful build, successful database migration, and an actual record lookup/write test.
