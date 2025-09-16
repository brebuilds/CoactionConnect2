# Airtable Setup Checklist for CoactionConnect2

## ✅ Your Credentials (Configured in .env)
- **API Key**: Set in .env file
- **Base ID**: Set in .env file
- **Base URL**: `https://airtable.com/appraCK4DfN3Kh9jZ/...`

## 📋 Setup Checklist

### 1. Create Tables in Your Base

- [ ] **Projects Table**
  - [ ] Project Name (Single line text)
  - [ ] Description (Long text)
  - [ ] Primary Color (Single line text)
  - [ ] Main Logo (Attachment)
  - [ ] Attachments (Attachment)
  - [ ] Logos (Link to another record → Logos table)
  - [ ] Colors (Link to another record → Colors table)
  - [ ] Fonts (Link to another record → Fonts table)
  - [ ] Knowledge (Link to another record → Knowledge Files table)
  - [ ] Social Posts (Link to another record → Social Posts table)

- [ ] **Logos Table**
  - [ ] Logo Name (Single line text)
  - [ ] Type (Single select: Main Logo, Secondary Logo, Icon, etc.)
  - [ ] Size (Single line text)
  - [ ] File (Attachment)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Format (Single select: PNG, JPG, SVG, PDF)
  - [ ] Uploaded by (Single line text)
  - [ ] Upload Date (Date)

- [ ] **Colors Table**
  - [ ] Color Name (Single line text)
  - [ ] Hex Code (Single line text)
  - [ ] Usage (Single select: Primary, Secondary, Accent, Text, Background)
  - [ ] Pantone (Single line text)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Created Date (Date)

- [ ] **Fonts Table**
  - [ ] Font Name (Single line text)
  - [ ] Attachments (Attachment)
  - [ ] Weight (Single line text)
  - [ ] Usage (Single line text)
  - [ ] Family (Single line text)
  - [ ] File (Attachment)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Uploaded By (Single line text)

- [ ] **Knowledge Files Table**
  - [ ] File Name (Single line text)
  - [ ] Category (Single select: Policies, Procedures, Training, Resources)
  - [ ] Uploaded by (Single line text)
  - [ ] Upload Date (Date)
  - [ ] Tags (Long text)
  - [ ] File Type (Single select: PDF, DOC, XLS, JPG, MP4)
  - [ ] File Size (Single line text)
  - [ ] File (Attachment)
  - [ ] Project (Link to another record → Projects table)

- [ ] **Social Posts Table**
  - [ ] Content (Long text)
  - [ ] Platforms (Multiple select: Facebook, Instagram, Twitter, LinkedIn)
  - [ ] Status (Single select: Draft, Pending, Approved, Scheduled, Published)
  - [ ] Attachments (Attachment)
  - [ ] Scheduled Date (Date)
  - [ ] Publish Date (Date)
  - [ ] Created By (Single line text)
  - [ ] Approved By (Single line text)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Created (Date)

### 2. Add Project Records
- [ ] **Coaction Project**
  - Project Name: "Coaction"
  - Description: "Main Coaction project"
  - Status: "Active"

- [ ] **ZRMC Project**
  - Project Name: "Zion Regional Medical Center"
  - Description: "ZRMC client project"
  - Status: "Active"

- [ ] **TGMC Project**
  - Project Name: "Texas General Medical Center"
  - Description: "TGMC client project"
  - Status: "Active"

### 3. Test Connection
- [ ] Open browser console
- [ ] Copy and paste the contents of `test-airtable.js`
- [ ] Run the test to verify connection and table setup

### 4. Test App Integration
- [ ] Start your app: `npm start`
- [ ] Upload a logo in Branding Assets
- [ ] Check Airtable to see if it appears in Logos table
- [ ] Upload a document in Knowledge Hub
- [ ] Check Airtable to see if it appears in Knowledge Files table

## 🎯 Success Indicators
- ✅ All 6 tables created with correct field names
- ✅ Project links working in all tables
- ✅ Test script shows "Connection successful!"
- ✅ Uploads from app appear in Airtable
- ✅ Data is properly linked to projects

## 🚨 Troubleshooting
- **API errors**: Check your API key and base ID in .env file
- **Missing tables**: Verify table names match exactly
- **Field name errors**: Ensure field names match the checklist above
- **Link errors**: Make sure Projects table has correct Project Name values
- **Upload failures**: Check file size limits in Airtable
