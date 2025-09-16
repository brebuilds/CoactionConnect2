// Airtable Configuration for CoactionConnect2

// Get your API key from: https://airtable.com/account
export const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY || 'your-airtable-api-key';

// Get your base IDs from your Airtable base URLs
// Example: https://airtable.com/appXXXXXXXXXXXXXX/...
export const AIRTABLE_BASES = {
  branding: process.env.REACT_APP_AIRTABLE_BRANDING_BASE || 'appXXXXXXXXXXXXXX',
  knowledge: process.env.REACT_APP_AIRTABLE_KNOWLEDGE_BASE || 'appYYYYYYYYYYYYYY',
  social: process.env.REACT_APP_AIRTABLE_SOCIAL_BASE || 'appZZZZZZZZZZZZZZ'
};

export const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

// Table names in your Airtable bases
export const TABLE_NAMES = {
  logos: 'Logos',
  colors: 'Colors', 
  fonts: 'Fonts',
  knowledgeFiles: 'Knowledge Files',
  socialPosts: 'Social Posts'
};

// Project IDs that match your ProjectManager
export const PROJECT_IDS = {
  coaction: 'coaction',
  zrmc: 'zrmc', 
  tgmc: 'tgmc'
};
