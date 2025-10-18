# n8n Social Media Scraper Integration Guide

## 🎯 Overview

This guide shows how to set up automated social media monitoring for hospital development projects using n8n workflows. The system will capture community commentary from Facebook, Twitter, Reddit, and news sites about your hospital projects and provide direct links to the original posts.

## 🔧 n8n Workflow Setup

### 1. Facebook Scraper Workflow

**Trigger:** Schedule (every 4 hours)
**Steps:**
1. **HTTP Request** - Search Facebook for keywords
2. **HTML Extract** - Parse post content, author, engagement, and URL
3. **Data Processing** - Format the commentary data
4. **Webhook** - Send data to your dashboard

**Keywords to Monitor:**
- "Zion Regional Medical Center"
- "ZRMC"
- "Hurricane hospital"
- "medical center Hurricane"
- "hospital construction Hurricane"

### 2. Twitter/X Scraper Workflow

**Trigger:** Schedule (every 2 hours)
**Steps:**
1. **Twitter API** - Search for hashtags and mentions
2. **Data Processing** - Extract post content, author, engagement, and URL
3. **Data Formatting** - Structure the commentary data
4. **Webhook** - Send to dashboard

**Hashtags to Monitor:**
- #ZRMC
- #HurricaneHospital
- #ZionRegional
- #MedicalCenter

### 3. Reddit Scraper Workflow

**Trigger:** Schedule (every 6 hours)
**Steps:**
1. **Reddit API** - Search subreddits for mentions
2. **Content Analysis** - Extract post and comment data with URLs
3. **Data Processing** - Format the commentary data
4. **Webhook** - Send to dashboard

**Subreddits to Monitor:**
- r/Utah
- r/SouthernUtah
- r/Hurricane
- r/healthcare

### 4. News Scraper Workflow

**Trigger:** Schedule (daily)
**Steps:**
1. **Google News API** - Search for news articles
2. **Article Extraction** - Get article content and URL
3. **Data Processing** - Format the commentary data
4. **Webhook** - Send to dashboard

## 📊 Data Structure

### Webhook Payload Format

```json
{
  "project_id": "zrmc",
  "platform": "facebook",
  "posts": [
    {
      "id": "unique_post_id",
      "author": "John Smith",
      "content": "Excited about the new hospital in Hurricane!",
      "date": "2024-01-15T10:30:00Z",
      "engagement": {
        "likes": 45,
        "comments": 12,
        "shares": 8
      },
      "location": "Hurricane, UT",
      "url": "https://facebook.com/post/123",
      "keywords": ["hospital", "construction", "healthcare"]
    }
  ],
  "metrics": {
    "total_mentions": 156,
    "platform_breakdown": [
      {"platform": "Facebook", "mentions": 98},
      {"platform": "Twitter", "mentions": 34},
      {"platform": "Reddit", "mentions": 24}
    ]
  }
}
```

## 🔗 n8n Workflow Templates

### Facebook Scraper Template

```json
{
  "name": "Facebook Hospital Mentions",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "value": 4}]
        }
      }
    },
    {
      "name": "Facebook Search",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://graph.facebook.com/v18.0/search",
        "method": "GET",
        "qs": {
          "q": "Zion Regional Medical Center OR ZRMC OR Hurricane hospital",
          "type": "post",
          "access_token": "{{$env.FACEBOOK_ACCESS_TOKEN}}"
        }
      }
    },
    {
      "name": "Extract Post Data",
      "type": "n8n-nodes-base.htmlExtract",
      "parameters": {
        "extractionValues": [
          {
            "key": "content",
            "cssSelector": ".post-content"
          },
          {
            "key": "author",
            "cssSelector": ".author-name"
          },
          {
            "key": "engagement",
            "cssSelector": ".engagement-stats"
          }
        ]
      }
    },
    {
      "name": "Extract URL",
      "type": "n8n-nodes-base.htmlExtract",
      "parameters": {
        "extractionValues": [
          {
            "key": "url",
            "cssSelector": "a[href*='facebook.com']"
          }
        ]
      }
    },
    {
      "name": "Send to Dashboard",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "url": "https://your-dashboard.com/api/community-data",
        "method": "POST",
        "body": {
          "project_id": "zrmc",
          "platform": "facebook",
          "posts": "{{$json}}",
          "timestamp": "{{$now}}"
        }
      }
    }
  ]
}
```

## 🚀 Implementation Steps

### 1. Set Up n8n Instance

```bash
# Install n8n
npm install -g n8n

# Start n8n
n8n start
```

### 2. Configure API Keys

```bash
# Facebook API
export FACEBOOK_ACCESS_TOKEN="your_facebook_token"

# Twitter API
export TWITTER_BEARER_TOKEN="your_twitter_token"

# OpenAI API (for sentiment analysis)
export OPENAI_API_KEY="your_openai_key"
```

### 3. Create Webhook Endpoint

Add this endpoint to your dashboard to receive n8n data:

```typescript
// In your dashboard API
app.post('/api/community-data', async (req, res) => {
  const { project_id, platform, posts, metrics } = req.body;
  
  // Store in Airtable
  await CommunityService.savePosts(project_id, posts);
  await CommunityService.updateMetrics(project_id, metrics);
  
  res.json({ success: true });
});
```

### 4. Deploy Workflows

1. Import the workflow templates into n8n
2. Configure the API keys
3. Set the webhook URLs
4. Activate the workflows

## 📈 Monitoring & Analytics

### Key Metrics to Track

- **Total Mentions**: Number of posts mentioning your hospital
- **Platform Breakdown**: Where most discussions happen
- **Trending Topics**: What people are talking about
- **Engagement Rates**: How much interaction posts get
- **Commentary Volume**: How much community discussion is happening

### Alert Thresholds

- **Mention Volume Spike**: Alert for viral content
- **New Keywords**: Alert for emerging topics
- **High Engagement**: Alert for popular discussions
- **Crisis Mentions**: Alert for potential issues

## 🔧 Advanced Features

### 1. AI-Powered Content Analysis

```javascript
// n8n function node
const content = $input.first().json.content;
const keywords = ['hospital', 'construction', 'healthcare', 'medical'];

const analysis = {
  relevance_score: calculateRelevance(content, keywords),
  sentiment: analyzeSentiment(content),
  topics: extractTopics(content),
  urgency: assessUrgency(content)
};

return { analysis };
```

### 2. Geographic Filtering

```javascript
// Filter posts by location
const locationKeywords = ['Hurricane', 'Utah', 'Southern Utah', 'Washington County'];
const isRelevantLocation = locationKeywords.some(keyword => 
  content.toLowerCase().includes(keyword.toLowerCase())
);
```

### 3. Influencer Detection

```javascript
// Identify key community members
const engagementThreshold = 100;
const isInfluencer = (likes + comments + shares) > engagementThreshold;
```

## 🛠️ Troubleshooting

### Common Issues

1. **API Rate Limits**: Implement delays between requests
2. **Content Changes**: Update selectors when platforms change
3. **Authentication**: Refresh tokens regularly
4. **Data Quality**: Filter out spam and irrelevant content

### Monitoring n8n

- Check workflow execution logs
- Monitor error rates
- Set up alerts for failed workflows
- Track data quality metrics

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Reddit API](https://www.reddit.com/dev/api/)
- [OpenAI API](https://platform.openai.com/docs)

## 🎯 Next Steps

1. **Set up n8n instance**
2. **Configure API keys**
3. **Import workflow templates**
4. **Test with sample data**
5. **Deploy to production**
6. **Monitor and optimize**

This system will automatically feed community sentiment data into your dashboard, giving you real-time insights into how the community feels about your hospital development projects! 🏥📊
