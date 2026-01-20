# LexHOA Stripe Payment Integration Project

## Project Overview

LexHOA is a React-based HOA management site using AWS Amplify. This document tracks the Stripe payment integration for collecting HOA dues with fee passthrough to users.

---

## Architecture

- **Frontend:** React with `@stripe/react-stripe-js` and `@stripe/stripe-js`
- **Backend:** AWS Amplify (AppSync GraphQL, Lambda, API Gateway, Cognito)
- **Payments:** Stripe (sandbox/test mode)
- **Database:** DynamoDB via Amplify GraphQL

---

## Key Configuration Values

### Stripe (Test/Sandbox)

| Key | Value |
|-----|-------|
| Publishable Key | `pk_test_51SQub3JtzpSwA2PzPnKcYVVwBAPDeStlWYmJIwQurIULFjyvQ75oNcBQTFL352Ildqz7cqkEKn0XGpJnbtdLiW4W00GB4i6cZZ` |
| Secret Key | Stored in Lambda env vars (never commit) |
| Webhook Secret | Stored in Lambda env vars (never commit) |

### AWS Resources

| Resource | Value |
|----------|-------|
| Cognito User Pool ID | `us-east-1_bQMOu81V8` |
| Webhook Endpoint URL | `https://oa3pwkjnz4.execute-api.us-east-1.amazonaws.com/dev/webhook/stripe` |
| GraphQL API | `lexhoa` |

### Fee Structure

| Payment Method | Fee | Cap |
|----------------|-----|-----|
| Credit/Debit Card | 2.9% + $0.30 | None |
| ACH (Bank Account) | 0.8% | $5.00 max |

**Formulas:**
- Card: `totalAmount = baseAmount + (baseAmount * 0.029) + 0.30`
- ACH: `totalAmount = baseAmount + min(baseAmount * 0.008, 5.00)`

### Suggested Payment Amounts

| Period | Amount |
|--------|--------|
| Annual | $1,200 |
| 6-Month | $600 |
| Quarterly | $300 |
| Monthly | $100 |

---

## Lambda Functions

### 1. createStripePaymentIntent
**Path:** `amplify/backend/function/createStripePaymentIntent/src/index.js`

Creates a Stripe PaymentIntent with fee calculation. Accepts:
- `amount` (base amount in dollars)
- `profileId` (user profile ID)
- `email` (for receipt)

Returns: `clientSecret`, `paymentIntentId`, `totalAmount`, `processingFee`

### 2. createStripeCustomer
**Path:** `amplify/backend/function/createStripeCustomer/src/index.js`

Creates a Stripe Customer and links to user profile.

### 3. handleStripeWebhook
**Path:** `amplify/backend/function/handleStripeWebhook/src/index.js`

Processes webhook events:
- `payment_intent.succeeded` - Creates Payment record, updates balance
- `payment_intent.payment_failed` - Logs failure
- `payment_intent.canceled` - Logs cancellation

---

## Frontend Components

| Component | Path | Purpose |
|-----------|------|---------|
| Billing Page | `src/pages/billing/Billing.js` | Main billing dashboard with balance & history |
| PaymentModal | `src/components/billing/PaymentModal.js` | Payment form with Stripe Elements |
| BalanceCard | `src/pages/profile/Profile.js` | Profile balance widget linking to billing |
| PaymentHistory | `src/components/billing/PaymentHistory.js` | Transaction list |

---

## GraphQL Schema Updates

Key types in `amplify/backend/api/lexhoa/schema.graphql`:

- **Payment model:** Added `stripePaymentIntentId`, `stripeCustomerId`, `paymentMethod`, `processingFee`, `status`, `receiptEmail`
- **Profile model:** Added `stripeCustomerId`, `balance`
- **Enums:** `PaymentMethod` (CARD, ACH, CASH, CHECK, OTHER), `PaymentStatus` (PENDING, COMPLETED, FAILED, REFUNDED, CANCELED)

---

## Completed Tasks

- [x] Stripe sandbox account created
- [x] GraphQL schema updated with Stripe fields
- [x] Lambda functions created and configured
- [x] REST API endpoint for webhook
- [x] Frontend Billing page and PaymentModal
- [x] BalanceCard on Profile page
- [x] PaymentHistory component
- [x] Fee passthrough calculation (2.9% + $0.30 for card)
- [x] Email receipt support (frontend passes email to Lambda)
- [x] IAM authorization for webhook Lambda
- [x] Fixed PaymentModal prop mismatch issue
- [x] Fixed payment_method_types configuration
- [x] **ACH (Bank Account) payment support** with 0.8% fee (capped at $5)
- [x] Payment method selection UI (Card vs ACH)
- [x] Webhook handler for ACH processing status

---

## Remaining Tasks

### High Priority
- [ ] **Test full payment flow** - End-to-end test with Stripe test cards and ACH
- [ ] **Enable Stripe receipt emails** - Dashboard > Settings > Emails > Enable "Successful payments"
- [ ] **Verify webhook delivery** - Check Stripe Dashboard > Webhooks for successful events
- [ ] **Run `amplify push`** - Deploy ACH changes to backend

### Medium Priority
- [ ] **Manual payment entry for Board members** - Allow admins to record cash/check payments
- [ ] **Payment receipt/confirmation UI** - Show success message with transaction details

### Future Enhancements
- [ ] Recurring/auto-pay setup
- [ ] Payment reminders
- [ ] Production Stripe keys deployment

---

## Test Cards & Bank Accounts (Stripe Sandbox)

### Cards
| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future expiry date and any 3-digit CVC.

### ACH Bank Accounts
When testing ACH, Stripe will prompt to connect a test bank account via their Financial Connections UI. Use these test credentials:
- **Test Institution:** Select any test bank
- **Routing Number:** `110000000`
- **Account Number:** `000123456789`

ACH payments go through a "processing" state before succeeding (simulating the 2-3 day clearing period).

---

## Troubleshooting

### Common Issues

1. **Payment modal not opening:** Check prop names (`isOpen` vs `show`)
2. **Webhook authorization errors:** Ensure Payment model has `{ allow: private, provider: iam }` auth rule
3. **"No payment methods" error:** Verify `payment_method_types: ['card']` in Lambda
4. **Token/auth errors after signup:** User may need to refresh after email verification

### Debugging Commands

```bash
# Push Amplify changes
amplify push

# View Lambda logs
amplify console function

# Check GraphQL schema
amplify api console
```

---

## File References

- Schema: `amplify/backend/api/lexhoa/schema.graphql`
- Lambda functions: `amplify/backend/function/*/src/index.js`
- Frontend queries: `src/queries/queries.js`, `src/queries/mutations.js`
- Environment: `.env` (REACT_APP_STRIPE_PUBLISHABLE_KEY)
