# LexHOA Project Status

Update this file at the end of each work session so the next session can start from it.
Verify refs and cloud state before acting; this is a snapshot, not a source of truth.

**Last updated:** October 23, 2026

## Where each branch is

| Branch | Commit | Deployed | Notes |
|---|---|---|---|
| `dev` | Docs commit on `4e61a80` | Code: Amplify job 94 | Invoices Phase 1 and Phase 2 |
| `staging` | Same as dev | Code: Amplify job 58 | Board review run on October 24 |
| `main` | `3b95479` | Last Amplify job 55 at `567659c` (October 11) | Production. Auto-build is **off** |

Phase 2 code is `4e61a80`; the commit above it only adds this file and updates `AGENTS.md`.

`main` contains `30d8ec5` and `3b95479` beyond Amplify job 55. The production dues Lambda was
modified October 12 and its schedule is `cron(0 6 1 11 ? *)`, enabled, so the November 1 schedule
is live but the Lambda is the pre-invoice version (25 second timeout, no invoices).

## Next steps

1. **Staging review (October 24).** Board reviews invoices, Board Tools invoice create and void,
   manual payment record and void. Review logins are in `.amp/in/staging-review-state.json`.
2. **Production release, after board sign-off and before 06:00 UTC November 1 (midnight Denver,
   October 31).** Each step needs explicit approval:
   - Fast-forward `main` to the staging commit approved in review.
     This also ships `fa3866c` (Authorize.Net fail-closed) and `c6f7c2d` (balance reports).
   - `main` does not build on push. Start exactly one Amplify `RELEASE` job for the approved
     commit, then verify the job, the `Invoice` and `Counter` tables, `manageLedger-main`, and that
     `monthlyPropertyDues-main` has the 300 second timeout.
   - Run the payment backfill against production (dry run first):
     `node scripts/backfill-payment-source.js --table Payment-gqnh3rxo4rfn7k5ovevu2olvei-main`, then
     with `--apply`.
   - If the old dues Lambda runs before the release, balances are charged without invoices, and
     running the new Lambda afterwards would charge again. Stop and decide before rerunning.
3. **After November 1:** verify the dues run created one `DUES` invoice per owner (`2027`,
   due 2027-12-31) and the counter matches the invoice count.

## Feature state

- **Invoices:** spec at `.agent-os/product/feature-specs/invoices.md`. Phase 1 (dues invoices,
  owner Billing history) and Phase 2 (`issueInvoice`, `voidInvoice`, `recordManualPayment`,
  `voidPayment` in the `manageLedger` Lambda; Board Tools Invoices section; payment `source` and
  `createdBy`; backfill script) are complete on dev and staging.
- **Sprint 3 product items** are listed in `docs/compliance/PCI_SPRINT_GUIDE.md` under "Product
  work deferred to Sprint 3": restrict direct balance edits, remove payment editing, review legacy
  payment fields.

## Test data and logins

Passwords live only in git-excluded files under `.amp/in/` on Daniel's machine.

- **Dev** (`.amp/in/e2e-state.json`): `invoice-test-owner@example.invalid` (owner) and
  `invoice-test-admin@example.invalid` (PRESIDENT, BOARD); "INVOICE TEST" properties and profiles,
  invoices INV-000001 to INV-000006, and canceled board payments `E2E-2001` and `E2E-UI-3001`.
  Payment backfill applied.
- **Staging** (`.amp/in/staging-review-state.json`): `invoice-review-owner@example.invalid` and
  `invoice-review-admin@example.invalid` (PRESIDENT, TREASURER, BOARD); invoices INV-000001 and
  INV-000002, synthetic check `1001`. Payment backfill applied.
- Clean up dev and staging test data only when Daniel asks.

## Known issues

- `mergeProfiles` keeps one profile's balance, so merged profiles need a manual balance check.
- The commit body of `f7e2413` reads "\,000 per property per year" because PowerShell expanded
  `$1`. Use single-quoted here-strings (`@' ... '@`) for commit messages.
- Headless browser sign-in through the hosted UI fails with "Unable to start sign in"; scripted
  checks sign in from Node with `aws-amplify` and load the session into the page instead.
