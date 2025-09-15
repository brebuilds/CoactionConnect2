import React from 'react';
import { ProjectId } from './ProjectManager';

// Supported integration platforms
export type IntegrationType = 
  | 'facebook_pages'
  | 'instagram_business' 
  | 'linkedin_company'
  | 'twitter_api'
  | 'youtube_channel'
  | 'google_analytics'
  | 'google_business'
  | 'tiktok_business'
  | 'pinterest_business'
  | 'mailchimp'
  | 'constant_contact'
  | 'hubspot'
  | 'salesforce';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface Integration {
  id: string;
  type: IntegrationType;
  projectId: ProjectId;
  status: IntegrationStatus;
  accountName?: string;
  accountId?: string;
  connectedAt?: Date;
  lastSyncAt?: Date;
  error?: string;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    [key: string]: any;
  };
  permissions?: string[];
  metadata?: {
    followerCount?: number;
    pageId?: string;
    businessId?: string;
    profilePicture?: string;
    [key: string]: any;
  };
}

// Platform configurations
export const INTEGRATION_CONFIGS: Record<IntegrationType, {
  name: string;
  icon: string;
  color: string;
  description: string;
  requiredFields: string[];
  oauthScopes?: string[];
  docs?: string;
}> = {
  facebook_pages: {
    name: 'Facebook Pages',
    icon: '📘',
    color: '#1877F2',
    description: 'Manage Facebook business pages and posts',
    requiredFields: ['clientId', 'clientSecret'],
    oauthScopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    docs: 'https://developers.facebook.com/docs/pages-api'
  },
  instagram_business: {
    name: 'Instagram Business',
    icon: '📷',
    color: '#E4405F',
    description: 'Post content and track Instagram business metrics',
    requiredFields: ['clientId', 'clientSecret'],
    oauthScopes: ['instagram_basic', 'instagram_content_publish'],
    docs: 'https://developers.facebook.com/docs/instagram-api'
  },
  linkedin_company: {
    name: 'LinkedIn Company',
    icon: '💼',
    color: '#0A66C2',
    description: 'Share content and track company page analytics',
    requiredFields: ['clientId', 'clientSecret'],
    oauthScopes: ['w_member_social', 'r_organization_social'],
    docs: 'https://docs.microsoft.com/en-us/linkedin/'
  },
  twitter_api: {
    name: 'Twitter/X API',
    icon: '🐦',
    color: '#1DA1F2',
    description: 'Post tweets and analyze engagement',
    requiredFields: ['apiKey', 'apiSecret', 'accessToken', 'accessSecret'],
    docs: 'https://developer.twitter.com/en/docs'
  },
  youtube_channel: {
    name: 'YouTube Channel',
    icon: '📺',
    color: '#FF0000',
    description: 'Upload videos and track channel analytics',
    requiredFields: ['clientId', 'clientSecret'],
    oauthScopes: ['youtube.upload', 'youtube.readonly'],
    docs: 'https://developers.google.com/youtube/v3'
  },
  google_analytics: {
    name: 'Google Analytics',
    icon: '📊',
    color: '#F9AB00',
    description: 'Track website traffic and user behavior',
    requiredFields: ['clientId', 'clientSecret', 'propertyId'],
    oauthScopes: ['analytics.readonly'],
    docs: 'https://developers.google.com/analytics'
  },
  google_business: {
    name: 'Google Business Profile',
    icon: '🏢',
    color: '#4285F4',
    description: 'Manage business listings and reviews',
    requiredFields: ['clientId', 'clientSecret'],
    oauthScopes: ['business.manage'],
    docs: 'https://developers.google.com/my-business'
  },
  tiktok_business: {
    name: 'TikTok for Business',
    icon: '🎵',
    color: '#000000',
    description: 'Create ads and track TikTok performance',
    requiredFields: ['clientId', 'clientSecret'],
    docs: 'https://ads.tiktok.com/marketing_api/docs'
  },
  pinterest_business: {
    name: 'Pinterest Business',
    icon: '📌',
    color: '#BD081C',
    description: 'Create pins and track Pinterest analytics',
    requiredFields: ['clientId', 'clientSecret'],
    oauthScopes: ['boards:read', 'pins:read', 'pins:write'],
    docs: 'https://developers.pinterest.com/docs'
  },
  mailchimp: {
    name: 'Mailchimp',
    icon: '📧',
    color: '#FFE01B',
    description: 'Manage email campaigns and subscriber lists',
    requiredFields: ['apiKey'],
    docs: 'https://mailchimp.com/developer/'
  },
  constant_contact: {
    name: 'Constant Contact',
    icon: '✉️',
    color: '#1f5fac',
    description: 'Email marketing and contact management',
    requiredFields: ['clientId', 'clientSecret'],
    docs: 'https://developer.constantcontact.com/'
  },
  hubspot: {
    name: 'HubSpot',
    icon: '🧲',
    color: '#FF7A59',
    description: 'CRM, marketing automation, and analytics',
    requiredFields: ['clientId', 'clientSecret'],
    docs: 'https://developers.hubspot.com/'
  },
  salesforce: {
    name: 'Salesforce',
    icon: '☁️',
    color: '#00A1E0',
    description: 'Customer relationship management',
    requiredFields: ['clientId', 'clientSecret'],
    docs: 'https://developer.salesforce.com/'
  }
};

// Integration storage key
const getIntegrationsKey = (projectId: ProjectId) => `integrations_${projectId}`;

// Integration management functions
export const IntegrationManager = {
  // Get all integrations for a project
  getIntegrations: (projectId: ProjectId): Integration[] => {
    try {
      const stored = localStorage.getItem(getIntegrationsKey(projectId));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading integrations:', error);
      return [];
    }
  },

  // Get a specific integration
  getIntegration: (projectId: ProjectId, type: IntegrationType): Integration | null => {
    const integrations = IntegrationManager.getIntegrations(projectId);
    return integrations.find(integration => integration.type === type) || null;
  },

  // Save integrations
  saveIntegrations: (projectId: ProjectId, integrations: Integration[]) => {
    try {
      localStorage.setItem(getIntegrationsKey(projectId), JSON.stringify(integrations));
    } catch (error) {
      console.error('Error saving integrations:', error);
    }
  },

  // Add or update an integration
  updateIntegration: (projectId: ProjectId, integration: Partial<Integration> & { type: IntegrationType }) => {
    const integrations = IntegrationManager.getIntegrations(projectId);
    const existingIndex = integrations.findIndex(i => i.type === integration.type);
    
    const updatedIntegration: Integration = {
      id: integration.id || `${integration.type}_${Date.now()}`,
      projectId,
      status: 'disconnected',
      ...integration,
    };

    if (existingIndex >= 0) {
      integrations[existingIndex] = { ...integrations[existingIndex], ...updatedIntegration };
    } else {
      integrations.push(updatedIntegration);
    }

    IntegrationManager.saveIntegrations(projectId, integrations);
    return updatedIntegration;
  },

  // Remove an integration
  removeIntegration: (projectId: ProjectId, type: IntegrationType) => {
    const integrations = IntegrationManager.getIntegrations(projectId);
    const filtered = integrations.filter(integration => integration.type !== type);
    IntegrationManager.saveIntegrations(projectId, filtered);
  },

  // Test connection for an integration
  testConnection: async (integration: Integration): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      // Import server connection details
      const { projectId: supabaseProjectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${supabaseProjectId}.supabase.co/functions/v1/make-server-a5e3056d/integrations/test/${integration.type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          projectId: integration.projectId,
          ...integration.credentials
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return result;
    } catch (error) {
      console.error('Integration test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  },

  // Get OAuth URL for platforms that support it
  getOAuthUrl: (type: IntegrationType, clientId: string, redirectUri: string): string => {
    const config = INTEGRATION_CONFIGS[type];
    const scopes = config.oauthScopes?.join(' ') || '';
    
    switch (type) {
      case 'facebook_pages':
      case 'instagram_business':
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
      
      case 'linkedin_company':
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
      
      case 'google_analytics':
      case 'google_business':
      case 'youtube_channel':
        return `https://accounts.google.com/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
      
      case 'pinterest_business':
        return `https://www.pinterest.com/oauth/?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
      
      default:
        return '';
    }
  },

  // Get connected integrations count
  getConnectedCount: (projectId: ProjectId): number => {
    const integrations = IntegrationManager.getIntegrations(projectId);
    return integrations.filter(integration => integration.status === 'connected').length;
  },

  // Get integration statistics
  getStats: (projectId: ProjectId) => {
    const integrations = IntegrationManager.getIntegrations(projectId);
    const total = integrations.length;
    const connected = integrations.filter(i => i.status === 'connected').length;
    const errors = integrations.filter(i => i.status === 'error').length;
    const pending = integrations.filter(i => i.status === 'pending').length;

    return {
      total,
      connected,
      errors,
      pending,
      disconnected: total - connected - errors - pending
    };
  }
};

export default IntegrationManager;