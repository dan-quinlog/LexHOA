# LexHOA Agent Guidance

## Setup and verification

- Install all dependencies with `.agents/setup`.
- Build the frontend with `npm run build`.
- Payment Lambda tests are run from each function's `src` directory:
  - `amplify/backend/function/createAuthNetTransaction/src`
  - `amplify/backend/function/handleAuthNetWebhook/src`
  - `amplify/backend/function/reconcileAuthNetPayments/src`
- Use synthetic Authorize.Net sandbox data only. Never place payment account data, opaque payment tokens, or backend credentials in source, tests, logs, screenshots, or thread messages.

## PCI work

- Use `docs/compliance/PCI_SPRINT_GUIDE.md` as the current delivery guide.
- Implementation alone does not establish PCI compliance. Preserve the evidence and approval boundaries documented in `docs/compliance/PCI_OPERATIONS_MANUAL.md`.

## AWS and Amplify safety

- AWS account: `324037289979`; region: `us-east-1`.
- `main` is currently the only Amplify backend environment. Authorize.Net still uses sandbox credentials until the controlled production rollout.
- Files under `amplify/#current-cloud-backend`, `amplify/.config/local-*`, and `amplify/team-provider-info.json` are ignored machine-local state and may be absent or stale.
- Never run `amplify push`, `amplify delete`, an environment removal, or another AWS mutation without explicit user approval and first verifying that the checkout is synchronized to the intended live environment.
- Amp orbs do not inherit a developer's local AWS SSO session. Use an approved short-lived orb OIDC role when configured; never add long-lived AWS access keys to Amp secrets or repository files.

## Delivery workflow

- Diagnose and reproduce the reported behavior before editing. Prefer the smallest fix at the owning boundary and focused tests over broad scans or unrelated cleanup.
- For cloud diagnosis, use bounded read-only checks and indexed queries. Do not expose secrets, payment data, opaque tokens, or personal data in commands, logs, artifacts, or thread messages.
- Present the diagnosis, intended change, validation, and mutation boundary before requesting approval. Require explicit approval before committing, pushing, deploying, or mutating AWS, Amplify, Authorize.Net, or application data.
- Keep hotfix commits identical across `dev` and `staging`; deploy only the explicitly approved environment. Gate every push or deployment on freshly fetched exact refs and the approved commit SHA.
- Start at most one connected-repository Amplify `RELEASE` for an approved deployment. Do not retry after a local reporting or connection failure until authoritative state proves no job or mutation occurred.
- Verify the deployed artifact against the approved commit and check the affected data and infrastructure safety invariants. Report generated infrastructure housekeeping separately from source-intended changes.
- Stop safely when an identity, ref, configuration, processor, or data invariant fails. Preserve current state, perform no compensating mutation without approval, and report the precise blocker and next bounded step.
