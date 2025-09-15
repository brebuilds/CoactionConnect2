import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Integration endpoints
const integrations = new Hono();

// Facebook Pages API
integrations.post('/facebook/pages', async (c) => {
  try {
    const { accessToken, projectId } = await c.req.json();
    
    const response = await fetch('https://graph.facebook.com/v18.0/me/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.error) {
      return c.json({ success: false, error: data.error.message }, 400);
    }
    
    // Store the successful connection
    await kv.set(`facebook_pages_${projectId}`, {
      accessToken,
      connectedAt: new Date().toISOString(),
      pages: data.data,
    });
    
    return c.json({ 
      success: true, 
      data: { 
        pages: data.data,
        accountName: data.data[0]?.name || 'Facebook Pages'
      } 
    });
    
  } catch (error) {
    console.error('Facebook Pages integration error:', error);
    return c.json({ success: false, error: 'Failed to connect to Facebook Pages' }, 500);
  }
});

// Instagram Business API
integrations.post('/instagram/business', async (c) => {
  try {
    const { accessToken, projectId } = await c.req.json();
    
    const response = await fetch('https://graph.facebook.com/v18.0/me/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.error) {
      return c.json({ success: false, error: data.error.message }, 400);
    }
    
    // Get Instagram business accounts
    let instagramAccounts = [];
    for (const page of data.data) {
      try {
        const igResponse = await fetch(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const igData = await igResponse.json();
        if (igData.instagram_business_account) {
          instagramAccounts.push({
            ...igData.instagram_business_account,
            pageName: page.name
          });
        }
      } catch (error) {
        console.log('Error fetching Instagram account for page:', page.id);
      }
    }
    
    await kv.set(`instagram_business_${projectId}`, {
      accessToken,
      connectedAt: new Date().toISOString(),
      accounts: instagramAccounts,
    });
    
    return c.json({ 
      success: true, 
      data: { 
        accounts: instagramAccounts,
        accountName: instagramAccounts[0]?.pageName || 'Instagram Business'
      } 
    });
    
  } catch (error) {
    console.error('Instagram Business integration error:', error);
    return c.json({ success: false, error: 'Failed to connect to Instagram Business' }, 500);
  }
});

// LinkedIn Company API
integrations.post('/linkedin/company', async (c) => {
  try {
    const { accessToken, projectId } = await c.req.json();
    
    const response = await fetch('https://api.linkedin.com/v2/organizations?q=roleAssignee', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'LinkedIn-Version': '202311',
      },
    });
    
    const data = await response.json();
    
    if (data.error) {
      return c.json({ success: false, error: data.error.message }, 400);
    }
    
    await kv.set(`linkedin_company_${projectId}`, {
      accessToken,
      connectedAt: new Date().toISOString(),
      organizations: data.elements || [],
    });
    
    return c.json({ 
      success: true, 
      data: { 
        organizations: data.elements || [],
        accountName: data.elements?.[0]?.localizedName || 'LinkedIn Company'
      } 
    });
    
  } catch (error) {
    console.error('LinkedIn Company integration error:', error);
    return c.json({ success: false, error: 'Failed to connect to LinkedIn Company' }, 500);
  }
});

// Twitter API
integrations.post('/twitter/api', async (c) => {
  try {
    const { apiKey, apiSecret, accessToken, accessSecret, projectId } = await c.req.json();
    
    // For Twitter API v2, we need to verify credentials
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.errors) {
      return c.json({ success: false, error: data.errors[0]?.detail || 'Twitter API error' }, 400);
    }
    
    await kv.set(`twitter_api_${projectId}`, {
      apiKey,
      apiSecret,
      accessToken,
      accessSecret,
      connectedAt: new Date().toISOString(),
      userInfo: data.data,
    });
    
    return c.json({ 
      success: true, 
      data: { 
        user: data.data,
        accountName: data.data?.name || data.data?.username || 'Twitter Account'
      } 
    });
    
  } catch (error) {
    console.error('Twitter API integration error:', error);
    return c.json({ success: false, error: 'Failed to connect to Twitter API' }, 500);
  }
});

// YouTube Channel API
integrations.post('/youtube/channel', async (c) => {
  try {
    const { accessToken, projectId } = await c.req.json();
    
    const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.error) {
      return c.json({ success: false, error: data.error.message }, 400);
    }
    
    await kv.set(`youtube_channel_${projectId}`, {
      accessToken,
      connectedAt: new Date().toISOString(),
      channels: data.items || [],
    });
    
    return c.json({ 
      success: true, 
      data: { 
        channels: data.items || [],
        accountName: data.items?.[0]?.snippet?.title || 'YouTube Channel'
      } 
    });
    
  } catch (error) {
    console.error('YouTube Channel integration error:', error);
    return c.json({ success: false, error: 'Failed to connect to YouTube Channel' }, 500);
  }
});

// Google Analytics API
integrations.post('/google/analytics', async (c) => {
  try {
    const { accessToken, propertyId, projectId } = await c.req.json();
    
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}/metadata`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.error) {
      return c.json({ success: false, error: data.error.message }, 400);
    }
    
    await kv.set(`google_analytics_${projectId}`, {
      accessToken,
      propertyId,
      connectedAt: new Date().toISOString(),
      metadata: data,
    });
    
    return c.json({ 
      success: true, 
      data: { 
        property: data,
        accountName: `Google Analytics Property ${propertyId}`
      } 
    });
    
  } catch (error) {
    console.error('Google Analytics integration error:', error);
    return c.json({ success: false, error: 'Failed to connect to Google Analytics' }, 500);
  }
});

// Mailchimp API
integrations.post('/mailchimp', async (c) => {
  try {
    const { apiKey, projectId } = await c.req.json();
    
    // Extract datacenter from API key
    const datacenter = apiKey.split('-')[1];
    if (!datacenter) {
      return c.json({ success: false, error: 'Invalid Mailchimp API key format' }, 400);
    }
    
    const response = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    const data = await response.json();
    
    if (data.type === 'http://developer.mailchimp.com/documentation/mailchimp/guides/error-glossary/') {
      return c.json({ success: false, error: data.title || 'Mailchimp API error' }, 400);
    }
    
    await kv.set(`mailchimp_${projectId}`, {
      apiKey,
      datacenter,
      connectedAt: new Date().toISOString(),
      accountInfo: data,
    });
    
    return c.json({ 
      success: true, 
      data: { 
        account: data,
        accountName: data.account_name || 'Mailchimp Account'
      } 
    });
    
  } catch (error) {
    console.error('Mailchimp integration error:', error);
    return c.json({ success: false, error: 'Failed to connect to Mailchimp' }, 500);
  }
});

// HubSpot API
integrations.post('/hubspot', async (c) => {
  try {
    const { accessToken, projectId } = await c.req.json();
    
    const response = await fetch('https://api.hubapi.com/account-info/v3/api-usage/daily', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.status === 'error') {
      return c.json({ success: false, error: data.message }, 400);
    }
    
    await kv.set(`hubspot_${projectId}`, {
      accessToken,
      connectedAt: new Date().toISOString(),
      apiUsage: data,
    });
    
    return c.json({ 
      success: true, 
      data: { 
        apiUsage: data,
        accountName: 'HubSpot Account'
      } 
    });
    
  } catch (error) {
    console.error('HubSpot integration error:', error);
    return c.json({ success: false, error: 'Failed to connect to HubSpot' }, 500);
  }
});

// Test connection endpoint
integrations.post('/test/:platform', async (c) => {
  try {
    const platform = c.req.param('platform');
    const { projectId, ...credentials } = await c.req.json();
    
    // Route to appropriate test based on platform
    switch (platform) {
      case 'facebook_pages':
        return await integrations.fetch(new Request('http://localhost/facebook/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: credentials.accessToken, projectId }),
        }));
        
      case 'instagram_business':
        return await integrations.fetch(new Request('http://localhost/instagram/business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: credentials.accessToken, projectId }),
        }));
        
      case 'linkedin_company':
        return await integrations.fetch(new Request('http://localhost/linkedin/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: credentials.accessToken, projectId }),
        }));
        
      case 'twitter_api':
        return await integrations.fetch(new Request('http://localhost/twitter/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            apiKey: credentials.apiKey,
            apiSecret: credentials.apiSecret,
            accessToken: credentials.accessToken,
            accessSecret: credentials.accessSecret,
            projectId 
          }),
        }));
        
      case 'youtube_channel':
        return await integrations.fetch(new Request('http://localhost/youtube/channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: credentials.accessToken, projectId }),
        }));
        
      case 'google_analytics':
        return await integrations.fetch(new Request('http://localhost/google/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            accessToken: credentials.accessToken,
            propertyId: credentials.propertyId,
            projectId 
          }),
        }));
        
      case 'mailchimp':
        return await integrations.fetch(new Request('http://localhost/mailchimp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: credentials.apiKey, projectId }),
        }));
        
      case 'hubspot':
        return await integrations.fetch(new Request('http://localhost/hubspot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: credentials.accessToken, projectId }),
        }));
        
      default:
        return c.json({ success: false, error: 'Unsupported platform' }, 400);
    }
    
  } catch (error) {
    console.error('Integration test error:', error);
    return c.json({ success: false, error: 'Integration test failed' }, 500);
  }
});

// Mount integrations routes
app.route('/integrations', integrations);

export default app;