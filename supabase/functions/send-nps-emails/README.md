# Send NPS Emails Edge Function

This Edge Function runs on a cron schedule (every hour) to send NPS follow-up emails via Resend.

## Setup

### 1. Set Environment Variables

In your Supabase project dashboard, add these secrets:

```bash
npx supabase secrets set RESEND_API_KEY=your_resend_api_key
npx supabase secrets set APP_URL=https://my.getchatters.com
```

### 2. Deploy the Function

```bash
npx supabase functions deploy send-nps-emails
```

### 3. Set Up Cron Job

In your Supabase dashboard, go to Database > Extensions and enable `pg_cron`.

Then run this SQL to create the hourly cron job:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every hour
SELECT cron.schedule(
  'send-nps-emails-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-nps-emails',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

### 4. Store Service Role Key

```sql
-- Store service role key for cron job authentication
ALTER DATABASE postgres SET "app.settings.service_role_key" TO 'your_service_role_key';
```

## Testing

Test the function manually:

```bash
npx supabase functions invoke send-nps-emails --method POST
```

## Monitoring

Check cron job status:

```sql
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## How It Works

1. Function runs every hour
2. Queries `nps_submissions` for emails scheduled to be sent (where `scheduled_send_at <= now()` and `sent_at IS NULL`)
3. Processes up to 50 emails per run
4. Sends emails via Resend API
5. Updates `sent_at` timestamp on success
6. Logs `send_error` on failure
