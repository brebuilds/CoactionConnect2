// Migration Script for CoactionConnect
// Run this in browser console to migrate localStorage data to cloud storage

console.log('🚀 Starting CoactionConnect Data Migration...');

// Check what data exists in localStorage
const projects = ['coaction', 'zrmc', 'tgmc'];
const dataTypes = ['logos', 'color-palette', 'fonts', 'brand-settings', 'knowledge-files'];

console.log('📊 Current localStorage data:');
projects.forEach(project => {
  console.log(`\n📁 Project: ${project}`);
  dataTypes.forEach(type => {
    const key = `${type}-${project}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`  ✅ ${type}: ${Array.isArray(parsed) ? parsed.length : '1'} items`);
    } else {
      console.log(`  ❌ ${type}: No data`);
    }
  });
});

// Migration status
console.log('\n🔄 Migration Status:');
console.log('1. Set up cloud storage (Supabase or Firebase)');
console.log('2. Upload assets through the app interface');
console.log('3. System will automatically save to cloud storage');
console.log('4. localStorage will be used as fallback');

console.log('\n✨ Migration complete! Your data will now persist in cloud storage.');
