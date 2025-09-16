// Test Airtable Connection
// Run this in browser console to test your Airtable setup

// Get credentials from environment or config
const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID || '';

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.log('❌ Please set your Airtable credentials in .env file');
  console.log('REACT_APP_AIRTABLE_API_KEY=your-api-key');
  console.log('REACT_APP_AIRTABLE_BASE_ID=your-base-id');
  return;
}

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

async function testAirtableConnection() {
  console.log('🧪 Testing Airtable Connection...');
  console.log('Base ID:', AIRTABLE_BASE_ID);
  
  try {
    // Test connection by getting base schema
    const response = await fetch(`${AIRTABLE_BASE_URL}/${AIRTABLE_BASE_ID}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful!');
      console.log('📊 Available tables:', Object.keys(data.tables));
      
      // Check if our expected tables exist
      const expectedTables = ['Projects', 'Logos', 'Colors', 'Fonts', 'Knowledge Files', 'Social Posts'];
      const availableTables = Object.keys(data.tables);
      
      console.log('\n📋 Table Status:');
      expectedTables.forEach(table => {
        if (availableTables.includes(table)) {
          console.log(`  ✅ ${table} - Found`);
        } else {
          console.log(`  ❌ ${table} - Missing`);
        }
      });
      
    } else {
      console.error('❌ Connection failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testAirtableConnection();
