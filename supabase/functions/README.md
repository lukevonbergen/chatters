# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Chatters application.

## Functions

### create-assistance-request

This function creates assistance requests for customers without authentication, bypassing RLS restrictions.

**Purpose**: Allows customers to request assistance from the feedback page without encountering Row Level Security policy violations.

**Endpoint**: `https://your-project-id.supabase.co/functions/v1/create-assistance-request`

**Parameters**:
- `venueId` (string): The venue ID
- `tableNumber` (string): The table number
- `message` (string, optional): Custom message for the assistance request

## Deployment Instructions

### Prerequisites

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```bash
   supabase login
   ```

3. Link your project (if not already linked):
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

### Deploy the Function

1. Navigate to your project root directory:
   ```bash
   cd /Users/lukevonbergen/Documents/chatters
   ```

2. Deploy the create-assistance-request function:
   ```bash
   supabase functions deploy create-assistance-request
   ```

3. Verify deployment:
   ```bash
   supabase functions list
   ```

### Environment Variables

The function requires these environment variables to be set in your Supabase project:

- `SUPABASE_URL`: Your Supabase project URL (automatically available)
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (automatically available)

These are automatically provided by Supabase when the function runs.

### Testing

You can test the function using curl:

```bash
curl -X POST 'https://your-project-id.supabase.co/functions/v1/create-assistance-request' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "venueId": "your-venue-id",
    "tableNumber": "5",
    "message": "Need assistance please"
  }'
```

### Monitoring

View function logs:
```bash
supabase functions logs create-assistance-request
```

## Troubleshooting

If deployment fails:

1. Check you're in the correct directory
2. Verify your project is linked: `supabase status`
3. Ensure you have the correct permissions
4. Check the function logs for errors

## Security

This function uses the service role key to bypass RLS policies. It includes:

- Venue ID validation to ensure requests are only created for valid venues
- Input validation for required parameters
- CORS headers for cross-origin requests
- Error handling and logging