// backend/src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Test connection
(async () => {
  console.log('Testing Supabase connection...');
  const startTime = Date.now();
  try {
    const { data, error } = await supabase
      .from('test')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    const duration = Date.now() - startTime;
    console.log(`Supabase connection test successful (${duration}ms)`);
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    // Don't exit process, just log the error
    console.error('Continuing despite connection test failure');
  }
})();

module.exports = supabase;