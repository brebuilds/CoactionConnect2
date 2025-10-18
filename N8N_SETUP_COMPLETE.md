# 🎉 n8n Social Media Monitoring Setup Complete!

## ✅ What's Been Created

I've successfully set up **4 automated workflows** in your n8n instance to monitor social media and news for hospital development discussions:

### **1. Weekly Facebook Hospital Mentions** 
- **Workflow ID**: `7FOR7pnuKZUdQpVI`
- **Schedule**: Weekly (every 7 days)
- **Keywords**: "Zion Regional Medical Center OR ZRMC OR Hurricane hospital"
- **API**: Facebook Graph API

### **2. Weekly Twitter Hospital Mentions**
- **Workflow ID**: `yMOf5hL18LfYwbzZ` 
- **Schedule**: Weekly (every 7 days)
- **Hashtags**: #ZRMC, #HurricaneHospital, #ZionRegional
- **API**: Twitter API v2

### **3. Weekly Reddit Hospital Discussions**
- **Workflow ID**: `e7VJLpEPCKY5qm9y`
- **Schedule**: Weekly (every 7 days)
- **Search**: "Zion Regional Medical Center OR ZRMC OR Hurricane hospital"
- **API**: Reddit JSON API

### **4. Weekly News Hospital Coverage**
- **Workflow ID**: `eRDuCcDc7jC7jEqY`
- **Schedule**: Weekly (every 7 days)
- **Search**: "Zion Regional Medical Center OR ZRMC OR Hurricane hospital"
- **API**: NewsAPI.org

## 🔧 Next Steps to Complete Setup

### **1. Configure API Keys**

You'll need to set up these environment variables in your n8n instance:

```bash
# Facebook API
FACEBOOK_ACCESS_TOKEN=your_facebook_token_here

# Twitter API  
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# News API
NEWS_API_KEY=your_newsapi_key_here
```

### **2. Update Webhook URLs**

Currently, all workflows are set to send data to:
```
https://your-dashboard.com/api/community-data
```

**You need to update this to your actual dashboard URL.** For example:
```
https://yourdomain.com/api/community-data
```

### **3. Activate Workflows**

The workflows are created but not active yet. You can activate them by:

1. **Go to your n8n dashboard**: https://n8n.srv745717.hstgr.cloud/
2. **Find each workflow** by name or ID
3. **Click the toggle** to activate them
4. **Test each workflow** by clicking "Execute Workflow"

### **4. Dashboard Integration**

Your dashboard already has the webhook handler built-in! The Community tab will automatically:

- ✅ **Receive data** from n8n workflows
- ✅ **Display new posts** in real-time
- ✅ **Update metrics** automatically
- ✅ **Show platform breakdown** by source
- ✅ **Track trending topics** from community discussions

## 📊 What You'll See

### **Community Metrics Dashboard**
- **Total Mentions**: Real-time count of social media mentions
- **Active Scrapers**: Number of running n8n workflows  
- **Platforms Monitored**: Facebook, Twitter, Reddit, News

### **n8n Scraper Status Panel**
- **Live Status**: Green (active), Yellow (paused), Red (error)
- **Run Schedules**: Last run and next run times
- **Manual Triggers**: "Run Now" buttons for immediate execution

### **Community Posts Feed**
- **Real-time Updates**: New posts appear automatically
- **Direct Links**: Click to view original posts
- **Platform Filtering**: Filter by Facebook, Twitter, Reddit, News
- **Search Functionality**: Find specific posts by content

### **Trending Topics**
- **Top Discussions**: What the community is talking about
- **Growth Tracking**: Which topics are trending up/down
- **Mention Counts**: How many times each topic is mentioned

## 🚀 How to Get Started

### **Step 1: Get API Keys**

#### **Facebook API**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Get a Page Access Token
4. Add to n8n environment variables

#### **Twitter API**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Get Bearer Token
4. Add to n8n environment variables

#### **News API**
1. Go to [NewsAPI.org](https://newsapi.org/)
2. Sign up for free account
3. Get API key
4. Add to n8n environment variables

### **Step 2: Update Webhook URLs**

In each workflow, update the webhook URL to your actual dashboard:
```
https://yourdomain.com/api/community-data
```

### **Step 3: Test the System**

1. **Activate one workflow** at a time
2. **Click "Execute Workflow"** to test
3. **Check your dashboard** for new posts
4. **Verify data is flowing** correctly

## 🎯 Expected Results

Once everything is set up, you'll see:

### **Weekly Community Monitoring**
- **Facebook posts** about hospital construction (weekly collection)
- **Twitter mentions** with relevant hashtags (weekly collection)
- **Reddit discussions** in local communities (weekly collection)
- **News articles** covering the development (weekly collection)

### **Community Insights**
- **What people are saying** about the hospital
- **Construction progress discussions**
- **Job opportunity mentions**
- **Traffic impact concerns**
- **Healthcare access conversations**

### **Actionable Data**
- **Direct links** to original posts
- **Engagement metrics** (likes, comments, shares)
- **Community sentiment** trends
- **Platform-specific** discussion patterns

## 🔧 Troubleshooting

### **No Data Appearing**
- Check if workflows are active
- Verify API keys are correct
- Test workflows manually
- Check webhook URLs

### **API Rate Limits**
- Reduce scraping frequency
- Add delays between requests
- Use multiple API keys if needed

### **Webhook Not Working**
- Verify dashboard URL is correct
- Check if dashboard is accessible
- Test webhook endpoint manually

## 📈 Advanced Features

### **Custom Keywords**
You can easily modify the search terms in each workflow:
- **ZRMC**: "Zion Regional", "ZRMC", "Hurricane hospital"
- **TGMC**: "Texas General", "TGMC", "medical center"

### **Additional Platforms**
Want to monitor other platforms? Just create new workflows for:
- **Instagram**: Hashtag monitoring
- **LinkedIn**: Professional discussions
- **YouTube**: Video content
- **TikTok**: Short-form content

### **Alert System**
Set up alerts for:
- **High engagement** posts
- **Negative sentiment** spikes
- **Viral content** mentions
- **Crisis management** situations

## 🎉 You're All Set!

Your social media monitoring system is now ready to capture community commentary about your hospital development projects! 

**The system will automatically:**
- ✅ **Monitor** Facebook, Twitter, Reddit, and News
- ✅ **Capture** community discussions and mentions
- ✅ **Provide** direct links to original posts
- ✅ **Track** engagement and trending topics
- ✅ **Update** your dashboard in real-time

**Just activate the workflows and start monitoring your community!** 🏥📊✨
