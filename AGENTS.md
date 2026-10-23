# LexHOA Agent Guidance

## Start here

- Read `docs/STATUS.md` first. It records where `dev`, `staging`, and `main` are, the next steps and pending approvals, test logins, and known issues. Update it at the end of each work session.

## Setup and verification

- Install all dependencies with `.agents/setup`.
- Build the frontend with `npm run build`. Run frontend tests with `CI=true npx react-scripts test --watchAll=false` (PowerShell: `$env:CI='true'; npx react-scripts test --watchAll=false`).
- Lambda tests use `node --test`, run from each function's `src` directory, for example:
  - `amplify/backend/function/createAuthNetTransaction/src`
  - `amplify/backend/function/handleAuthNetWebhook/src`
  - `amplify/backend/function/reconcileAuthNetPayments/src`
  - `amplify/backend/function/monthlyPropertyDues/src`
  - `amplify/backend/function/mergeProfiles/src`
  - `amplify/backend/function/manageLedger/src`
- Check schema changes locally with `amplify api gql-compile`; revert any line-ending-only change it makes to `amplify/backend/api/lexhoa/parameters.json`.
- Use synthetic Authorize.Net sandbox data only. Never place payment account data, opaque payment tokens, or backend credentials in source, tests, logs, screenshots, or thread messages.

## PCI work

- Use `docs/compliance/PCI_SPRINT_GUIDE.md` as the current delivery guide.
- Implementation alone does not establish PCI compliance. Preserve the evidence and approval boundaries documented in `docs/compliance/PCI_OPERATIONS_MANUAL.md`.

## AWS and Amplify safety

- AWS account: `324037289979`; region: `us-east-1`; local CLI profile `nisan` (SSO). If the session has expired, ask Daniel to run `aws sso login --profile nisan`.
- Amplify app `dcq8knwxivreq` has three backend environments. DynamoDB tables are named `<Model>-<apiId>-<env>`.

  | Branch | Backend | AppSync API ID | User pool | Site | Builds on push |
  |---|---|---|---|---|---|
  | `dev` | `dev` | `gfg2xeoervgnvfcew3ftobp7jy` | `us-east-1_1CrDOnMk6` | `https://dev.dcq8knwxivreq.amplifyapp.com` | Yes |
  | `staging` | `staging` | `5bkt6ydaljf5bhdzpzs6tlv6uy` | `us-east-1_xyJNNb5lv` | `https://staging.dcq8knwxivreq.amplifyapp.com` | Yes |
  | `main` | `main` (production) | `gqnh3rxo4rfn7k5ovevu2olvei` | `us-east-1_48Wbd4Rx4` | `https://lexingtoncommons-weco.com` | No |

- A push to `dev` or `staging` is a deployment: the Amplify build runs `amplifyPush --simple`, which updates that environment's backend. Pushing to `main` does not build; a production deployment is one approved Amplify `RELEASE` job.
- `src/aws-exports.js` points at production. Do not run the app locally against it for testing; test on the deployed dev site instead.
- The annual dues schedule (`cron(0 6 1 11 ? *)`, 06:00 UTC November 1) exists in every environment but is enabled only on `main`. On dev and staging, run `monthlyPropertyDues-<env>` manually with approval.
- Authorize.Net still uses sandbox credentials until the controlled production rollout.
- Files under `amplify/#current-cloud-backend`, `amplify/.config/local-*`, and `amplify/team-provider-info.json` are ignored machine-local state and may be absent or stale.
- Never run `amplify push`, `amplify delete`, an environment removal, or another AWS mutation without explicit user approval and first verifying that the checkout is synchronized to the intended live environment.
- Amp orbs do not inherit a developer's local AWS SSO session. Use an approved short-lived orb OIDC role when configured; never add long-lived AWS access keys to Amp secrets or repository files.

## Delivery workflow

- Diagnose and reproduce the reported behavior before editing. Prefer the smallest fix at the owning boundary and focused tests over broad scans or unrelated cleanup.
- For cloud diagnosis, use bounded read-only checks and indexed queries. Do not expose secrets, payment data, opaque tokens, or personal data in commands, logs, artifacts, or thread messages.
- Present the diagnosis, intended change, validation, and mutation boundary before requesting approval. Require explicit approval before committing, pushing, deploying, or mutating AWS, Amplify, Authorize.Net, or application data.
- In PowerShell, write commit messages in single-quoted here-strings (`@' ... '@`) so `$` amounts are not expanded.
- Keep hotfix commits identical across `dev` and `staging`; deploy only the explicitly approved environment. Gate every push or deployment on freshly fetched exact refs and the approved commit SHA.
- Start at most one connected-repository Amplify `RELEASE` for an approved deployment. Do not retry after a local reporting or connection failure until authoritative state proves no job or mutation occurred.
- Verify the deployed artifact against the approved commit and check the affected data and infrastructure safety invariants. Report generated infrastructure housekeeping separately from source-intended changes.
- Stop safely when an identity, ref, configuration, processor, or data invariant fails. Preserve current state, perform no compensating mutation without approval, and report the precise blocker and next bounded step.
