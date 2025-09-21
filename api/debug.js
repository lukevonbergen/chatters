// /api/debug.js
// Simple debug endpoint to test API routing

export default async function handler(req, res) {
  console.log('Debug endpoint called');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Environment check:');
  console.log('- GOOGLE_MAPS_API_KEY exists:', !!process.env.GOOGLE_MAPS_API_KEY);
  console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  return res.status(200).json({
    message: 'Debug endpoint working',
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString(),
    env_vars: {
      google_api_key_exists: !!process.env.GOOGLE_MAPS_API_KEY,
      supabase_service_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      google_api_key_start: process.env.GOOGLE_MAPS_API_KEY ? process.env.GOOGLE_MAPS_API_KEY.substring(0, 10) + '...' : 'missing'
    }
  });
}