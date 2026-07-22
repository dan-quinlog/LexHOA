# PCI Operations Manual

**Executable handoff baseline:** 2026-07-21 | **Standard:** PCI DSS v4.0.1 | **Owner:** `[Compliance Owner]`

This runbook is planning guidance, not certification. Confirm the validation form with the acquirer/QSA; custom Accept.js likely points to A-EP but eligibility is not asserted. Use the [roadmap](./PCI_REMEDIATION_ROADMAP.md), [answer key](./PCI_QUESTIONNAIRE_ANSWER_KEY.md), [infrastructure narrative](./PCI_INFRASTRUCTURE.md), [network diagram](./network-diagram.svg), and [payment flow](./payment-data-flow-diagram.svg). Do not rely on contrary claims in older drafts.

## Scope and hard handling rules

LexHOA is AWS Amplify Gen1 serverless: Amplify-hosted React; Cognito; AppSync; Lambda; DynamoDB; S3; API Gateway webhook; CloudWatch/CloudTrail as configured; and Authorize.Net Accept.js/API. There is no repository-defined merchant VPC, EC2, RDS, web/database server, or physical POI. React-controlled card/eCheck fields pass raw values to vendor Accept.js; the opaque value then traverses authenticated AppSync/Lambda to Authorize.Net. Webhooks enter API Gateway/Lambda; reconciliation is scheduled. Git/CI, DNS, administrator endpoints, AWS and third parties may be security-impacting and remain in scope until the written scope says otherwise.

Never store, log, paste, email, message, screenshot, ticket, or use in tests: PAN, CVV/SAD, expiration plus PAN, bank account/routing data, Accept.js opaque values, transaction/signature keys, or live secrets. Never store SAD after authorization. Use synthetic vendor test data only. Store only approved transaction metadata; mask PAN if ever displayed. Do not download CHD or create paper/electronic CHD media. Stop and invoke incident response if prohibited data is found.

## Roles and RACI (fill names; preserve role separation)

| Activity | Responsible | Accountable | Consulted / informed |
|---|---|---|---|
| Scope, SAQ, evidence, TPSPs | `[Compliance Owner]` | `[Executive Approver]` | `[Acquirer/QSA]`, owners |
| AWS/IAM/deploy/DNS/WAF | `[AWS Administrator]` | `[Security Owner]` | `[Application Owner]` |
| Payment code/script/webhook | `[Application Owner]` | `[Security Owner]` | `[Change Approver]` |
| Logs/vulnerability/incident | `[Security Operations Owner]` | `[Incident Commander]` | `[Legal/Communications]` |
| Access approval/review | `[Identity Owner]` | `[System Owner]` | `[HR/Board delegate]` |

No developer self-approves a payment/security change. Record backups/delegates and vendor contacts in the restricted contact sheet.

## Change and deploy checklist

1. Ticket states purpose, systems/data touched, risk/significance, rollback, owner, tests, and control/evidence impact. Update threat model, scope, diagrams and script inventory when affected.
2. Peer security review authorization, input validation, server-owned amount/profile/status, idempotency, webhook fail-closed behavior, logs/redaction, dependencies, IAM and secrets. Never trust browser success or profile identifiers.
3. Run unit/integration/negative/replay tests and dependency, SAST, secret and IaC scans. Use sandbox/synthetic data. Significant changes also receive required vulnerability/penetration testing.
4. Obtain independent approval; deploy through named MFA-protected CI/AWS identity. Record commit, build, approver, resource/version IDs and configuration diff.
5. Verify production HTTPS/CSP/WAF, Accept.js environment, transaction and authoritative record, duplicate retry, mandatory signed webhook, reconciliation, alarms, redacted logs and rollback. Attach output; update baselines. Do not close failed checks.

## Payment-page scripts and tamper response

Maintain a register of every script on payment routes: exact source/domain, purpose, owner, approval, loading method/version behavior, pages, integrity mechanism, last review and removal decision. Accept.js is currently dynamically loaded from the environment-specific Authorize.Net domain. Default-deny CSP must authorize only reviewed sources; document SRI feasibility and compensating protection rather than falsely claiming SRI. Run independent 11.6.1 header/content comparison at least weekly and after deploy. On unauthorized change: disable payment if safe, preserve page/headers/DNS/build evidence, alert the Incident Commander, invalidate deployment/credentials as indicated, investigate Git/CI/AWS/vendor, restore approved baseline, test, and document.

## Secrets and access

- **Rotate:** create replacement in Authorize.Net/provider; store in Secrets Manager/SSM SecureString with KMS and least-privilege runtime role; deploy/test; revoke old; search source/history/build/logs; retain redacted receipt. Frontend client key/login identifiers are public integration configuration, not backend secrets, but still controlled.
- Rotate immediately on exposure/personnel change and on the approved cryptoperiod. Never put secret values in evidence. Dual-control emergency access; test break-glass and record use.
- Quarterly and on joiner/mover/leaver events export AWS root/IAM/SSO, Git/CI, DNS, Authorize.Net, Cognito privileged users and service keys. Match named owner/business need/least privilege/MFA; disable stale/shared accounts; approve exceptions; verify closure. MFA is mandatory for all privileged access.

## Monitoring, vulnerability, and response

Daily, review designated CloudTrail, CloudWatch, WAF/API Gateway, Cognito, Git/CI, tamper and payment/webhook/reconciliation alerts. Open a ticket with time, reviewer, query/alert, result and escalation. Logs use allowlisted fields, UTC clocks, access protection and approved retention; test redaction with prohibited-data fixtures. A sensitive-data hit is an incident, not a normal log-cleanup task.

Continuously inventory/SBOM and scan dependencies, source, secrets and infrastructure. Triage at least monthly and after advisories; fix critical/high findings within PCI/policy deadlines or document approved risk treatment. Upgrade supported Lambda Node runtimes and owned packages and redeploy—do not perform fictional manual OS patching on AWS managed serverless services. Run quarterly external ASV scans/rescans if applicable, annual and significant-change penetration tests, and segmentation tests if segmentation is claimed.

Maintain a separate inventory of scoped administrator/developer endpoints and managed runtimes for Requirement 5. Centrally managed anti-malware must cover every susceptible component; systems assessed as not susceptible require a documented periodic risk evaluation. Verify automatic updates, periodic scans or continuous analysis, inserted-removable-media handling, protected logs, and prevention of user disablement. Test a benign detection and retained alert at least annually and after material tool changes. Maintain technical anti-phishing controls for scoped personnel. Dependency, SAST, secret and IaC scanners do not substitute for anti-malware or anti-phishing controls.

## Operating calendar

| Frequency | Required record |
|---|---|
| Daily | Security/audit review; failed payment, webhook and reconciliation review; incident/ticket disposition. |
| Weekly | 11.6.1 payment-page/header tamper report; redaction/secret and unresolved alert review. |
| Monthly | Vulnerability/dependency/runtime remediation; inventory/key drift; vendor advisories; recovery sample. |
| Quarterly | Access/MFA review; ASV scan/rescan if applicable; vulnerability evidence; unauthorized wireless detection when required by confirmed scope/questionnaire; evidence audit. |
| Semiannual | WAF/NSC/API rule review; script register; incident contacts/plan; segmentation test if required. |
| Annual | Scope/component/data inventory and diagrams; policy/risk/RACI/training; incident exercise; penetration test; TPSP status/AOCs; questionnaire/AOC and N/A revalidation. |
| Significant change | Scope/risk/threat review, approvals, scans/tests/pen test as required, diagrams/script/CSP/tamper baseline/runbook updates before closure. |

## Incident procedure

Anyone detecting suspected account-data exposure, key leak, unauthorized page/script/header, account takeover, malicious webhook, fraud, or logging violation immediately contacts `[Incident Commander]`; do not delete or alter evidence. Commander records UTC times, limits access, preserves logs/build/page/DNS/cloud evidence, contains affected payment/deploy/identity paths, rotates credentials, and engages `[Acquirer]`, Authorize.Net, AWS, QSA/PFI, brands, law enforcement, insurer, counsel and communications according to approved notification decisions. Eradicate, restore known-good versions, validate monitoring/payment integrity, obtain recovery approval, and complete lessons learned/control updates. Test annually and after material change.

## Evidence repository

Restricted path: `PCI/<validation-year>/<requirement>/<control-id>/`. Filename: `YYYY-MM-DD_control-id_environment_artifact_owner_vNN.ext`. Each artifact has collection UTC time, collector, live resource/account/region, command/query or screenshot context, period covered, reviewer, result, hash/version, ticket and retention date. Redact secrets and personal/account data without hiding control settings. Keep a read-only index mapping each answer to artifacts, owner and expiry; preserve originals and approvals. Repository code/templates are design evidence, **not** proof of live operation.

## TPSPs, annual validation, and N/A

Maintain AWS, Authorize.Net, hosting/DNS, Git/CI, security-tool and assessor register with service, data/access, contract, owner, incident contact, responsibility matrix, current AOC/expiry and monitoring result. Annually obtain AOCs directly or from trusted portals, verify service coverage and shared responsibilities, and escalate lapses—an AOC never transfers LexHOA responsibilities.

For annual validation: (1) obtain written acquirer/QSA scope and SAQ/version confirmation; (2) freeze dated inventories/diagrams; (3) duplicate the answer key for the period; (4) collect operating-period evidence; (5) resolve every No/expired artifact; (6) independently review every answer and compensating control; (7) authorized officer signs only the acquirer-required SAQ/AOC; (8) submit securely and retain receipt/findings; (9) schedule remediation and next cycle. PCI DSS v4.0.1 is current; the local PDF is only a custom v4.0-derived checklist.

An owner proposing **N/A** must document the exact control, technical/business fact, systems checked, queries/interviews and date; map it to current scope/data flow; have Compliance Owner and QSA/acquirer review where material; and set annual/significant-change expiry. Revalidate on architecture, payment, vendor, facility, remote-access, storage or questionnaire change. If evidence is absent, answer **No**, not N/A. No merchant-managed wireless does not automatically make unauthorized-AP detection N/A under full SAQ D. For each Requirement 9 physical row, identify any merchant-controlled CDE facility or sensitive area; either retain the required entry, monitoring, hardware/console, personnel-revocation and visitor evidence or approve a row-specific N/A. A scope review alone is not evidence that an applicable physical control operates.
