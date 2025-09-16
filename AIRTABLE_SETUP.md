# Airtable Setup Guide for CoactionConnect2

## 🚀 Quick Setup (Single Base Approach)

### 1. Create Airtable Account
1. Go to [Airtable.com](https://airtable.com)
2. Sign up for a free account
3. Go to Account Settings → API to get your API key

### 2. Create Single Base
Create a new base called "CoactionConnect2"

**Tables to create:**

#### Projects Table (Master Table)
- Name (Single line text)
- Project ID (Single line text) - Values: "coaction", "zrmc", "tgmc"
- Description (Long text)
- Status (Single select: Active, Inactive)
- Created Date (Date)

**Add these records:**
- Name: "Coaction", Project ID: "coaction", Status: "Active"
- Name: "Zion Regional Medical Center", Project ID: "zrmc", Status: "Active"  
- Name: "Texas General Medical Center", Project ID: "tgmc", Status: "Active"

#### Logos Table
- Name (Single line text)
- Type (Single select: Main Logo, Secondary Logo, Icon, etc.)
- Format (Single select: PNG, JPG, SVG, PDF)
- Size (Single line text)
- File (Attachment)
- Project (Link to another record → Projects table)
- Uploaded By (Single line text)
- Upload Date (Date)

#### Colors Table
- Name (Single line text)
- Hex Code (Single line text)
- Usage (Single select: Primary, Secondary, Accent, Text, Background)
- Pantone (Single line text)
- Project (Link to another record → Projects table)
- Created Date (Date)

#### Fonts Table
- Name (Single line text)
- Weight (Single line text)
- Usage (Single line text)
- Family (Single line text)
- File (Attachment)
- Project (Link to another record → Projects table)
- Uploaded By (Single line text)

#### Knowledge Files Table
- File Name (Single line text)
- Category (Single select: Policies, Procedures, Training, Resources)
- Tags (Long text)
- File Type (Single select: PDF, DOC, XLS, JPG, MP4)
- File Size (Single line text)
- File (Attachment)
- Project (Link to another record → Projects table)
- Uploaded By (Single line text)
- Upload Date (Date)

#### Social Posts Table
- Content (Long text)
- Platforms (Multiple select: Facebook, Instagram, Twitter, LinkedIn)
- Status (Single select: Draft, Pending, Approved, Scheduled, Published)
- Scheduled Date (Date)
- Publish Date (Date)
- Created By (Single line text)
- Approved By (Single line text)
- Project (Link to another record → Projects table)
- Created Date (Date)

### 3. Get Base ID
1. Go to your base
2. Click "Help" → "API documentation"
3. Copy the Base ID from the URL (starts with "app")

### 4. Update Configuration
Update `src/airtable/config.ts` with your actual values:

```typescript
export const AIRTABLE_API_KEY = 'your-actual-api-key';
export const AIRTABLE_BASE_ID = 'your-base-id';
```

### 5. Environment Variables (Optional)
Create a `.env` file in your project root:

```
REACT_APP_AIRTABLE_API_KEY=your-actual-api-key
REACT_APP_AIRTABLE_BASE_ID=your-base-id
```

## 🎯 Benefits of Single Base Approach

- ✅ **Better Organization** - All related data in one place
- ✅ **Proper Relationships** - Linked tables maintain data integrity
- ✅ **Easier Management** - One base to maintain instead of three
- ✅ **Better Performance** - Fewer API calls needed
- ✅ **Visual Relationships** - See connections between projects and assets
- ✅ **Easier Backup** - One base to backup and restore

## 🔧 Testing

1. **Upload a logo** in Branding Assets
2. **Check Airtable** - should appear in Logos table with Project link
3. **Upload a document** in Knowledge Hub
4. **Check Airtable** - should appear in Knowledge Files table with Project link
5. **Create a social post** in Social Media
6. **Check Airtable** - should appear in Social Posts table with Project link

## 🚨 Troubleshooting

- **API errors**: Check your API key and base ID
- **Missing data**: Verify table names match exactly
- **Upload failures**: Check file size limits in Airtable
- **Permission errors**: Ensure your API key has access to the base
- **Link errors**: Make sure Projects table has the correct Project ID values

## 📞 Need Help?

The single base approach is much cleaner and more maintainable. Once configured, your branding assets will persist automatically with proper project relationships!
