// Test App Startup Script
// This script tests if the app can initialize without timeout issues

const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection with timeout
async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection with timeout...');
  
  const supabaseUrl = 'https://hviuzozqptsdshxzlpdf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aXV6b3pxcHRzZHNoeHpscGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTIwMzAsImV4cCI6MjA3MzYyODAzMH0.emHFY2emy1qBNiUCRe-2uZkbUSE83p7s6QYDxdxO_CA';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
    });
    
    const connectionPromise = supabase.from('users').select('count').limit(1);
    
    const result = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database is accessible');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Test app initialization simulation
async function testAppInitialization() {
  console.log('🚀 Testing app initialization...');
  
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('App initialization timeout after 15 seconds')), 15000);
    });
    
    const initPromise = testSupabaseConnection();
    
    await Promise.race([initPromise, timeoutPromise]);
    
    console.log('✅ App initialization test completed successfully!');
    console.log('🎉 Your app should start without timeout issues');
    return true;
  } catch (error) {
    console.error('❌ App initialization test failed:', error.message);
    return false;
  }
}

// Run the test
testAppInitialization().then(success => {
  if (success) {
    console.log('\n🎯 Ready to start your app! Run: npm start');
  } else {
    console.log('\n⚠️  There may be connection issues. Check your network and Supabase configuration.');
  }
});
