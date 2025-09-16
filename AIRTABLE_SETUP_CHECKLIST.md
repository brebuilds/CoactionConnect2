# Airtable Setup Checklist for CoactionConnect2

## ✅ Your Credentials (Configured in .env)
- **API Key**: Set in .env file
- **Base ID**: Set in .env file
- **Base URL**: `https://airtable.com/appraCK4DfN3Kh9jZ/...`

## 📋 Setup Checklist

### 1. Create Tables in Your Base
- [ ] **Projects Table**
  - [ ] Name (Single line text)
  - [ ] Project ID (Single line text) - Values: "coaction", "zrmc", "tgmc"
  - [ ] Description (Long text)
  - [ ] Status (Single select: Active, Inactive)
  - [ ] Created Date (Date)

- [ ] **Logos Table**
  - [ ] Name (Single line text)
  - [ ] Type (Single select: Main Logo, Secondary Logo, Icon, etc.)
  - [ ] Format (Single select: PNG, JPG, SVG, PDF)
  - [ ] Size (Single line text)
  - [ ] File (Attachment)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Uploaded By (Single line text)
  - [ ] Upload Date (Date)

- [ ] **Colors Table**
  - [ ] Name (Single line text)
  - [ ] Hex Code (Single line text)
  - [ ] Usage (Single select: Primary, Secondary, Accent, Text, Background)
  - [ ] Pantone (Single line text)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Created Date (Date)

- [ ] **Fonts Table**
  - [ ] Name (Single line text)
  - [ ] Weight (Single line text)
  - [ ] Usage (Single line text)
  - [ ] Family (Single line text)
  - [ ] File (Attachment)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Uploaded By (Single line text)

- [ ] **Knowledge Files Table**
  - [ ] File Name (Single line text)
  - [ ] Category (Single select: Policies, Procedures, Training, Resources)
  - [ ] Tags (Long text)
  - [ ] File Type (Single select: PDF, DOC, XLS, JPG, MP4)
  - [ ] File Size (Single line text)
  - [ ] File (Attachment)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Uploaded By (Single line text)
  - [ ] Upload Date (Date)

- [ ] **Social Posts Table**
  - [ ] Content (Long text)
  - [ ] Platforms (Multiple select: Facebook, Instagram, Twitter, LinkedIn)
  - [ ] Status (Single select: Draft, Pending, Approved, Scheduled, Published)
  - [ ] Scheduled Date (Date)
  - [ ] Publish Date (Date)
  - [ ] Created By (Single line text)
  - [ ] Approved By (Single line text)
  - [ ] Project (Link to another record → Projects table)
  - [ ] Created Date (Date)

### 2. Add Project Records
- [ ] **Coaction Project**
  - Name: "Coaction"
  - Project ID: "coaction"
  - Status: "Active"
  - Description: "Main Coaction project"

- [ ] **ZRMC Project**
  - Name: "Zion Regional Medical Center"
  - Project ID: "zrmc"
  - Status: "Active"
  - Description: "ZRMC client project"

- [ ] **TGMC Project**
  - Name: "Texas General Medical Center"
  - Project ID: "tgmc"
  - Status: "Active"
  - Description: "TGMC client project"

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
- ✅ All 6 tables created with correct field types
- ✅ Project links working in all tables
- ✅ Test script shows "Connection successful!"
- ✅ Uploads from app appear in Airtable
- ✅ Data is properly linked to projects

## 🚨 Troubleshooting
- **API errors**: Check your API key and base ID in .env file
- **Missing tables**: Verify table names match exactly
- **Link errors**: Make sure Projects table has correct Project ID values
- **Upload failures**: Check file size limits in Airtable
