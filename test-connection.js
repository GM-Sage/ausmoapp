// Simple Supabase Connection Test
// Run this with: node test-connection.js

const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual values
const supabaseUrl = 'https://hviuzozqptsdshxzlpdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aXV6b3pxcHRzZHNoeHpscGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTIwMzAsImV4cCI6MjA3MzYyODAzMH0.emHFY2emy1qBNiUCRe-2uZkbUSE83p7s6QYDxdxO_CA';

console.log('🧪 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseKey || supabaseKey === 'your_anon_key_here') {
  console.error('❌ Please update the supabaseUrl and supabaseKey variables in this file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database is accessible');
    
    // Test if tables exist
    const tables = ['users', 'communication_books', 'messages', 'symbols'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('count').limit(1);
        if (tableError) {
          console.log(`⚠️  Table '${table}' might not exist yet`);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase is ready! You can now run your app.');
  } else {
    console.log('\n💡 Make sure to:');
    console.log('1. Update the supabaseUrl and supabaseKey in this file');
    console.log('2. Run the SQL schema in your Supabase dashboard');
    console.log('3. Check your Supabase project is active');
  }
});
