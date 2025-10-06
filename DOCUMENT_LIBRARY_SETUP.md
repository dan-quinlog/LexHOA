# Document Library Setup Guide

## Current Status

✅ Feature branch created: `feature/document-library`  
✅ GraphQL schema updated with Document type  
⏳ **Next: Deploy schema to AWS Amplify**

---

## Step 1: Deploy GraphQL Schema to AWS

You need to run Amplify commands to deploy the new Document type to your AWS backend.

### Commands to Run:

```bash
cd C:\outterspacebar\LexHOA\LexHOA
amplify push
```

### What This Does:
- Creates the Document table in DynamoDB
- Sets up GraphQL resolvers for Document queries/mutations
- Configures authorization rules for different access levels
- Updates your API

### Expected Prompts:
```
? Do you want to generate code for your newly created GraphQL API? Yes
? Choose the code generation language target: javascript
? Enter the file name pattern of graphql queries, mutations and subscriptions: src/graphql/**/*.js
? Do you want to generate/update all possible GraphQL operations? Yes
? Enter maximum statement depth: 2
```

**Answer "Yes" to all** - This will update the auto-generated GraphQL files in `src/graphql/`

### Important Notes:
- This will take 5-10 minutes
- You'll see CloudFormation updates in progress
- The auto-generated files in `src/graphql/` will be updated (we don't use these, but let it generate them)
- Our actual queries will go in `src/queries/`

---

## Step 2: Configure S3 Storage for Documents

After schema deployment, we need to configure S3 storage.

### Option A: Add Storage via Amplify CLI (Recommended)

```bash
amplify add storage
```

**Prompts and Answers:**
```
? Select from one of the below mentioned services: Content (Images, audio, video, etc.)
? Provide a friendly name for your resource: hoaDocuments
? Provide bucket name: lexhoa-documents-<unique-id>
? Who should have access: Auth and guest users
? What kind of access do you want for Authenticated users? create/update, read, delete
? What kind of access do you want for Guest users? read
```

Then push the storage configuration:
```bash
amplify push
```

### Option B: Use Existing S3 Bucket

If you want to use an existing S3 bucket, we'll need to:
1. Update Amplify configuration manually
2. Configure bucket permissions
3. Update CORS settings

**Let me know which option you prefer.**

---

## Step 3: Create GraphQL Queries/Mutations

Once Amplify deployment is complete, I'll create the queries in `src/queries/` for:

### Queries:
- `LIST_DOCUMENTS` - Get all documents (filtered by access level)
- `GET_DOCUMENT` - Get single document by ID
- `DOCUMENTS_BY_CATEGORY` - Get documents by category
- `DOCUMENTS_BY_ACCESS_LEVEL` - Get documents by access level

### Mutations:
- `CREATE_DOCUMENT` - Upload new document metadata
- `UPDATE_DOCUMENT` - Update document metadata
- `DELETE_DOCUMENT` - Delete document (mark as archived)

---

## Step 4: Build Frontend Components

After backend is ready, we'll build:

1. **Public Documents Page** (`src/pages/public/Documents.js`)
   - Displays public and accessible documents
   - Filters by category
   - Download buttons
   - PDF preview (optional)

2. **Document Manager** (`src/components/board/DocumentManager.js`)
   - Board-only upload interface
   - Document list with edit/delete
   - Access level selector
   - Category assignment

3. **Document Upload Modal** (`src/components/modals/DocumentUploadModal.js`)
   - File upload with drag & drop
   - Metadata form (title, description, category, access level)
   - Progress indicator
   - Validation

---

## Access Level Logic

The Document model supports these access levels:

### PUBLIC
- **Who can see:** Everyone (even non-logged-in visitors)
- **Examples:** HOA Bylaws, CC&Rs, General Policies
- **Use for:** Information prospective buyers might need

### AUTHENTICATED
- **Who can see:** Any logged-in user (residents, owners, board)
- **Examples:** Meeting Minutes, Community Guidelines
- **Use for:** Resident-only information

### OWNERS_ONLY
- **Who can see:** Property owners only
- **Examples:** Financial Reports, Budget Documents
- **Use for:** Information specific to property ownership

### BOARD_ONLY
- **Who can see:** Board members only
- **Examples:** Executive session minutes, Board strategy docs
- **Use for:** Internal board discussions

### TREASURER_ONLY
- **Who can see:** Treasurer and President
- **Examples:** Bank statements, detailed financial records
- **Use for:** Sensitive financial data

### PRESIDENT_ONLY
- **Who can see:** President only
- **Examples:** Legal documents, sensitive contracts
- **Use for:** Highest sensitivity documents

---

## Security Considerations

### Authorization Checks
The GraphQL schema enforces authorization at the API level:
- Public documents accessible via API Key (no auth)
- Other documents require proper Cognito group membership
- Frontend will filter documents based on user's access level

### S3 Security
- Documents stored in S3 with private access
- Signed URLs generated for authenticated downloads
- URLs expire after set time (default 15 minutes)
- No direct public S3 access (goes through GraphQL)

### Upload Security
- Only Board members (PRESIDENT, SECRETARY, TREASURER) can upload
- File type validation (PDF, DOC, DOCX, XLS, XLSX only)
- File size limit (25MB)
- Virus scanning via AWS (optional but recommended)

---

## Current Schema Details

### Document Type Fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Unique identifier |
| `title` | String! | Document title |
| `description` | String | Optional description |
| `category` | DocumentCategory! | Category enum |
| `accessLevel` | DocumentAccessLevel! | Who can access (default: PUBLIC) |
| `fileName` | String! | Original filename |
| `fileSize` | Int | Size in bytes |
| `fileType` | String! | MIME type |
| `s3Key` | String! | S3 object key |
| `s3Url` | String | CloudFront/S3 URL |
| `uploadedById` | ID | Who uploaded |
| `displayOrder` | Int | Sort order (default: 0) |
| `year` | Int | Year for meeting minutes |
| `isArchived` | Boolean | Soft delete (default: false) |
| `createdAt` | AWSDateTime! | Upload timestamp |
| `updatedAt` | AWSDateTime! | Last update timestamp |

### Categories:
- `BYLAWS_CCRS` - Bylaws and CC&Rs
- `INSURANCE` - Insurance policies (your current use case)
- `MEETING_MINUTES` - Board meeting minutes
- `FINANCIAL_REPORTS` - Financial documents
- `POLICIES` - HOA policies and procedures
- `FORMS` - Request forms, applications
- `BOARD_ONLY` - Board-only documents
- `OTHER` - Miscellaneous

---

## Next Actions Required

**I need you to:**

1. ✅ Review this setup guide
2. ⏳ Run `amplify push` to deploy the Document schema
3. ⏳ Decide on storage option (add new S3 or use existing)
4. ⏳ Run storage configuration commands
5. ⏳ Let me know when backend deployment is complete

**Then I will:**

1. Create GraphQL queries in `src/queries/documents.js`
2. Build the public Documents page
3. Build the Board document manager
4. Create upload modal component
5. Integrate with S3 for file storage
6. Test with your insurance policy PDF

---

## Estimated Timeline

- Backend deployment (Steps 1-2): **30 minutes** (mostly waiting for AWS)
- Frontend development (Step 3-4): **4-6 hours** (me working)
- Testing and refinement: **1-2 hours**

**Total: ~1 day of development**

---

## Insurance Policy Upload

Once everything is ready, uploading your insurance policy will be:

1. Log in as Board member
2. Navigate to Board Tools > Documents
3. Click "Upload Document"
4. Fill out:
   - Title: "2025 HOA Insurance Policy"
   - Description: "Comprehensive HOA insurance coverage for 2025"
   - Category: Insurance
   - Access Level: **OWNERS_ONLY** (or PUBLIC if you want everyone to see it)
   - Year: 2025
5. Select PDF file
6. Upload

Then homeowners can access it from the Documents page!

---

## Questions to Answer

Before proceeding, please confirm:

1. **Storage Preference:** New S3 bucket via Amplify CLI or use existing bucket?
2. **Insurance Policy Access:** Should it be PUBLIC or OWNERS_ONLY?
3. **Default Document Access:** Should new documents default to PUBLIC or AUTHENTICATED?
4. **PDF Preview:** Do you want in-browser PDF preview or just download?

---

**Status:** Waiting for `amplify push` deployment  
**Next Update:** After backend is ready, I'll build the frontend
