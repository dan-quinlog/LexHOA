# Feature Specification: Invoices

## Overview

Today every charge to an owner is an invisible change to `Profile.balance`. The annual
`monthlyPropertyDues` Lambda adds `DUES_AMOUNT × owned properties` to the balance, and the
board adjusts balances by hand. This feature adds an `Invoice` record for every charge, so
owners and the board can see what was charged, when, why, and by whom. It also records who
created each payment and whether it came from Authorize.Net or the board.

**Deadline:** Phase 1 must be deployed before the dues run on November 1, 2026
(`cron(0 6 1 11 ? *)`, 06:00 UTC).

---

## Decisions

- Invoices are a separate model from `Payment`.
- Payments reduce the owner's balance as they do today. Invoices carry no per-invoice paid
  amount and are not linked to payments.
- An invoice either applies to the balance or is a record only (`balanceApplied: false`),
  so historic invoices can be entered without changing current balances.
- Invoices are voided, never deleted. Voiding an applied invoice reverses its balance change.
- Dues are billed for the following year: the November 1, 2026 run creates `2027` invoices
  due December 31, 2027.
- No automation applies late fees. `LATE_FEE` invoices are created manually by the board.
- Direct `Profile.balance` edits by the Treasurer and President remain available while
  profiles are being merged. Restricting them is deferred to a later sprint.
- Mid-year sales are handled with manual `ADJUSTMENT` invoices, for example a credit to the
  seller and a charge to the buyer for a prorated amount.

---

## Data model

```graphql
type Invoice @model
  @auth(rules: [
    { allow: owner, operations: [read] },
    { allow: groups, groups: ["BOARD", "TREASURER", "PRESIDENT"], operations: [read] },
    { allow: private, provider: iam, operations: [create, read, update] }
  ]) {
  id: ID!                          # dues-<billingPeriod>-<profileId> for the dues Lambda
  invoiceNumber: String! @index(name: "byInvoiceNumber", queryField: "invoicesByInvoiceNumber")
  type: InvoiceType!
  status: InvoiceStatus @default(value: "ISSUED")
  billingPeriod: String            # e.g. "2027"
  lineItems: [InvoiceLineItem!]!
  totalAmount: Float!              # sum of lineItems; negative only for ADJUSTMENT
  balanceApplied: Boolean!
  dateApplied: AWSDate!
  dateDue: AWSDate!
  description: String
  relatedInvoiceId: ID             # e.g. an adjustment's original dues invoice
  createdBy: String                # board-visible only (field-level auth)
  voidedBy: String                 # board-visible only
  voidedAt: AWSDateTime
  voidReason: String
  owner: String                    # owner's Cognito ID; set by mergeProfiles when absent
  ownerInvoicesId: ID! @index(name: "byOwnerInvoices", queryField: "invoicesByOwner", sortKeyFields: ["dateApplied"])
  byTypeDateApplied: String @default(value: "INVOICE")
    @index(name: "byTypeDateApplied", queryField: "invoicesByTypeDateApplied", sortKeyFields: ["dateApplied"])
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}

type InvoiceLineItem {
  propertyId: ID
  address: String                  # snapshot at invoice time
  description: String
  amount: Float!
}

enum InvoiceType { DUES ASSESSMENT LATE_FEE ADJUSTMENT }
enum InvoiceStatus { ISSUED VOID }
```

`Profile` gains `invoices: [Invoice] @hasMany(indexName: "byOwnerInvoices", fields: ["id"])`.
Clients never write invoices directly; all writes go through the Lambdas below.

### Invoice numbers

Invoice numbers are readable, unique, and sequential: `INV-000001`, `INV-000002`, and so on.
The next number is stored in a counter item (IAM-only `Counter` model, item `INVOICE`).
Each invoice is written in one DynamoDB transaction that:

1. puts the invoice with `attribute_not_exists(id)`,
2. advances the counter from the value just read (`seq = :read`), and
3. adds `totalAmount` to `Profile.balance` when `balanceApplied` is true.

A counter race cancels the transaction and is retried with a fresh read. A rerun for an
existing dues invoice cancels on step 1 and is skipped. Either way no number is consumed,
so the sequence has no gaps and no duplicates.

---

## Payment changes

Add to `Payment`, readable by `BOARD`, `TREASURER`, and `PRESIDENT` but not by the owner:

- `source: PaymentSource` (`ONLINE` for Authorize.Net, `BOARD` for manual entry)
- `createdBy: String`
- `voidedBy`, `voidedAt`, `voidReason`

Set `source` and `createdBy` in `createAuthNetTransaction` (the paying owner) and in a new
`recordManualPayment` mutation (the board member). `recordManualPayment` replaces the browser's
separate `createPayment` and `updateProfile` calls in `PaymentEditModal`, writing the payment
and any balance change in one transaction.

Replace payment deletion with `voidPayment` for `BOARD` payments: set the status to
`CANCELED`, record the void fields, and restore the balance if it was applied. `ONLINE`
payments are reversed through the processor's refund and void flow, not by the board.
Remove the `delete` permission from `Payment`.

Existing payments are backfilled with `source` (`CARD` or `BANK_ACCOUNT` → `ONLINE`,
otherwise `BOARD`) and no `createdBy`. Running the backfill is a production data change and
needs explicit approval.

The remaining legacy fields (`invoiceNumber`, `invoiceAmount`, `checkAmount`, and the
transaction ID written into `checkNumber`) are unchanged pending a board review.

---

## Server mutations

| Mutation | Caller | Behavior |
|---|---|---|
| `createInvoice` | Treasurer, President | Validates type, line items, and dates; requires a description for `ADJUSTMENT`; writes the invoice with the next number; applies the balance when requested; records `createdBy` from the caller's identity. |
| `voidInvoice` | Treasurer, President | Sets `VOID` and the void fields; reverses the balance if the invoice was applied. |
| `recordManualPayment` | Treasurer, President | See Payment changes. |
| `voidPayment` | Treasurer, President | See Payment changes. |

All amounts are calculated in cents.

### Dues Lambda (`monthlyPropertyDues`)

For each owner with properties, create one `DUES` invoice instead of only updating the
balance:

- `id`: `dues-<year + 1>-<profileId>`, which makes reruns idempotent and replaces
  `lastAnnualDuesPeriod`
- `billingPeriod`: run year + 1
- `dateApplied`: run date; `dateDue`: December 31 of the billing year
- one line item per owned property, each `DUES_AMOUNT`, with the property address
- `balanceApplied: true`, `createdBy: "SYSTEM"`
- `owner`: the profile's Cognito ID, if it has one

The existing partial-failure reporting stays.

### `mergeProfiles`

Move the source profile's invoices to the target profile and set `owner`, as it already
does for payments.

---

## User interface

- **Owner Billing page:** `PaymentHistory` shows invoices and payments in one list, newest
  first. Invoices are sorted by `dateApplied` and payments by `checkDate` or `createdAt`.
  Invoices show number, type, billing period, properties, amount, due date, and a `Void`
  badge when voided. `source`, `createdBy`, and void details are not shown to owners.
- **Board Tools:** create invoices (owner, type, line items, dates, description, apply to
  balance), find invoices by owner or number, and void invoices. Payment management shows
  `source` and `createdBy`, and replaces Delete with Void for board payments.

---

## Delivery

**Phase 1 (before November 1):** `Invoice`, `InvoiceLineItem`, the counter, dues Lambda
changes, `mergeProfiles` invoice transfer, and the owner Billing history.

**Phase 2 (this sprint):** `createInvoice`, `voidInvoice`, payment `source` and `createdBy`,
`recordManualPayment`, `voidPayment`, the Board Tools UI, and the payment backfill.

**Deferred:**
- Restrict direct `Profile.balance` edits once profile merges are finished.
- Board decision on the legacy `Payment` fields.
