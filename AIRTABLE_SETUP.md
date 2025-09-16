# Airtable Setup Guide for CoactionConnect2

## 🚀 Quick Setup

### 1. Create Airtable Account
1. Go to [Airtable.com](https://airtable.com)
2. Sign up for a free account
3. Go to Account Settings → API to get your API key

### 2. Create Three Bases

#### Base 1: Branding Assets
Create a new base called "CoactionConnect Branding Assets"

**Tables to create:**

**Logos Table:**
- Name (Single line text)
- Type (Single select: Main Logo, Secondary Logo, Icon, etc.)
- Format (Single select: PNG, JPG, SVG, PDF)
- Size (Single line text)
- File (Attachment)
- Project (Single select: Coaction, ZRMC, TGMC)
- Uploaded By (Single line text)
- Upload Date (Date)

**Colors Table:**
- Name (Single line text)
- Hex Code (Single line text)
- Usage (Single select: Primary, Secondary, Accent, Text, Background)
- Pantone (Single line text)
- Project (Single select: Coaction, ZRMC, TGMC)
- Created Date (Date)

**Fonts Table:**
- Name (Single line text)
- Weight (Single line text)
- Usage (Single line text)
- Family (Single line text)
- File (Attachment)
- Project (Single select: Coaction, ZRMC, TGMC)
- Uploaded By (Single line text)

#### Base 2: Knowledge Hub
Create a new base called "CoactionConnect Knowledge Hub"

**Knowledge Files Table:**
- File Name (Single line text)
- Category (Single select: Policies, Procedures, Training, Resources)
- Tags (Long text)
- File Type (Single select: PDF, DOC, XLS, JPG, MP4)
- File Size (Single line text)
- File (Attachment)
- Project (Single select: Coaction, ZRMC, TGMC)
- Uploaded By (Single line text)
- Upload Date (Date)

#### Base 3: Social Media
Create a new base called "CoactionConnect Social Media"

**Social Posts Table:**
- Content (Long text)
- Platforms (Multiple select: Facebook, Instagram, Twitter, LinkedIn)
- Status (Single select: Draft, Pending, Approved, Scheduled, Published)
- Scheduled Date (Date)
- Publish Date (Date)
- Created By (Single line text)
- Approved By (Single line text)
- Project (Single select: Coaction, ZRMC, TGMC)
- Created Date (Date)

### 3. Get Base IDs
1. Go to each base
2. Click "Help" → "API documentation"
3. Copy the Base ID from the URL (starts with "app")

### 4. Update Configuration
Update `src/airtable/config.ts` with your actual values:

```typescript
export const AIRTABLE_API_KEY = 'your-actual-api-key';
export const AIRTABLE_BASES = {
  branding: 'your-branding-base-id',
  knowledge: 'your-knowledge-base-id', 
  social: 'your-social-base-id'
};
```

### 5. Environment Variables (Optional)
Create a `.env` file in your project root:

```
REACT_APP_AIRTABLE_API_KEY=your-actual-api-key
REACT_APP_AIRTABLE_BRANDING_BASE=your-branding-base-id
REACT_APP_AIRTABLE_KNOWLEDGE_BASE=your-knowledge-base-id
REACT_APP_AIRTABLE_SOCIAL_BASE=your-social-base-id
```

## 🎯 What This Gives You

- ✅ **No database setup** - Airtable handles everything
- ✅ **Visual interface** - See your data in Airtable
- ✅ **Built-in collaboration** - Team members can edit directly
- ✅ **File storage** - Attachments for logos, fonts, documents
- ✅ **Project isolation** - Each project has its own data
- ✅ **Free tier** - Generous limits for small teams
- ✅ **API integration** - Your app connects seamlessly

## 🔧 Testing

1. **Upload a logo** in Branding Assets
2. **Check Airtable** - should appear in your Logos table
3. **Upload a document** in Knowledge Hub
4. **Check Airtable** - should appear in your Knowledge Files table
5. **Create a social post** in Social Media
6. **Check Airtable** - should appear in your Social Posts table

## 🚨 Troubleshooting

- **API errors**: Check your API key and base IDs
- **Missing data**: Verify table names match exactly
- **Upload failures**: Check file size limits in Airtable
- **Permission errors**: Ensure your API key has access to all bases

## 📞 Need Help?

The Airtable setup is much simpler than Supabase/Firebase. Once configured, your branding assets will persist automatically!
