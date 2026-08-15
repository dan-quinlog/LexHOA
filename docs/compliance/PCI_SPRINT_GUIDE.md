# PCI DSS Sprint Guide

**System:** LexHOA  
**Standard:** PCI DSS v4.0.1  
**Current sprint:** Sprint 2  
**Last reviewed:** August 15, 2026

This is the durable delivery guide for LexHOA's PCI remediation work. Use it with the
[remediation roadmap](./PCI_REMEDIATION_ROADMAP.md),
[operations manual](./PCI_OPERATIONS_MANUAL.md), and
[questionnaire answer key](./PCI_QUESTIONNAIRE_ANSWER_KEY.md). A completed engineering
sprint does not by itself establish PCI compliance; controls become compliant only after
the required operating evidence and approval exist.

## Sprint rules

- A sprint closes when its essential security behavior is deployed, tested, and evidenced.
- A task may move forward when it is impossible in the current environment or is an
  operating/compliance activity rather than a missing safeguard. Record the reason and
  its later completion gate.
- Never mark a questionnaire row `Yes` from implementation alone. Follow the independent
  evidence and approval process in the operations manual.
- The three release gates are:
  1. Sprint 1 complete: safe payment-code baseline.
  2. Sprints 2-4 complete: production security baseline.
  3. Sprint 5 complete: ready for formal validation, subject to sufficient operating evidence.

## Status summary

| Sprint | Status | Outcome |
|---|---|---|
| 1 — Critical payment-code risks | **Complete** | Payment processing fails securely and avoids sensitive logging. |
| 2 — Scope, credentials, identities, and live AWS | **Active** | Confirm formal scope and finish production-readiness evidence. |
| 3 — Browser payment-page protection | Planned | Protect and monitor scripts, headers, and public payment surfaces. |
| 4 — Detection and vulnerability operations | Planned | Establish repeatable scanning, logging, alerting, and testing. |
| 5 — Operational readiness and validation | Planned | Exercise procedures and assemble independently reviewed evidence. |

## Sprint 1 — Critical payment-code risks

**Status: Complete — August 15, 2026**

### Required outcome

Make the payment path fail securely, prevent sensitive payment material from entering
logs, and prevent a client or duplicate request from creating an unauthorized or duplicate
payment.

### Completed safeguards and evidence

- [x] Missing, malformed, and invalid Authorize.Net webhook signatures are rejected before processing.
- [x] Unsupported webhook events are rejected and notification receipts prevent replay/duplicate processing.
- [x] Full payment events, request bodies, account data, and opaque tokens are excluded from logs; errors use allowlisted structured fields.
- [x] Cognito identity and server-side profile ownership are required.
- [x] The server validates amount and payment method and owns fees, initial status, profile association, and authoritative payment records.
- [x] Conditional DynamoDB transactions and deterministic idempotency IDs prevent duplicate charges and records.
- [x] Captured transaction IDs survive record-finalization failures; signed webhooks can recover by merchant reference, and scheduled reconciliation repairs verified pending/final states.
- [x] Card and ACH rails are verified from processor data and mismatches fail closed.
- [x] Refund, void, ACH pending, settlement, and return transitions are atomic and idempotent.
- [x] All three payment Lambda suites pass: 22 tests covering authentication, ownership, amount validation, idempotency, replay, redaction, processor rail, failure recovery, and reconciliation.
- [x] Live unsigned/signed webhook checks returned HTTP 400/200 respectively.
- [x] Daily reconciliation is enabled at `cron(0 12 * * ? *)` and controlled invocations completed without errors.

### Moved to Sprint 2

- **Controlled production ACH pilot:** Authorize.Net does not simulate eCheck settlement or
  returns in sandbox. Unit and reconciliation behavior are complete, but final
  processor-driven settlement/return, exactly-once balance application, and lock release
  must be evidenced with a low-value controlled production transaction before payment go-live.

## Sprint 2 — Scope, credentials, identities, and live AWS

**Status: Active**

This sprint absorbs the original scope-baseline work because those external approvals were
not required to finish the essential Sprint 1 engineering safeguards. They remain required
before formal validation.

### Already completed

- [x] Rotated Authorize.Net credentials; prior versions are reported inactive.
- [x] Moved transaction and signature keys to Secrets Manager with scoped Lambda read policies.
- [x] Removed raw secret parameters from tracked and local Amplify configuration.
- [x] Scanned the tracked tree with Gitleaks: no current finding. Retained the redacted history result of 18 potential-secret findings in 9 of 139 commits as incident/rotation evidence.
- [x] Replaced the long-lived `ninube` CLI key with the named `nisan` IAM Identity Center profile and MFA at every login.
- [x] Deleted legacy IAM users, access keys, groups, Stripe source, and obsolete `dev`/`staging` environments and residual Stripe cloud resources.
- [x] Verified the active Authorize.Net transaction and webhook Lambdas and the reconciliation schedule in AWS `main`.
- [x] Updated the serverless inventory and payment-flow documentation.

### Remaining Sprint 2 work

- [ ] Obtain written acquirer/QSA confirmation of merchant level, applicable SAQ, eCheck treatment, systems/personnel/facilities in scope, and whether ASV scanning is required.
- [ ] Approve the payment-flow diagram, serverless architecture diagram, service-provider/system inventory, and every proposed N/A rationale; record reviewer and date.
- [ ] Assign named control owners and approvers in the operations manual/RACI.
- [ ] Complete and retain the controlled production ACH pilot described above.
- [ ] Complete a dated live-configuration evidence pack for Hosting/TLS, Cognito, AppSync, Lambda, API Gateway, DynamoDB/S3, IAM, CloudTrail/CloudWatch, DNS, schedules, backups, and public-access controls; resolve or document drift.
- [ ] Perform negative verification that an unauthorized identity cannot read payment secrets.
- [ ] Complete documented CloudWatch/build-artifact searches for prior credentials or prohibited payment data and follow the approved retention/incident process for any finding.
- [ ] Test break-glass access and retain its audit record; establish the quarterly privileged-access review and leaver test.
- [ ] Retain redacted rotation receipts and evidence that replacement credentials work and superseded credentials are inactive.

### Sprint 2 completion gate

- Scope and N/A dispositions are approved in writing.
- Production ACH settlement or return is evidenced without duplicate balance application.
- Live AWS inventory matches the approved diagrams or has reviewed exceptions.
- Payment secrets are inaccessible to unauthorized identities and absent from tracked/frontend artifacts.
- Named privileged access, MFA, break-glass, key retirement, and recurring access review have evidence.

## Sprint 3 — Browser payment-page protection

**Goal:** Protect the browser page that handles payment fields before Accept.js tokenization.

- Inventory and approve every payment-page script, including source, purpose, owner, and expected behavior.
- Deploy restrictive CSP with reporting, HSTS, and appropriate secure response headers.
- Record whether SRI is feasible for Accept.js and approve any compensating control.
- Deploy independent PCI 11.6.1 payment-page/header tamper monitoring at least weekly, preferably near-real-time, with actionable alerts.
- Add WAF or an approved equivalent, API/webhook rate limits, method/path restrictions, and abuse alerts.
- Prove an unauthorized script/origin is blocked, a controlled modification alerts, normal card/ACH tokenization still works, and reports contain no payment values.

## Sprint 4 — Detection and vulnerability operations

**Goal:** Turn security configuration into repeatable operating controls.

- Maintain asset/software inventory and an SBOM.
- Add dependency, secret, SAST, and relevant IaC scans with remediation timelines.
- Establish runtime/dependency update procedures for the frontend and Lambdas.
- Configure protected centralized logs, retention, CloudTrail/service events, and actionable alerts.
- Start documented daily alert review and weekly payment-page tamper review.
- Inventory administrator/developer endpoints and apply EDR/anti-malware or approved risk-based treatment.
- Perform applicable ASV and penetration testing after scope confirmation and significant changes.
- Prove test vulnerabilities/secrets fail the pipeline and controlled IAM/security events produce reviewed alerts.

## Sprint 5 — Operational readiness and validation

**Goal:** Produce operating evidence suitable for independent review and formal validation.

- Approve policies, RACI, risk method, incident plan, contacts, evidence repository, acceptable-use, remote-access, and service-provider procedures.
- Complete role-based awareness and secure-development training.
- Collect AWS/Authorize.Net AOCs and responsibility matrices; complete the TPSP register and agreements.
- Decide every applicable Requirement 9 facility row individually, with evidence or signed N/A rationale.
- Run an incident tabletop covering payment-page compromise, credential leak, malicious webhook, account takeover, and provider outage.
- Independently review evidence and update questionnaire rows only after each control passes.
- Prepare and submit the acquirer-confirmed SAQ/AOC package or track the assessor's exception list.

## Recurring control calendar

- **Daily:** Review critical security/payment alerts and failed webhook/reconciliation activity.
- **Weekly:** Review payment-page/header tamper monitoring and unresolved secret/redaction alerts.
- **Monthly:** Triage dependencies/vulnerabilities and review account, key, service, and TPSP drift.
- **Quarterly:** Review access, applicable ASV/wireless requirements, vulnerabilities, and evidence quality.
- **Semiannual:** Review WAF/API rules, incident contacts, script inventory, and segmentation if used.
- **Annual:** Reconfirm scope, diagrams, inventory, risk, policies, training, incident exercise, provider evidence, questionnaire, and N/A decisions.
- **After significant change:** Repeat scope/threat review, approvals, testing/scanning, required penetration testing, baseline updates, and deployment evidence before closure.

## Provenance

This guide preserves the delivery plan originally developed in the
[PCI planning thread](https://ampcode.com/threads/T-019f87bf-1369-735c-bf73-283cdce0271a)
and updates it with verified repository and AWS accomplishments through August 15, 2026.
Future sprint decisions should update this file rather than depend on thread history.
