// Test Supabase Connection
// Run this script to test your Supabase setup

import { supabase } from './src/config/supabase';

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...');
  
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
        console.log(`⚠️  Could not check table '${table}'`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection().then((success) => {
  if (success) {
    console.log('\n🎉 Supabase setup is working correctly!');
    console.log('You can now run your app with: npm start');
  } else {
    console.log('\n💡 Please check your Supabase configuration:');
    console.log('1. Make sure your .env file exists with correct credentials');
    console.log('2. Verify your Supabase project is active');
    console.log('3. Run the SQL schema from supabase-schema.sql');
  }
});
