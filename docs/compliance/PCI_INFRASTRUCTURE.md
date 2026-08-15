# PCI Infrastructure and Payment Data Flow

**System:** Lexington Commons HOA website (LexHOA)  
**Environment reviewed:** AWS Amplify `main`, AWS Region `us-east-1`  
**Last repository review:** August 15, 2026
**Document owner:** Lexington Commons HOA  
**Classification:** Confidential — share only with authorized assessors and service providers

## Maintained visual attachments

The following diagrams are maintained as separate visual attachments to this document and must be reviewed at least annually and after any material infrastructure or payment-flow change:

1. [Network and service-boundary diagram](./network-diagram.svg)
2. [Authorize.Net payment data-flow diagram](./payment-data-flow-diagram.svg)

Store exported or signed copies securely with the applicable PCI compliance records. Record the reviewer, approval date, and any changes in the review log below.

## Corrected network-diagram scope

LexHOA uses an AWS-managed, serverless architecture rather than web and database servers deployed in a customer-managed Amazon VPC. Public clients reach AWS-managed HTTPS service endpoints for the hosted React application, Amazon Cognito authentication, and AWS AppSync GraphQL API. AppSync invokes AWS Lambda functions and stores application records in Amazon DynamoDB. Amazon S3 stores HOA documents. The Authorize.Net webhook enters through an Amazon API Gateway HTTPS endpoint and invokes a dedicated Lambda function.

The repository defines no customer-managed VPC, subnets, Internet Gateway, EC2 instances, RDS database, web-server security group, or database security group. Service access is therefore controlled logically through HTTPS endpoints, Cognito authorization, IAM roles/policies, AppSync authorization rules, and S3 access policies—not through the security-group path described in the earlier draft. AWS is responsible for the network controls of its managed service infrastructure under the AWS shared-responsibility model.

No corporate, guest, point-of-sale, or administrative wireless network is connected to the AWS environment. Members and administrators may use their own networks to access the public HTTPS application, but those networks are outside the managed system boundary and receive no direct network route into AWS resources.

## Corrected payment data-flow scope

The browser loads Authorize.Net Accept.js from an Authorize.Net domain over HTTPS. Card number, expiration date, and card verification code—or bank account and routing information for eCheck—are entered into React-controlled fields in the LexHOA payment page. LexHOA's browser-side JavaScript passes those values directly to Accept.js, which transmits them from the member's browser to Authorize.Net for tokenization.

The raw card or bank values are not sent to AWS AppSync, Lambda, or DynamoDB and are not intentionally stored by LexHOA. Authorize.Net returns a short-lived opaque payment-data descriptor and value to the browser. The browser sends that opaque data through a Cognito-authenticated AppSync mutation to the transaction Lambda. The Lambda derives the member identity from the Cognito subject, verifies profile ownership, validates the amount and payment metadata, submits the opaque data to Authorize.Net, and creates the authoritative payment record. LexHOA stores only non-cardholder transaction records such as the Authorize.Net transaction ID, payment method category, amount, fee, status, description, member/profile reference, and timestamps.

Authorize.Net sends signed asynchronous transaction events to the public API Gateway webhook endpoint. The webhook Lambda rejects missing, malformed, and invalid signatures before processing supported payment events, then updates payment status or member balance through IAM-authenticated AppSync requests. A scheduled reconciliation Lambda also queries Authorize.Net for pending eCheck settlement status and updates the application records.

### Important PCI scope statement

The current integration is **Accept.js direct tokenization**, not Accept Hosted, an Authorize.Net-hosted iframe, or an Authorize.Net redirect. Because LexHOA renders the payment fields and its JavaScript handles payment values in the browser before tokenization, it is inaccurate to state that cardholder data "completely bypasses the HOA website." It bypasses the AWS backend and database, but the payment page and browser-side code remain security-relevant. The applicable SAQ and final PCI scope should continue to be confirmed with the acquiring bank, Authorize.Net, or a qualified PCI assessor.

## Data classification and storage

| Data | Systems traversed | LexHOA persistence |
|---|---|---|
| Card number, expiration, card verification code | Member browser/payment page → Accept.js → Authorize.Net | Not intentionally stored in AWS |
| Bank routing/account number and account-holder name | Member browser/payment page → Accept.js → Authorize.Net | Not intentionally stored in AWS |
| Opaque payment descriptor/value | Authorize.Net → browser → AppSync → transaction Lambda → Authorize.Net | Used transiently; must not be intentionally logged or stored |
| Member email/profile ID, amount, fee, payment method category | Browser → AppSync/Lambda → Authorize.Net | Stored where required for member and payment records |
| Transaction ID, status, amounts, description, timestamps | Authorize.Net/Lambda/webhook → AppSync → DynamoDB | Stored as the payment record |
| Authorize.Net transaction and webhook signature keys | AWS Secrets Manager → payment Lambdas | Never exposed to browser or committed source; Lambda configuration contains secret identifiers, not secret values |

## Security boundaries and controls represented

- All external flows shown in the diagrams are HTTPS/TLS connections.
- Amazon Cognito authenticates members; the payment transaction Lambda derives the caller from Cognito and enforces profile ownership and amount controls server-side.
- Lambda execution roles provide service-to-service access to AppSync and other required AWS resources.
- DynamoDB and S3 are managed data services and are not directly reachable as database servers from the public internet.
- The Authorize.Net client key and API login ID are browser-public integration identifiers; the transaction key and signature key are backend secrets.
- The transaction and signature keys are stored in AWS Secrets Manager. Payment Lambda roles receive scoped read access to only the key each function requires.
- CloudWatch receives application and Lambda logs. Raw payment values and opaque payment tokens must not be written to logs.
- There is no trusted wireless network or wireless entry point within the AWS system boundary.

## Items requiring operational verification

The repository establishes application intent but cannot prove every live control. Verify and retain evidence for the following during each diagram review:

- Production website hostname, Amplify Hosting branch, TLS certificate, and HTTPS redirect.
- API Gateway Authorize.Net webhook URL, TLS configuration, deployed route, throttling, and access-log settings.
- Mandatory webhook signature rejection when the signature header is absent or invalid.
- IAM least privilege for each payment Lambda execution role.
- DynamoDB and S3 encryption, S3 public-access block, backup/recovery settings, and retention.
- CloudWatch log groups, access controls, retention, alerting, and absence of raw payment values or opaque tokens.
- Secure storage and rotation of the Authorize.Net transaction key and webhook signature key.
- Production environment selection for both Accept.js and the Authorize.Net server API.
- Content Security Policy and change/tamper monitoring for the payment page and third-party payment script.
- Current Authorize.Net webhook subscriptions and eCheck reconciliation schedule.

## August 15, 2026 operational verification

The Sprint 2 review verified the following in the AWS `main` sandbox environment:

- Transaction and signature keys are held in Secrets Manager under `lexhoa/main/authorizenet/`; deployed Lambda environment variables contain only secret identifiers.
- The active Authorize.Net webhook targets API Gateway `d0tqka2jj1` and subscribes to auth-capture, refund, and void events. An unsigned request returned HTTP 400 and a correctly signed controlled request returned HTTP 200.
- The EventBridge rule targeting `reconcileAuthNetPayments-main` is enabled on `cron(0 12 * * ? *)`. A controlled reconciliation checked the pending ACH payment without error and retained its active-payment lock while Authorize.Net reported `capturedPendingSettlement`.
- Payment Lambda unit suites passed after adding authentication/ownership, redacted logging, fail-closed webhook, payment-rail, and reconciliation coverage.
- Gitleaks 8.30.1 scanned the current tracked tree and 139-commit history. Historical findings remain and require retention as rotated-credential incident evidence; see the remediation-roadmap status for the remaining local documentation finding.

The remaining live-control checks in the preceding section still require periodic evidence. In particular, eventual ACH settlement and balance application must be observed before the end-to-end ACH scenario is closed.

## Review log

| Date | Reviewer | Trigger | Result / changes | Approval |
|---|---|---|---|---|
| 2026-07-21 | Repository review | Initial infrastructure documentation | Corrected VPC/server claims and documented Accept.js direct-tokenization flow | Pending operational review |
| 2026-08-15 | Sprint 2 technical review | Payment security and ACH closeout | Verified deployed authentication, Secrets Manager integration, webhook validation, and scheduled reconciliation; historical secret findings and IAM actions remain | Pending control-owner approval |
