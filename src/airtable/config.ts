// Airtable Configuration for CoactionConnect2
// Single base with linked tables approach

// Get your API key from: https://airtable.com/account
export const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || '';

// Single base ID - get this from your Airtable base URL
// Example: https://airtable.com/appXXXXXXXXXXXXXX/...
export const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || '';

export const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

// Table names in your single Airtable base
export const TABLE_NAMES = {
  projects: 'Projects',
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
