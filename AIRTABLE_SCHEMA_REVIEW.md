# Airtable Schema Review & Connection Status

## 🔍 **Current Connection Status**

### ✅ **Working Components**
- **API Configuration**: Properly configured with environment variables
- **Authentication**: Bearer token authentication working
- **Base URL**: Correct Airtable API v0 endpoint
- **Table Names**: All table names defined and consistent

### ⚠️ **Issues Found & Fixed**
1. **Record Structure**: Fixed `savePost` to use proper `records` array format
2. **Update Method**: Fixed `updatePost` to include record ID in PATCH request
3. **Delete Method**: Fixed `deletePost` to use correct DELETE endpoint with record ID

## 📊 **Required Airtable Schema**

### **Table: Projects**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Project Name | Single line text | ✅ | Unique identifier (coaction, zrmc, tgmc) |
| Description | Long text | ❌ | Project description |
| Primary Color | Single line text | ❌ | Hex color code |
| Main Logo | Attachment | ❌ | Project logo file |
| Created Date | Date | ❌ | When project was created |

### **Table: Social Posts**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Content | Long text | ✅ | Post content/text |
| Platforms | Multiple select | ✅ | Facebook, Instagram, Twitter, LinkedIn, TikTok |
| Status | Single select | ✅ | Draft, Scheduled, Published, Failed |
| Scheduled Date | Date | ❌ | When to publish (include time) |
| Publish Date | Date | ❌ | When actually published |
| Created By | Single line text | ❌ | User who created post |
| Approved By | Single line text | ❌ | User who approved post |
| Project | Link to another record | ✅ | Links to Projects table |
| Created | Date | ❌ | Auto-generated creation timestamp |
| Pillar | Single select | ❌ | Community, Progress, Health, Events, General |
| Post Type | Single select | ❌ | Announcement, Update, Tip, Event, Post |
| Image URL | URL | ❌ | Link to post graphic/image |

### **Table: Graphic Templates**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Template Name | Single line text | ✅ | Name of template |
| Category | Single select | ✅ | Social Posts, Stories, Quotes, etc. |
| Image URL | URL | ✅ | Direct link to template image |
| Dimensions | Single line text | ❌ | e.g., "1080x1080", "1080x1920" |
| Tags | Long text | ❌ | Comma-separated keywords |
| Project | Link to another record | ✅ | Links to Projects table |
| Uploaded By | Single line text | ❌ | User who uploaded |
| Upload Date | Date | ❌ | When uploaded |

### **Table: Content Bank**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Title | Single line text | ✅ | Content title |
| Content | Long text | ✅ | Content text |
| Category | Single select | ✅ | Health Tips, Announcements, etc. |
| Project | Link to another record | ✅ | Links to Projects table |
| Created By | Single line text | ❌ | User who created |
| Created Date | Date | ❌ | When created |

### **Table: Social Media Accounts**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Platform | Single select | ✅ | Facebook, Instagram, Twitter, LinkedIn, TikTok, YouTube |
| Account Name | Single line text | ✅ | @username or page name |
| Account URL | URL | ❌ | Direct link to account |
| Followers | Number | ❌ | Current follower count |
| Status | Single select | ✅ | Connected, Disconnected, Pending |
| Project | Link to another record | ✅ | Links to Projects table |
| Connected By | Single line text | ❌ | User who connected account |
| Connected Date | Date | ❌ | When account was connected |
| Last Sync | Date | ❌ | Last time data was synced |

### **Table: Hashtags**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Hashtag | Single line text | ✅ | #hashtag (with # symbol) |
| Category | Single select | ✅ | Health, Community, Events, General |
| Usage Count | Number | ❌ | How many times used |
| Project | Link to another record | ✅ | Links to Projects table |
| Created By | Single line text | ❌ | User who created |
| Created Date | Date | ❌ | When created |
| Last Used | Date | ❌ | When last used in a post |

### **Table: Campaigns**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Campaign Name | Single line text | ✅ | Name of campaign |
| Description | Long text | ❌ | Campaign description |
| Start Date | Date | ✅ | Campaign start date |
| End Date | Date | ✅ | Campaign end date |
| Status | Single select | ✅ | Planning, Active, Paused, Completed |
| Project | Link to another record | ✅ | Links to Projects table |
| Created By | Single line text | ❌ | User who created |
| Created Date | Date | ❌ | When created |
| Budget | Currency | ❌ | Campaign budget |
| Target Reach | Number | ❌ | Target audience reach |

### **Table: Analytics**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Date | Date | ✅ | Analytics date |
| Platform | Single select | ✅ | Facebook, Instagram, Twitter, LinkedIn, TikTok |
| Metric | Single select | ✅ | Followers, Reach, Engagement, Clicks, Shares |
| Value | Number | ✅ | Metric value |
| Project | Link to another record | ✅ | Links to Projects table |
| Post | Link to another record | ❌ | Links to specific Social Post |
| Campaign | Link to another record | ❌ | Links to Campaign |

### **Table: Team Members**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Name | Single line text | ✅ | Full name |
| Email | Email | ✅ | Email address |
| Role | Single select | ✅ | Admin, Editor, Viewer |
| Project | Link to another record | ✅ | Links to Projects table |
| Status | Single select | ✅ | Active, Inactive, Pending |
| Invited By | Single line text | ❌ | User who invited |
| Invited Date | Date | ❌ | When invited |
| Last Active | Date | ❌ | Last time user was active |

### **Table: Content Calendar**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Date | Date | ✅ | Calendar date |
| Event | Single line text | ❌ | Event or occasion name |
| Type | Single select | ✅ | Holiday, Event, Campaign, General |
| Project | Link to another record | ✅ | Links to Projects table |
| Notes | Long text | ❌ | Additional notes |
| Created By | Single line text | ❌ | User who created |
| Created Date | Date | ❌ | When created |

### **Table: Brand Guidelines**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Guideline Type | Single select | ✅ | Voice, Tone, Visual, Content |
| Title | Single line text | ✅ | Guideline title |
| Description | Long text | ✅ | Detailed guideline |
| Project | Link to another record | ✅ | Links to Projects table |
| Priority | Single select | ✅ | High, Medium, Low |
| Created By | Single line text | ❌ | User who created |
| Created Date | Date | ❌ | When created |
| Last Updated | Date | ❌ | When last modified |

### **Table: Competitors**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Company Name | Single line text | ✅ | Competitor name |
| Website | URL | ❌ | Company website |
| Social Handles | Long text | ❌ | All social media handles |
| Industry | Single select | ❌ | Healthcare, Technology, etc. |
| Project | Link to another record | ✅ | Links to Projects table |
| Notes | Long text | ❌ | Additional notes |
| Created By | Single line text | ❌ | User who added |
| Created Date | Date | ❌ | When added |

### **Table: Content Ideas**
| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Idea Title | Single line text | ✅ | Brief idea title |
| Description | Long text | ✅ | Detailed idea description |
| Category | Single select | ✅ | Health Tips, Behind Scenes, Community, Events |
| Priority | Single select | ✅ | High, Medium, Low |
| Status | Single select | ✅ | Idea, In Progress, Completed, Rejected |
| Project | Link to another record | ✅ | Links to Projects table |
| Suggested By | Single line text | ❌ | User who suggested |
| Created Date | Date | ❌ | When created |
| Target Date | Date | ❌ | When to publish |

## 🔧 **Environment Variables Required**

```env
VITE_AIRTABLE_API_KEY=your_api_key_here
VITE_AIRTABLE_BASE_ID=your_base_id_here
```

## 🚨 **Critical Schema Requirements**

### **1. Project Linking**
- All tables MUST have a "Project" field linking to Projects table
- Project IDs must match: `coaction`, `zrmc`, `tgmc`

### **2. Field Name Consistency**
- Field names in Airtable MUST match exactly (case-sensitive)
- Use exact names: "Scheduled Date", "Publish Date", "Created By", etc.

### **3. Data Types**
- **Dates**: Use Airtable Date field with time included
- **Links**: Use "Link to another record" for Project relationships
- **Select Fields**: Pre-configure all options in Airtable

## 🧪 **Testing the Connection**

### **Test 1: Basic Connection**
```javascript
// Test if API key and base ID are working
const testConnection = async () => {
  try {
    const result = await SocialService.getPosts('coaction');
    console.log('✅ Connection successful:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
};
```

### **Test 2: Create Post**
```javascript
// Test creating a new post
const testCreatePost = async () => {
  try {
    const postData = {
      content: 'Test post content',
      platforms: ['Facebook'],
      status: 'draft',
      scheduledDate: new Date().toISOString(),
      createdBy: 'Test User'
    };
    
    const postId = await SocialService.savePost(postData, 'coaction');
    console.log('✅ Post created:', postId);
  } catch (error) {
    console.error('❌ Create failed:', error);
  }
};
```

## 🔄 **Data Flow Verification**

### **App → Airtable**
1. User creates post in app
2. `SocialService.savePost()` called
3. Data formatted for Airtable API
4. POST request sent to Airtable
5. Record ID returned and stored

### **Airtable → App**
1. App loads on page refresh
2. `SocialService.getPosts()` called
3. Filters by project ID
4. Converts Airtable format to app format
5. Updates UI with real data

## 🛠️ **Setup Checklist**

- [ ] Airtable base created with all required tables
- [ ] All field names match exactly (case-sensitive)
- [ ] Project records created with IDs: coaction, zrmc, tgmc
- [ ] Environment variables set in `.env` file
- [ ] API key has proper permissions
- [ ] Test connection with sample data
- [ ] Verify bidirectional sync works

## 🚀 **Next Steps**

1. **Verify Schema**: Check that your Airtable base matches this schema exactly
2. **Test Connection**: Run the test functions to verify API access
3. **Create Sample Data**: Add a few test posts to verify the full flow
4. **Monitor Errors**: Check browser console for any API errors

The connection should now be solid with the fixes applied!
