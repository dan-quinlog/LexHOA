# Document Library - Testing Guide

## ✅ Implementation Complete!

The Document Library feature is now fully implemented and ready for testing.

---

## What Was Built

### Backend
✅ GraphQL schema with Document type  
✅ 6 access levels (PUBLIC, AUTHENTICATED, OWNERS_ONLY, BOARD_ONLY, TREASURER_ONLY, PRESIDENT_ONLY)  
✅ 8 document categories  
✅ S3 storage bucket configured  
✅ Deployed to AWS

### Frontend
✅ Public Documents page (`/documents`)  
✅ Board Document Manager (Board Tools > Documents)  
✅ Document upload modal with drag & drop  
✅ Access level filtering  
✅ Category organization  
✅ Search functionality  
✅ Mobile responsive design

---

## How to Test

### Test 1: Upload Your Insurance Policy (Board Member)

1. **Log in** as a board member (President, Secretary, or Treasurer)

2. **Navigate to Board Tools** > Documents

3. **Click "Upload Document"**

4. **Fill out the form:**
   - Title: `2025 HOA Insurance Policy`
   - Description: `Comprehensive insurance coverage for Lexington Commons HOA`
   - Category: `Insurance`
   - Access Level: Choose one:
     - `PUBLIC` - Anyone can view (even non-logged-in visitors)
     - `AUTHENTICATED` - Only logged-in users
     - `OWNERS_ONLY` - Only property owners
     - `BOARD_ONLY` - Only board members
   - Year: `2025`
   - Display Order: `0` (appears first)

5. **Select your PDF file**

6. **Click "Upload"**

7. **Wait for progress** - You'll see a progress bar

8. **Success!** - You should see a success message

### Test 2: View Document as Public User

1. **Log out** (or open incognito window)

2. **Navigate to Documents page** - Click "Documents" in navigation

3. **You should see:**
   - Your uploaded document (if access level was PUBLIC)
   - Organized by category
   - Download button

4. **Click Download** - PDF should open or download

### Test 3: Access Level Testing

**Upload 3 test documents with different access levels:**

1. **Document A** - Access Level: PUBLIC
   - Log out → Should be visible

2. **Document B** - Access Level: AUTHENTICATED
   - Log out → Should NOT be visible
   - Log in as any user → Should be visible

3. **Document C** - Access Level: BOARD_ONLY
   - Log in as owner (non-board) → Should NOT be visible
   - Log in as board member → Should be visible

---

## Features to Test

### Public Documents Page

- [ ] Navigate to `/documents` without logging in
- [ ] See PUBLIC documents
- [ ] Download a document
- [ ] Search for documents by title
- [ ] Filter by category
- [ ] View on mobile device (responsive)

### Board Document Manager

- [ ] Upload new document
- [ ] Edit document metadata
- [ ] Archive a document
- [ ] Delete a document (with confirmation)
- [ ] Filter documents by category
- [ ] See upload date and uploader name

### Upload Modal

- [ ] Select PDF file
- [ ] See file size and name
- [ ] See upload progress bar
- [ ] Get error for file >25MB
- [ ] Get error for invalid file type (try uploading a .txt file)
- [ ] Cancel upload

### Access Levels

- [ ] PUBLIC - Visible to everyone
- [ ] AUTHENTICATED - Visible to logged-in users only
- [ ] OWNERS_ONLY - Visible to property owners (and board)
- [ ] BOARD_ONLY - Visible to board members only
- [ ] TREASURER_ONLY - Visible to Treasurer and President
- [ ] PRESIDENT_ONLY - Visible to President only

---

## Expected File Types

**Allowed:**
- ✅ PDF (`.pdf`)
- ✅ Microsoft Word (`.doc`, `.docx`)
- ✅ Microsoft Excel (`.xls`, `.xlsx`)

**Rejected:**
- ❌ Images (`.jpg`, `.png`)
- ❌ Text files (`.txt`)
- ❌ Other formats

**Max File Size:** 25MB

---

## Common Issues & Solutions

### Issue: Can't see uploaded document
**Solution:**
- Check access level - Are you logged in with the right permissions?
- Check if document is archived
- Refresh the page

### Issue: Upload fails
**Solution:**
- Check file size (must be < 25MB)
- Check file type (PDF, DOC, DOCX, XLS, XLSX only)
- Check internet connection
- Check browser console for errors

### Issue: Download doesn't work
**Solution:**
- Check browser popup blocker
- Check if S3 URL is valid
- Try again (signed URLs expire after 15 minutes)

---

## What Happens When You Upload?

1. **Frontend validates** file type and size
2. **File uploads to S3** with progress tracking
3. **Metadata saves to DynamoDB** via GraphQL
4. **Document appears** in both:
   - Public Documents page (if access level allows)
   - Board Document Manager

---

## Access Level Recommendations

### Insurance Policy
**Recommended:** `OWNERS_ONLY`  
**Reason:** Property owners need this info, but it contains sensitive details (coverage limits, etc.)

Alternative: `PUBLIC` if you want prospective buyers to see it

### Bylaws & CC&Rs
**Recommended:** `PUBLIC`  
**Reason:** Transparency, prospective buyers need to review

### Meeting Minutes
**Recommended:** `AUTHENTICATED`  
**Reason:** Residents should see them, but keep some privacy from public

### Financial Reports
**Recommended:** `OWNERS_ONLY`  
**Reason:** Owners have right to see finances, but keep details private

### Board Strategy Documents
**Recommended:** `BOARD_ONLY`  
**Reason:** Internal board discussions

### Bank Statements
**Recommended:** `TREASURER_ONLY`  
**Reason:** Highly sensitive financial data

---

## Next Steps After Testing

1. **Upload real documents:**
   - Insurance policy
   - Bylaws
   - CC&Rs
   - Recent meeting minutes

2. **Test on mobile devices**

3. **Get feedback from other board members**

4. **Announce to homeowners** that documents are now available online

---

## Build Status

✅ Build successful  
✅ No errors  
✅ Only ESLint warnings (pre-existing)

**Bundle Size:**
- Main JS: 378.67 KB (gzipped) - increased by 16.82 KB for document features
- Main CSS: 9.97 KB (gzipped) - increased by 685 bytes

**Ready for production!**

---

## Need Help?

If you encounter issues:
1. Check browser console (F12) for errors
2. Check network tab for failed requests
3. Verify AWS Amplify deployment succeeded
4. Check S3 bucket permissions

---

**Created:** October 5, 2025  
**Status:** Ready for Testing  
**Branch:** feature/document-library
