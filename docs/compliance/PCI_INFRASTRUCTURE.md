# PCI Infrastructure and Payment Data Flow

**System:** Lexington Commons HOA website (LexHOA)  
**Environment reviewed:** AWS Amplify `main`, AWS Region `us-east-1`  
**Last repository review:** July 21, 2026  
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

The raw card or bank values are not sent to AWS AppSync, Lambda, or DynamoDB and are not intentionally stored by LexHOA. Authorize.Net returns a short-lived opaque payment-data descriptor and value to the browser. The browser sends that opaque data, along with amount and member/payment metadata, through the AppSync API to the transaction Lambda. The repository does not yet prove that this custom mutation requires Cognito authentication or validates profile ownership; mandatory server-side authentication, ownership, amount, and record controls are P0 remediation items. The Lambda submits the opaque data to Authorize.Net's transaction API. LexHOA stores only non-cardholder transaction records such as the Authorize.Net transaction ID, payment method category, amount, fee, status, description, member/profile reference, and timestamps.

Authorize.Net sends signed asynchronous transaction events to the public API Gateway webhook endpoint. The webhook Lambda is intended to verify the event signature before updating payment status or member balance through IAM-authenticated AppSync requests. The current implementation validates a signature only when the header is present and accepts missing signatures; mandatory fail-closed verification is a P0 remediation item. A scheduled reconciliation Lambda also queries Authorize.Net for pending eCheck settlement status and updates the application records.

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
| Authorize.Net merchant credentials and webhook signature key | Lambda environment/configuration | Never exposed to browser or committed source; verify current secret-management controls in AWS |

## Security boundaries and controls represented

- All external flows shown in the diagrams are HTTPS/TLS connections.
- Amazon Cognito authenticates members; AppSync supports Cognito, IAM, API-key, and model-level authorization rules. The payment mutation's Cognito authentication and profile-ownership enforcement require remediation and live verification.
- Lambda execution roles provide service-to-service access to AppSync and other required AWS resources.
- DynamoDB and S3 are managed data services and are not directly reachable as database servers from the public internet.
- The Authorize.Net client key and API login ID are browser-public integration identifiers; the transaction key and signature key are backend secrets.
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

## Repository findings requiring remediation

The July 21, 2026 repository review identified two implementation details that do not yet satisfy controls stated in this document:

1. The transaction Lambda logs the complete AppSync event, which includes the Authorize.Net opaque payment descriptor and value. Replace that log with a redacted event summary and review existing CloudWatch logs and retention.
2. The webhook Lambda validates a signature when the `X-ANET-Signature` header is present but does not reject a request when the header is absent. Require the header and reject every missing or invalid signature before parsing or processing the event.

Do not mark the related operational-verification items complete until the deployed functions have been remediated and tested.

## Review log

| Date | Reviewer | Trigger | Result / changes | Approval |
|---|---|---|---|---|
| 2026-07-21 | Repository review | Initial infrastructure documentation | Corrected VPC/server claims and documented Accept.js direct-tokenization flow | Pending operational review |
