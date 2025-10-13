const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  // Check feedback_sessions
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback_sessions')
    .select('*')
    .limit(1);

  console.log('Feedback sessions sample:', { feedback, feedbackError });

  // Check assistance_requests
  const { data: assistance, error: assistanceError } = await supabase
    .from('assistance_requests')
    .select('*')
    .limit(1);

  console.log('Assistance requests sample:', { assistance, assistanceError });
}

checkSchema();
