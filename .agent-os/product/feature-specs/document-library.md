# Feature Specification: Document Library

## Overview
A public-facing document library for Lexington Commons HOA to provide residents and homeowners access to important HOA documents.

---

## User Personas

### Primary Users
1. **Homeowners** - Need access to bylaws, policies, insurance info
2. **Prospective Buyers** - Want to review HOA documents before purchase
3. **Board Members** - Need to upload and manage documents

---

## User Stories

### As a Homeowner:
- I want to view the HOA bylaws without logging in
- I want to download the current insurance policy
- I want to access historical meeting minutes
- I want to find documents easily by category

### As a Board Member:
- I want to upload new documents
- I want to organize documents into categories
- I want to replace outdated documents
- I want to delete documents that are no longer relevant
- I want to track when documents were last updated

### As a Prospective Buyer:
- I want to access CC&Rs before purchasing in the community
- I want to understand HOA fees and assessments
- I want to review financial health documents

---

## Functional Requirements

### FR-1: Document Categories
**Priority:** Must Have

Categories to include:
- **Bylaws & CC&Rs** - Governing documents
- **Insurance** - HOA insurance policies
- **Meeting Minutes** - Board meeting minutes
- **Financial Reports** - Annual budgets, financial statements
- **Policies & Procedures** - HOA policies and guidelines
- **Forms** - Request forms, applications
- **Other** - Miscellaneous documents

### FR-2: Public Access
**Priority:** Must Have

- All documents accessible without authentication
- No sign-in required to view or download
- Mobile-responsive interface
- Fast loading times (< 2 seconds)

### FR-3: Document Management (Board Only)
**Priority:** Must Have

Board members can:
- Upload documents (PDF, DOC, DOCX, XLS, XLSX)
- Assign documents to categories
- Add document title and description
- Set document upload date
- Replace existing documents (versioning)
- Delete documents
- Reorder documents within categories

### FR-4: Search & Filter
**Priority:** Should Have

- Search by document title
- Filter by category
- Sort by date (newest/oldest)
- Filter by year (for meeting minutes)

### FR-5: Document Preview
**Priority:** Nice to Have

- In-browser PDF preview
- Download button for all file types
- File size display
- Upload date display

---

## Technical Requirements

### TR-1: Storage
- AWS S3 bucket for document storage
- CloudFront CDN for fast delivery (optional Phase 2)
- Public read access via signed URLs or public bucket policy
- Separate folders by category for organization

### TR-2: Database Schema
```graphql
type Document @model
  @auth(
    rules: [
      { allow: public, provider: apiKey, operations: [read] },
      { allow: private, provider: userPools, operations: [read] },
      { allow: groups, groups: ["BOARD", "PRESIDENT"], operations: [create, read, update, delete] }
    ]
  ) {
  id: ID!
  title: String!
  description: String
  category: DocumentCategory!
  fileName: String!
  fileSize: Int # in bytes
  fileType: String! # MIME type
  s3Key: String! # S3 object key
  s3Url: String # CloudFront or S3 URL
  uploadedBy: Profile @belongsTo(fields: ["uploadedById"])
  uploadedById: ID
  displayOrder: Int @default(value: "0")
  year: Int # For filtering meeting minutes by year
  type: String @default(value: "DOCUMENT")
    @index(
      name: "documentsByDate"
      queryField: "documentsByDate"
      sortKeyFields: ["createdAt"]
    )
  categoryIndex: String
    @index(
      name: "documentsByCategory"
      queryField: "documentsByCategory"
      sortKeyFields: ["displayOrder", "createdAt"]
    )
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

enum DocumentCategory {
  BYLAWS_CCRS
  INSURANCE
  MEETING_MINUTES
  FINANCIAL_REPORTS
  POLICIES
  FORMS
  OTHER
}
```

### TR-3: File Upload
- Maximum file size: 25MB
- Supported formats: PDF, DOC, DOCX, XLS, XLSX
- Virus scanning (AWS S3 bucket scanning)
- Automatic file name sanitization
- Unique file naming to prevent conflicts

### TR-4: Security
- Public documents stored in dedicated S3 bucket
- No sensitive/confidential information
- Board-only documents in separate system (future)
- HTTPS only for all access
- Content-Type headers properly set

---

## UI/UX Design

### Public Documents Page (`/documents`)

**Layout:**
```
+------------------------------------------+
|  Header: Lexington Commons HOA           |
|  Nav: Home | Amenities | Documents | ... |
+------------------------------------------+
|                                          |
|  📄 HOA Documents                        |
|                                          |
|  [Search Box]          [Category Filter] |
|                                          |
|  Bylaws & CC&Rs                         |
|  ├─ HOA Bylaws (Updated: Jan 2025)      |
|  │  [View PDF] [Download] 245 KB        |
|  ├─ CC&Rs - Revised 2024                |
|  │  [View PDF] [Download] 1.2 MB        |
|                                          |
|  Insurance                               |
|  ├─ 2025 Insurance Policy                |
|  │  [View PDF] [Download] 856 KB        |
|                                          |
|  Meeting Minutes                         |
|  ├─ January 2025 Board Meeting          |
|  │  [View PDF] [Download] 124 KB        |
|  ...                                     |
+------------------------------------------+
```

### Board Document Manager (Board Tools)

**Layout:**
```
+------------------------------------------+
|  Document Manager                        |
|  [+ Upload New Document]                 |
+------------------------------------------+
|  Category: [All ▼]  Sort: [Date ▼]      |
|                                          |
|  Document List:                          |
|  +--------------------------------------+|
|  | HOA Bylaws                          ||
|  | Category: Bylaws & CC&Rs            ||
|  | Uploaded: Jan 15, 2025 by John Doe  ||
|  | Size: 245 KB                        ||
|  | [Edit] [Replace] [Delete]           ||
|  +--------------------------------------+|
|  | 2025 Insurance Policy               ||
|  | Category: Insurance                 ||
|  | ...                                 ||
+------------------------------------------+
```

### Upload Modal

**Fields:**
- Document Title* (required)
- Description (optional, textarea)
- Category* (dropdown)
- Year (optional, for meeting minutes)
- File Upload* (drag & drop or browse)
- Display Order (optional, number)

**Validation:**
- Title: 3-100 characters
- Category: Must select
- File: Required, max 25MB, allowed types only

---

## User Flows

### Flow 1: Homeowner Views Document
1. Navigate to Documents page (no login required)
2. Scroll or filter to find desired category
3. Click "View PDF" or "Download"
4. Document opens in browser or downloads

### Flow 2: Board Member Uploads Document
1. Log in as Board member
2. Navigate to Board Tools > Documents
3. Click "Upload New Document"
4. Fill out form (title, category, description, file)
5. Submit
6. Document uploaded to S3
7. Document metadata saved to DynamoDB
8. Success message displayed
9. Document appears on public Documents page

### Flow 3: Board Member Replaces Document
1. Navigate to Document Manager
2. Find document to replace
3. Click "Replace"
4. Upload new file
5. Old file archived or deleted from S3
6. New file takes its place
7. updatedAt timestamp refreshed

---

## Acceptance Criteria

### AC-1: Public Access
- [ ] Documents page accessible at /documents without authentication
- [ ] All document categories displayed
- [ ] Documents load within 2 seconds
- [ ] Mobile responsive (works on phones/tablets)

### AC-2: Document Display
- [ ] Documents organized by category
- [ ] Document title, date, size displayed
- [ ] View and Download buttons functional
- [ ] PDFs open in browser, other files download

### AC-3: Board Upload
- [ ] Board members see "Upload" button
- [ ] Upload form validates inputs
- [ ] File size validation (max 25MB)
- [ ] File type validation (PDF, DOC, etc.)
- [ ] Success/error messages shown

### AC-4: Board Management
- [ ] Board members can edit document metadata
- [ ] Board members can replace documents
- [ ] Board members can delete documents
- [ ] Deleted documents removed from S3 and database

### AC-5: Search & Filter
- [ ] Search by document title works
- [ ] Category filter works
- [ ] Results update without page reload

---

## Testing Plan

### Unit Tests
- Document upload validation
- File type checking
- File size validation
- Category assignment
- S3 upload function

### Integration Tests
- Upload document → S3 → DynamoDB flow
- Delete document → remove from S3 and DB
- Public access retrieval
- Board authorization checks

### E2E Tests
1. Public user views and downloads document
2. Board member uploads new document
3. Board member replaces existing document
4. Board member deletes document
5. Search finds correct documents
6. Category filter shows correct subset

### Manual Testing
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile (iOS Safari, Android Chrome)
- Test different file types (PDF, DOC, DOCX, XLS, XLSX)
- Test large files (near 25MB limit)
- Test invalid file types (should reject)

---

## Performance Requirements

- Page load: < 2 seconds
- Document download start: < 500ms
- Upload time: Varies by file size, show progress bar
- Search response: < 300ms
- S3 URL generation: < 100ms

---

## Accessibility

- WCAG 2.1 AA compliance
- Screen reader friendly
- Keyboard navigation support
- Alt text for icons
- Proper heading hierarchy
- Color contrast ratios met

---

## Dependencies

### External
- AWS S3 bucket (new or existing)
- AWS Amplify Storage configuration
- CloudFront (optional, for faster delivery)

### Internal
- GraphQL schema update
- Board authentication (already exists)
- Profile/user system (already exists)

---

## Risks & Mitigations

### Risk: Large File Uploads
**Impact:** Slow, may timeout  
**Mitigation:** 
- Enforce 25MB limit
- Show upload progress bar
- Use S3 multipart upload for large files
- Provide guidance on optimizing PDFs

### Risk: Inappropriate Content Upload
**Impact:** Reputation, legal  
**Mitigation:**
- Board-only upload access
- Audit log of all uploads
- Board review process before publishing (optional)

### Risk: S3 Costs
**Impact:** Budget  
**Mitigation:**
- Monitor storage usage monthly
- Set lifecycle rules to archive old versions
- Estimate: ~100 documents × 500KB avg = 50MB (~$0.01/month)

---

## Rollout Plan

### Phase 1: MVP (Week 1-2)
- Basic document upload by board
- Public viewing/downloading
- Category organization
- PDF support only

### Phase 2: Enhancements (Week 3)
- Search functionality
- Filter by category
- Support additional file types (DOC, XLS)
- Upload progress indicator

### Phase 3: Polish (Week 4)
- In-browser PDF preview
- CloudFront CDN integration
- Year filtering for meeting minutes
- Display order customization

---

## Success Metrics

### Quantitative
- 50% reduction in document request emails within 30 days
- 90% uptime for document access
- < 2 second page load time
- 80% of homeowners access documents within first 60 days

### Qualitative
- Positive feedback from homeowners
- Board members find upload process intuitive
- Reduction in "where can I find..." support requests

---

**Created:** October 5, 2025  
**Status:** Planning  
**Owner:** Development Team
