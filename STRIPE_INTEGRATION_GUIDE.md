# Stripe Payment Integration Guide

## Overview
This document outlines the Stripe payment integration for LexHOA, enabling residents to pay HOA dues online with processing fees passed to the customer.

## Status: Backend Complete ✅

### Completed
- ✅ Stripe account setup (sandbox ready for testing)
- ✅ GraphQL schema updates with Stripe fields
- ✅ Lambda functions created for payment processing
- ✅ Fee passthrough calculation implemented (2.9% + $0.30)
- ✅ Payment tracking and balance updates

### Pending
- ⏳ Amplify environment configuration (Stripe API keys)
- ⏳ Lambda function registration with Amplify
- ⏳ Frontend payment components
- ⏳ Testing and deployment

---

## Schema Changes

### Payment Model Enhancements
**New Fields:**
- `paymentMethod`: Enum (CHECK, STRIPE_CARD, STRIPE_ACH, CASH)
- `stripePaymentIntentId`: Payment intent identifier
- `stripeCustomerId`: Stripe customer identifier
- `amount`: Base payment amount
- `processingFee`: Calculated Stripe fee
- `totalAmount`: Total charged to customer
- `status`: Payment status (PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELED, REFUNDED)
- `description`: Payment description

**Modified Fields:**
- Made check-related fields optional (checkDate, checkNumber, etc.)
- Updated index on `ownerPaymentsId` to use `createdAt` for better sorting

### Profile Model Enhancements
**New Fields:**
- `stripeCustomerId`: Links profile to Stripe customer

---

## Backend Architecture

### Lambda Functions

#### 1. `createStripePaymentIntent`
**Purpose:** Creates a payment intent with fee calculation
**Parameters:**
- `amount` (Float!): Base HOA dues amount
- `profileId` (ID!): User's profile ID
- `description` (String): Optional payment description

**Fee Calculation:**
```javascript
processingFee = (amount * 0.029) + 0.30
totalAmount = amount + processingFee
```

**Returns:**
- `clientSecret`: For frontend Stripe Elements
- `paymentIntentId`: Payment tracking ID
- `amount`: Base dues amount
- `processingFee`: Calculated fee
- `totalAmount`: Total charged

#### 2. `createStripeCustomer`
**Purpose:** Creates Stripe customer and links to profile
**Parameters:**
- `profileId` (ID!): User's profile ID
- `email` (String!): Customer email
- `name` (String!): Customer name

**Returns:**
- `customerId`: Stripe customer ID
- `success`: Boolean
- `message`: Result message

**Side Effects:**
- Updates Profile with `stripeCustomerId`

#### 3. `handleStripeWebhook`
**Purpose:** Processes Stripe webhook events
**Handles:**
- `payment_intent.succeeded`: Creates Payment record, updates balance
- `payment_intent.payment_failed`: Records failed payment
- `payment_intent.canceled`: Records canceled payment

**Payment Success Flow:**
1. Create Payment record with status SUCCEEDED
2. Fetch current profile balance
3. Subtract payment amount from balance
4. Update profile balance

---

## Configuration Needed

### Environment Variables (To Be Added)
```
STRIPE_SECRET_KEY=sk_test_[REDACTED:stripe-secret-token]
STRIPE_PUBLISHABLE_KEY=pk_test_51SQub3JtzpSwA2PzPnKcYVVwBAPDeStlWYmJIwQurIULFjyvQ75oNcBQTFL352Ildqz7cqkEKn0XGpJnbtdLiW4W00GB4i6cZZ
STRIPE_WEBHOOK_SECRET=[To be generated after webhook endpoint creation]
```

### Next Steps for Deployment

1. **Register Lambda Functions with Amplify**
   ```bash
   # You'll need to run these commands:
   amplify function add
   # Then select existing function resources
   ```

2. **Add Environment Variables**
   ```bash
   amplify function update createStripePaymentIntent
   # Add STRIPE_SECRET_KEY to environment
   
   amplify function update createStripeCustomer  
   # Add STRIPE_SECRET_KEY to environment
   
   amplify function update handleStripeWebhook
   # Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
   ```

3. **Push Changes to AWS**
   ```bash
   amplify push
   ```

4. **Configure Stripe Webhook**
   - After deployment, get the webhook Lambda URL
   - Add webhook endpoint in Stripe Dashboard
   - Copy webhook signing secret
   - Update Lambda environment with STRIPE_WEBHOOK_SECRET

---

## Frontend Integration (Next Phase)

### Required Packages
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Components to Build
1. **PaymentForm** - Stripe Elements card input
2. **PaymentHistory** - Display past payments
3. **AccountManagement** - Manage payment methods
4. **BalanceDisplay** - Show current balance with "Pay Now" button

### API Integration
```javascript
// Example: Create payment intent
import { API } from 'aws-amplify';

const result = await API.graphql({
  query: createStripePaymentIntent,
  variables: {
    amount: 100.00,
    profileId: userProfileId,
    description: "Monthly HOA Dues"
  }
});

// Use result.clientSecret with Stripe Elements
```

---

## Fee Passthrough Details

### Calculation
- **Stripe Rate:** 2.9% + $0.30 per transaction
- **Example:**
  - HOA Dues: $100.00
  - Processing Fee: $3.20
  - Total Charge: $103.20

### Display to Users
Show itemized breakdown:
```
HOA Dues:          $100.00
Processing Fee:      $3.20
─────────────────────────
Total:             $103.20
```

---

## Testing

### Stripe Test Cards
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Auth:** 4000 0025 0000 3155

### Test Webhook Locally
Use Stripe CLI:
```bash
stripe listen --forward-to <your-webhook-url>
stripe trigger payment_intent.succeeded
```

---

## Security Notes
- Secret key NEVER goes to frontend
- Publishable key is safe for frontend
- Webhook signature validation prevents tampering
- All payments require authentication (Cognito)
