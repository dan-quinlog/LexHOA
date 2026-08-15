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
