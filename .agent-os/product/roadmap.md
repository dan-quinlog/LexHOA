# LexHOA Product Roadmap

## Overview
This roadmap outlines planned features and enhancements for the Lexington Commons HOA Management System.

---

## Active Development

### Feature 1: Document Library 📄
**Priority:** High  
**Status:** Planning  
**Target:** Q1 2025  

#### Purpose
Provide public-facing access to important HOA documents such as insurance policies, bylaws, CC&Rs, and meeting minutes.

#### Requirements
- Public-facing page (accessible without authentication)
- Similar navigation structure to Amenities page
- Document categories/folders
- View/download capabilities
- Board members can upload/manage documents

#### Technical Implementation
- **Frontend:** New page at `/documents` in `src/pages/public/`
- **Backend:** S3 bucket for document storage
- **GraphQL:** New `Document` type with metadata
- **Access Control:** 
  - Public: Read-only access
  - Board: Upload, edit, delete

#### User Stories
1. As a homeowner, I want to view the HOA bylaws without logging in
2. As a board member, I want to upload annual insurance policy documents
3. As a resident, I want to download meeting minutes from past years

#### Success Metrics
- Average time to access documents < 3 seconds
- 80% of homeowners can find documents without assistance
- Reduction in email requests for document copies

---

### Feature 2: Annual Dues Management 💰
**Priority:** High  
**Status:** Planning  
**Target:** Q1 2025  

#### Purpose
Track annual HOA dues with quarterly proration support for property ownership changes.

#### Requirements
- Annual dues record per property per year
- Quarterly breakdown support
- Automatic proration when property changes hands
- Integration with existing balance tracking
- Historical records by year

#### Technical Implementation

**GraphQL Schema Addition:**
```graphql
type AnnualDue @model
  @auth(rules: [
    { allow: owner, operations: [read] },
    { allow: groups, groups: ["BOARD"], operations: [read] },
    { allow: groups, groups: ["TREASURER", "PRESIDENT"], operations: [create, read, update, delete] }
  ]) {
  id: ID!
  year: Int! @index(name: "byYear", queryField: "annualDuesByYear")
  property: Property @belongsTo(fields: ["propertyId"])
  propertyId: ID! @index(name: "byProperty", queryField: "annualDuesByProperty", sortKeyFields: ["year"])
  annualAmount: Float! # Total annual amount
  q1Amount: Float! # Quarter 1 amount (Jan-Mar)
  q1Paid: Boolean @default(value: "false")
  q1PaidDate: AWSDate
  q1PaidBy: Profile @belongsTo(fields: ["q1PaidById"])
  q1PaidById: ID
  q2Amount: Float! # Quarter 2 amount (Apr-Jun)
  q2Paid: Boolean @default(value: "false")
  q2PaidDate: AWSDate
  q2PaidBy: Profile @belongsTo(fields: ["q2PaidById"])
  q2PaidById: ID
  q3Amount: Float! # Quarter 3 amount (Jul-Sep)
  q3Paid: Boolean @default(value: "false")
  q3PaidDate: AWSDate
  q3PaidBy: Profile @belongsTo(fields: ["q3PaidById"])
  q3PaidById: ID
  q4Amount: Float! # Quarter 4 amount (Oct-Dec)
  q4Paid: Boolean @default(value: "false")
  q4PaidDate: AWSDate
  q4PaidBy: Profile @belongsTo(fields: ["q4PaidById"])
  q4PaidById: ID
  notes: String
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

**Proration Logic:**
- When property changes hands mid-year:
  - Previous owner responsible for quarters prior to sale
  - New owner responsible for quarters after sale
  - Quarter of sale can be split or assigned based on sale date
  
**Components:**
- Annual Dues Manager (Board view)
- Annual Dues Card (Homeowner view on Profile page)
- Proration Calculator utility

#### User Stories
1. As a treasurer, I want to create annual dues records for all properties at year start
2. As a homeowner, I want to see my quarterly due dates and amounts
3. As a treasurer, I want to automatically prorate dues when a property is sold
4. As a board member, I want to see which properties have unpaid quarterly dues

#### Integration Points
- Links to Payment records when dues are paid
- Updates Profile balance
- Generates quarterly invoices

---

### Feature 3: Payment Processing Integration 💳
**Priority:** High  
**Status:** Implemented; production-readiness validation in progress

#### Purpose
Enable online payment collection with fees passed through to the payor.

#### Requirements
- Homeowners can pay online via credit card or ACH
- Processing fees passed to payor
- Fee calculation displayed before payment
- Automatic balance updates after successful payment
- Payment receipt generation
- Failed payment handling
- PCI compliance maintained

#### Technical Implementation

**Architecture:**
```
Frontend (React)
  ↓ Accept.js tokenization
Authorize.Net transaction
  ↓ Webhook
AWS Lambda Function
  ↓ DynamoDB transaction
Payment + Profile balance update
```

**Components:**
- Payment Portal (user-facing)
- Fee Calculator display
- Authorize.Net Accept.js integration
- Payment confirmation page
- Admin dashboard for transaction history

**Backend:**
- Lambda function: `createAuthNetTransaction`
- Lambda function: `handleAuthNetWebhook`
- Lambda function: `reconcileAuthNetPayments`
- Secrets Manager for processor credentials

#### Security Considerations
- Never store card or bank account numbers; use Accept.js opaque tokens
- Store processor credentials only in Secrets Manager
- HTTPS only
- Webhook signature verification
- Audit logging for all transactions

#### User Stories
1. As a homeowner, I want to pay my dues online with a credit card
2. As a homeowner, I want to see the processing fee before confirming payment
3. As a homeowner, I want to choose ACH to save on fees
4. As a treasurer, I want automatic balance updates when online payments succeed
5. As a treasurer, I want to see all online payment transactions in one place

#### Success Metrics
- 60% of homeowners use online payment within 6 months
- Average payment processing time < 2 minutes
- < 1% failed transactions
- Zero PCI compliance violations

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Feature:** Document Library MVP
- Create Document type in GraphQL schema
- Set up S3 bucket for document storage
- Create `/documents` page (public)
- Basic upload/download functionality
- Board member document management

**Deliverables:**
- Working document library page
- Upload interface for board members
- Public access to view/download documents

---

### Phase 2: Financial Infrastructure (Weeks 3-5)
**Feature:** Annual Dues Management
- Create AnnualDue type in GraphQL schema
- Build Annual Dues Manager component (Board)
- Add Annual Dues display to Profile page
- Implement proration calculator
- Create quarterly invoice generation

**Deliverables:**
- Annual dues tracking system
- Proration logic for property transfers
- Board management interface
- Homeowner view of dues status

---

### Phase 3: Payment Integration (Weeks 6-10)
**Feature:** Authorize.Net Payment Processing
- Configure Authorize.Net account and Secrets Manager credentials
- Create Accept.js card and ACH integration
- Build fee calculator
- Implement webhook handlers (Lambda)
- Create payment receipt generation
- Test card and ACH settlement flows in sandbox
- Production deployment

**Deliverables:**
- Working online payment system
- Fee pass-through implementation
- Automatic balance updates
- Payment receipts
- Admin transaction dashboard

---

## Technical Dependencies

### Document Library
- AWS S3 bucket configuration
- CloudFront distribution (optional, for faster delivery)
- GraphQL schema update
- Amplify storage configuration

### Annual Dues
- GraphQL schema update
- New queries/mutations
- Profile page enhancement
- Board tools enhancement

### Payment Processing
- Authorize.Net account setup
- Authorize.Net credentials in AWS Secrets Manager
- AWS Lambda functions
- Webhook endpoint configuration
- Environment variable management

---

## Risk Assessment

### Document Library
**Risk Level:** Low ⚠️
- Well-understood technology (S3)
- Similar to existing features
- Public access is straightforward

**Mitigation:**
- Use existing AWS infrastructure
- Follow established patterns

### Annual Dues
**Risk Level:** Medium ⚠️⚠️
- Complex proration logic
- Data migration for existing properties
- Integration with existing payments

**Mitigation:**
- Extensive testing of proration scenarios
- Clear documentation of business rules
- Gradual rollout with manual verification

### Payment Processing
**Risk Level:** High ⚠️⚠️⚠️
- Financial transactions require high reliability
- PCI compliance requirements
- Fee pass-through calculations must be accurate
- Webhook handling must be robust

**Mitigation:**
- Extensive testing in Authorize.Net sandbox
- Code review for all payment logic
- Comprehensive error handling
- Audit logging
- Gradual rollout (soft launch with board members)
- Clear user documentation

---

## Success Criteria

### Overall Goals
1. ✅ Reduce administrative burden on board members
2. ✅ Improve homeowner self-service capabilities
3. ✅ Increase on-time payment rate
4. ✅ Reduce payment processing costs
5. ✅ Maintain security and data integrity

### Metrics
- **Document Library:** 
  - 50% reduction in document request emails
  - 90% uptime for document access
  
- **Annual Dues:**
  - 100% of properties have accurate dues records
  - Proration calculations verified for accuracy
  - Quarterly payment tracking operational
  
- **Payment Processing:**
  - 60% online payment adoption within 6 months
  - 99.9% payment processing reliability
  - Zero security incidents
  - Average payment time < 2 minutes

---

## Future Enhancements (Backlog)

1. **Mobile App** - Native iOS/Android app for on-the-go access
2. **Automatic Payment Reminders** - Email/SMS reminders for due dates
3. **Recurring Payment Setup** - Auto-pay for monthly/quarterly dues
4. **Financial Reporting Dashboard** - Charts and analytics for treasurer
5. **Maintenance Request System** - Submit and track property issues
6. **Event Management** - Calendar and RSVP for HOA events
7. **Violation Tracking** - CC&R violation documentation and resolution
8. **Vendor Management** - Track contracts and service providers

---

**Last Updated:** October 5, 2025  
**Next Review:** Monthly during active development
