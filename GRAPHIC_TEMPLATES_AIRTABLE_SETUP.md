# Graphic Templates Airtable Setup

## 📋 New Table: Graphic Templates

Add this table to your existing CoactionConnect2 Airtable base.

### Table Fields

| Field Name | Field Type | Options/Settings | Required |
|------------|-----------|------------------|----------|
| Template Name | Single line text | - | ✅ Yes |
| Category | Single select | Social Posts, Stories, Quotes, Announcements, Testimonials, Events, Health Tips, Promotions | ✅ Yes |
| Image URL | URL | - | ✅ Yes |
| Dimensions | Single line text | Examples: "1080x1080", "1080x1920" | ❌ No |
| Tags | Long text | Comma-separated values | ❌ No |
| Project | Link to another record | → Links to **Projects** table | ✅ Yes |
| Uploaded By | Single line text | - | ✅ Yes |
| Upload Date | Date | Include time | ✅ Yes |

### Field Details

#### **Template Name**
- Type: Single line text
- Description: The name/title of the graphic template
- Example: "TGMC Health Tip - Blue Background"

#### **Category**
- Type: Single select
- Options:
  - Social Posts
  - Stories
  - Quotes
  - Announcements
  - Testimonials
  - Events
  - Health Tips
  - Promotions
- Default: Social Posts

#### **Image URL**
- Type: URL
- Description: Direct link to the template image
- Examples:
  - Google Drive shareable link
  - Dropbox link
  - Direct image URL from hosting service
- Note: Must be publicly accessible

#### **Dimensions**
- Type: Single line text
- Description: Image dimensions in pixels
- Examples: "1080x1080", "1080x1920", "1200x628"
- Optional but recommended

#### **Tags**
- Type: Long text
- Description: Comma-separated keywords for searching/filtering
- Examples: "health, wellness, blue, cardiology"
- Optional

#### **Project**
- Type: Link to another record
- Links to: Projects table
- Description: Links each template to a specific project (coaction, zrmc, or tgmc)
- Required: Yes
- Multiple records: No

#### **Uploaded By**
- Type: Single line text
- Description: Name of the user who uploaded the template
- Auto-populated by the app

#### **Upload Date**
- Type: Date
- Include time: Yes
- Description: When the template was uploaded
- Auto-populated by the app

## 🔧 Setup Steps

### 1. Create the Table
1. Open your CoactionConnect2 Airtable base
2. Click "+ Add or import" → "Create empty table"
3. Name it **"Graphic Templates"**

### 2. Add Fields
Follow the field list above and create each field with the specified type and settings.

### 3. Set Up Category Options
For the "Category" field (Single select):
1. Click on the field header
2. Click "Customize field type"
3. Add each option:
   - Social Posts
   - Stories
   - Quotes
   - Announcements
   - Testimonials
   - Events
   - Health Tips
   - Promotions

### 4. Link to Projects Table
For the "Project" field:
1. Field type: "Link to another record"
2. Select table: "Projects"
3. Allow linking to multiple records: No
4. Save

### 5. Test the Integration
1. Go to your Social Media page in the app
2. Click "Upload Template"
3. Fill in the form:
   - Template Name: "Test Template"
   - Category: "Social Posts"
   - Image URL: (paste any valid image URL)
   - Dimensions: "1080x1080"
   - Tags: "test, demo"
4. Click "Upload Template"
5. Check your Airtable - the record should appear!

## 📊 View Recommendations

### Grid View (Default)
- Group by: Category
- Filter: Show only templates for specific project
- Sort: Upload Date (newest first)

### Gallery View
- Cover field: Image URL (will show thumbnails!)
- Group by: Category
- Perfect for visual browsing

### Form View
- For manual template entry
- Helpful for bulk uploads or data entry

## 🔐 API Configuration

Make sure your `.env` file or environment variables include:

```env
VITE_AIRTABLE_API_KEY=your_api_key_here
VITE_AIRTABLE_BASE_ID=your_base_id_here
```

Get these from:
- API Key: https://airtable.com/account (Personal access tokens)
- Base ID: Your base URL (starts with "app...")

## 🎯 Benefits

✅ **Team Collaboration** - All team members see the same templates
✅ **Real-time Sync** - Changes appear instantly for everyone
✅ **Cloud Backup** - Templates safely stored in Airtable
✅ **Easy Management** - Edit, organize, and search in Airtable
✅ **Version Control** - Track who uploaded what and when
✅ **Multi-device** - Access from anywhere
✅ **Scalable** - Handle 25+ templates easily, room to grow

## 🚨 Troubleshooting

**Templates not uploading?**
- Check API key and base ID in config
- Verify "Graphic Templates" table exists
- Ensure Projects table has records for coaction, zrmc, tgmc

**Images not showing?**
- Make sure Image URL is publicly accessible
- Test the URL in a browser first
- For Google Drive, use "Share" → "Anyone with link can view"

**Permission errors?**
- Check your Airtable API token has access to the base
- Verify you're using the correct base ID

## 💡 Pro Tips

1. **Image Hosting**: Use Google Drive or Dropbox for easy team sharing
2. **Naming Convention**: Include project name in template names (e.g., "TGMC - Health Tip - Blue")
3. **Tags**: Use consistent tag naming for better searching
4. **Categories**: Match categories to your content pillars for better organization
5. **Gallery View**: Create a Gallery view in Airtable for visual browsing of all templates

## 📱 Next Steps

Once set up, your team can:
- Upload templates from the Social Media page
- Browse by category
- Preview templates in full size
- Download templates directly
- Delete outdated templates
- See who uploaded what and when

All data syncs automatically to Airtable for the entire team! 🚀
