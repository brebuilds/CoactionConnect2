# 🔗 Integration Setup Guide

This guide helps you connect real social media accounts, analytics platforms, and business tools to your multi-tenant SAAS platform.

## 📋 Overview

The platform now supports **14 major integrations** across 4 categories:
- **Social Media**: Facebook, Instagram, LinkedIn, Twitter, YouTube, TikTok, Pinterest
- **Analytics**: Google Analytics, Google Business Profile
- **Email Marketing**: Mailchimp, Constant Contact
- **CRM/Business**: HubSpot, Salesforce

## 🚀 Quick Start

1. **Login as Admin/SuperAdmin** - Only admin users can access Integration Settings
2. **Navigate to Integrations** - Find it in the sidebar under Settings icon
3. **Choose Platform** - Select from Social Media, Analytics, Email, or CRM tabs
4. **Configure Connection** - Enter your API credentials
5. **Test & Connect** - The system will verify your credentials automatically

## 🔧 Platform-Specific Setup

### 📘 Facebook Pages
**Required:**
- Client ID
- Client Secret

**Setup Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "Facebook Login" and "Pages API" products
4. Get your App ID (Client ID) and App Secret (Client Secret)
5. Add redirect URI: `https://your-domain.com/auth/facebook/callback`

**Permissions Needed:**
- `pages_manage_posts`
- `pages_read_engagement`
- `pages_show_list`

---

### 📷 Instagram Business
**Required:**
- Client ID (same as Facebook)
- Client Secret (same as Facebook)

**Setup Steps:**
1. Use same Facebook app from above
2. Add "Instagram Basic Display" product
3. Connect your Instagram Business account to a Facebook Page
4. Ensure your Facebook Page is connected to an Instagram Business account

**Permissions Needed:**
- `instagram_basic`
- `instagram_content_publish`

---

### 💼 LinkedIn Company
**Required:**
- Client ID
- Client Secret

**Setup Steps:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add "Share on LinkedIn" and "Marketing Developer Platform" products
4. Get your Client ID and Client Secret
5. Add redirect URI: `https://your-domain.com/auth/linkedin/callback`

**Permissions Needed:**
- `w_member_social`
- `r_organization_social`

---

### 🐦 Twitter/X API
**Required:**
- API Key
- API Secret
- Access Token
- Access Token Secret

**Setup Steps:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Generate API keys and access tokens
4. Ensure you have appropriate API access level

**Note:** Twitter API requires elevated access for most business features.

---

### 📺 YouTube Channel
**Required:**
- Client ID (Google)
- Client Secret (Google)

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use existing one
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://your-domain.com/auth/google/callback`

**Permissions Needed:**
- `youtube.upload`
- `youtube.readonly`

---

### 📊 Google Analytics
**Required:**
- Client ID (Google)
- Client Secret (Google)
- Property ID

**Setup Steps:**
1. Use same Google Cloud project from above
2. Enable Google Analytics Data API
3. Find your GA4 Property ID in Google Analytics
4. Property ID format: `123456789`

**Permissions Needed:**
- `analytics.readonly`

---

### 🏢 Google Business Profile
**Required:**
- Client ID (Google)
- Client Secret (Google)

**Setup Steps:**
1. Use same Google Cloud project from above
2. Enable My Business API
3. Ensure you have a Google Business Profile

**Permissions Needed:**
- `business.manage`

---

### 📧 Mailchimp
**Required:**
- API Key

**Setup Steps:**
1. Login to your Mailchimp account
2. Go to Account Settings > Extras > API keys
3. Create a new API key
4. API key format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1`

**Note:** The datacenter (e.g., 'us1') is automatically extracted from the API key.

---

### 📮 Constant Contact
**Required:**
- Client ID (API Key)
- Client Secret

**Setup Steps:**
1. Go to [Constant Contact Developer Portal](https://developer.constantcontact.com/)
2. Create a new application
3. Get your API Key (Client ID) and Secret

---

### 🧲 HubSpot
**Required:**
- Access Token (Private App Token)

**Setup Steps:**
1. In HubSpot, go to Settings > Integrations > Private Apps
2. Create a private app
3. Generate an access token
4. Configure required scopes for your needs

---

### ☁️ Salesforce
**Required:**
- Client ID (Consumer Key)
- Client Secret (Consumer Secret)

**Setup Steps:**
1. In Salesforce Setup, search for "App Manager"
2. Create a new Connected App
3. Enable OAuth settings
4. Get Consumer Key and Consumer Secret
5. Add callback URL: `https://your-domain.com/auth/salesforce/callback`

## 🔐 Security Best Practices

### ✅ Do's:
- **Rotate tokens regularly** - Most platforms support token refresh
- **Use environment variables** - Never hardcode credentials
- **Limit permissions** - Only request scopes you actually need
- **Monitor usage** - Track API calls and usage limits
- **Test in sandbox** - Use development environments when available

### ❌ Don'ts:
- **Share credentials** - Each client should have their own
- **Commit credentials** - Never add API keys to version control
- **Use personal accounts** - Create dedicated business accounts
- **Ignore rate limits** - Respect platform API limits
- **Skip monitoring** - Watch for failed calls and errors

## 🚨 OAuth Flow Setup

For platforms requiring OAuth (Facebook, LinkedIn, Google, etc.):

1. **Production Domain Required** - OAuth won't work on localhost
2. **HTTPS Required** - All redirect URIs must use HTTPS
3. **Exact URI Match** - Redirect URIs must match exactly
4. **App Review** - Some platforms require app review for production

## 📈 Testing Your Integrations

### Connection Test
Each integration includes an automatic connection test that:
- ✅ Validates credentials
- ✅ Tests API connectivity
- ✅ Retrieves basic account info
- ✅ Checks permissions

### Manual Testing
You can also manually test by:
1. Checking the integration status indicators
2. Using the "Retest Connection" button
3. Monitoring the error logs in browser console
4. Verifying data appears in the respective platform sections

## 🆘 Troubleshooting

### Common Issues:

**❌ "Invalid credentials"**
- Double-check API keys and secrets
- Ensure tokens haven't expired
- Verify account permissions

**❌ "OAuth redirect mismatch"**
- Check redirect URIs match exactly
- Ensure HTTPS is used
- Verify domain ownership

**❌ "Rate limit exceeded"**
- Reduce API call frequency
- Implement backoff strategies
- Upgrade API plan if needed

**❌ "Insufficient permissions"**
- Review required scopes
- Re-authorize with additional permissions
- Check platform-specific requirements

### Getting Help:

1. **Check Platform Documentation** - Links provided above
2. **Review Error Messages** - Detailed errors in browser console
3. **Test with Platform Tools** - Most APIs have testing interfaces
4. **Contact Platform Support** - For platform-specific issues

## 🎯 Next Steps

Once integrations are connected:
1. **Data will sync automatically** - Content, analytics, and metrics
2. **Cross-post capabilities** - Share content across platforms
3. **Unified analytics** - View all metrics in one dashboard
4. **Automated workflows** - Set up rules and triggers

## 📚 Additional Resources

- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis/)
- [Instagram Business API](https://developers.facebook.com/docs/instagram-api/)
- [LinkedIn Marketing API](https://docs.microsoft.com/en-us/linkedin/marketing/)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Google Analytics API](https://developers.google.com/analytics)
- [Mailchimp API](https://mailchimp.com/developer/marketing/)
- [HubSpot API](https://developers.hubspot.com/)
- [Salesforce API](https://developer.salesforce.com/)

---

**Remember:** Each client in your multi-tenant system will need their own API credentials and integrations. The platform supports unlimited clients, each with their own separate connections and data.