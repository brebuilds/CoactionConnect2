// Script to clear all knowledge hub files from localStorage
// Run this in the browser console to clear all knowledge hub data

console.log('🧹 Clearing all knowledge hub files...');

// List of all project IDs
const projectIds = ['coaction', 'zrmc', 'tgmc'];

let totalCleared = 0;

projectIds.forEach(projectId => {
  const key = `knowledge-files-${projectId}`;
  const existingData = localStorage.getItem(key);
  
  if (existingData) {
    const files = JSON.parse(existingData);
    console.log(`📁 ${projectId.toUpperCase()}: Found ${files.length} files`);
    localStorage.removeItem(key);
    totalCleared += files.length;
    console.log(`✅ Cleared ${files.length} files from ${projectId.toUpperCase()}`);
  } else {
    console.log(`📁 ${projectId.toUpperCase()}: No files found`);
  }
});

console.log(`🎉 Total files cleared: ${totalCleared}`);
console.log('✨ All knowledge hubs are now empty!');

// Also clear any other knowledge-related localStorage items
const allKeys = Object.keys(localStorage);
const knowledgeKeys = allKeys.filter(key => key.includes('knowledge') || key.includes('Knowledge'));

if (knowledgeKeys.length > 0) {
  console.log('🔍 Found additional knowledge-related keys:', knowledgeKeys);
  knowledgeKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });
}

console.log('🏁 Knowledge hub cleanup complete!');
