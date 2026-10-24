# ANZRBO repository rules

## Branch policy — mandatory
- All code, configuration, documentation, and database migration changes MUST be committed directly to the existing default branch `main`.
- NEVER create a secondary branch, feature branch, hotfix branch, release branch, worktree, or pull request for routine work.
- Before any write, confirm the target branch is `main`; pass `branch: "main"` explicitly to GitHub write operations.
- Do not force-push, rewrite history, or reset `main`.
- If an old secondary branch exists, do not use it for new work. Remove it only when the repository owner has authorized its deletion and the available GitHub permissions/tooling permit it.
- Keep this policy in force for every future task in this repository.

## Verification and member data
- The official member registry is the source of truth. Never use demo/fixture members to verify real membership cards.
- QR verification must query the persisted registry using the card's member number; legacy telephone payloads may be supported as a fallback.
- Public verification may return only the minimum fields needed to verify a card. Never expose identity documents, emergency contacts, dependants, payments, or other private fields.
- Verify changes with a build and, where applicable, a real QR lookup before claiming the issue is resolved.
