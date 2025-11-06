-- Optimized function to calculate overview stats in one query
-- This replaces the 4 separate queries + JavaScript calculations

CREATE OR REPLACE FUNCTION get_overview_stats(p_venue_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
    today_start timestamptz;
    yesterday_start timestamptz;
BEGIN
    -- Calculate date boundaries
    today_start := date_trunc('day', now() AT TIME ZONE 'UTC');
    yesterday_start := today_start - interval '1 day';

    -- Calculate all stats in a single query using CTEs
    WITH today_feedback AS (
        SELECT
            session_id,
            rating,
            created_at,
            resolved_at,
            is_actioned
        FROM feedback
        WHERE venue_id = p_venue_id
          AND created_at >= today_start
          AND created_at < today_start + interval '1 day'
    ),
    yesterday_feedback AS (
        SELECT
            session_id,
            rating,
            resolved_at,
            is_actioned
        FROM feedback
        WHERE venue_id = p_venue_id
          AND created_at >= yesterday_start
          AND created_at < today_start
    ),
    today_assistance AS (
        SELECT
            id,
            created_at,
            acknowledged_at,
            resolved_at
        FROM assistance_requests
        WHERE venue_id = p_venue_id
          AND created_at >= today_start
          AND created_at < today_start + interval '1 day'
    ),
    yesterday_assistance AS (
        SELECT
            id,
            created_at,
            resolved_at
        FROM assistance_requests
        WHERE venue_id = p_venue_id
          AND created_at >= yesterday_start
          AND created_at < today_start
    ),
    today_stats AS (
        SELECT
            -- Session count
            COUNT(DISTINCT tf.session_id) as sessions,
            -- Average satisfaction
            AVG(tf.rating) FILTER (WHERE tf.rating IS NOT NULL) as avg_satisfaction,
            -- Response time (in milliseconds)
            AVG(
                EXTRACT(EPOCH FROM (tf.resolved_at - tf.created_at)) * 1000
            ) FILTER (WHERE tf.resolved_at IS NOT NULL AND tf.is_actioned = true) as feedback_response_ms,
            -- Resolved feedback sessions
            COUNT(DISTINCT tf.session_id) FILTER (WHERE tf.resolved_at IS NOT NULL AND tf.is_actioned = true) as resolved_feedback_sessions,
            -- Peak hour
            MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM tf.created_at)) as peak_hour
        FROM today_feedback tf
    ),
    today_assistance_stats AS (
        SELECT
            COUNT(*) as total_assistance,
            COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) as resolved_assistance,
            AVG(
                EXTRACT(EPOCH FROM (resolved_at - created_at)) * 1000
            ) FILTER (WHERE resolved_at IS NOT NULL) as assistance_response_ms,
            COUNT(*) FILTER (WHERE resolved_at IS NULL) as active_alerts
        FROM today_assistance
    ),
    yesterday_stats AS (
        SELECT
            COUNT(DISTINCT yf.session_id) as sessions,
            AVG(yf.rating) FILTER (WHERE yf.rating IS NOT NULL) as avg_satisfaction,
            COUNT(DISTINCT yf.session_id) FILTER (WHERE yf.resolved_at IS NOT NULL AND yf.is_actioned = true) as resolved_feedback_sessions
        FROM yesterday_feedback yf
    ),
    yesterday_assistance_stats AS (
        SELECT
            COUNT(*) as total_assistance,
            COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) as resolved_assistance,
            AVG(
                EXTRACT(EPOCH FROM (resolved_at - created_at)) * 1000
            ) FILTER (WHERE resolved_at IS NOT NULL) as assistance_response_ms
        FROM yesterday_assistance
    )
    SELECT json_build_object(
        'todaySessions', COALESCE(ts.sessions, 0),
        'avgSatisfaction', ROUND(COALESCE(ts.avg_satisfaction, 0)::numeric, 1),
        'avgResponseTimeMs', COALESCE(
            (COALESCE(ts.feedback_response_ms, 0) + COALESCE(tas.assistance_response_ms, 0)) /
            NULLIF(
                CASE WHEN ts.feedback_response_ms IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN tas.assistance_response_ms IS NOT NULL THEN 1 ELSE 0 END,
                0
            ),
            0
        ),
        'completionRate', CASE
            WHEN (ts.sessions + COALESCE(tas.total_assistance, 0)) > 0
            THEN ROUND((ts.resolved_feedback_sessions + COALESCE(tas.resolved_assistance, 0))::numeric /
                 (ts.sessions + COALESCE(tas.total_assistance, 0)) * 100)
            ELSE 0
        END,
        'activeAlerts', COALESCE(tas.active_alerts, 0),
        'resolvedToday', COALESCE(ts.resolved_feedback_sessions + tas.resolved_assistance, 0),
        'peakHour', ts.peak_hour,
        -- Yesterday's stats for trends
        'yesterdaySessions', COALESCE(ys.sessions, 0),
        'yesterdayAvgSatisfaction', ROUND(COALESCE(ys.avg_satisfaction, 0)::numeric, 1),
        'yesterdayAvgResponseTimeMs', COALESCE(yas.assistance_response_ms, 0),
        'yesterdayCompletionRate', CASE
            WHEN (ys.sessions + COALESCE(yas.total_assistance, 0)) > 0
            THEN (ys.resolved_feedback_sessions + COALESCE(yas.resolved_assistance, 0))::numeric /
                 (ys.sessions + COALESCE(yas.total_assistance, 0)) * 100
            ELSE 0
        END
    ) INTO result
    FROM today_stats ts
    CROSS JOIN today_assistance_stats tas
    CROSS JOIN yesterday_stats ys
    CROSS JOIN yesterday_assistance_stats yas;

    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_overview_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_overview_stats(uuid) TO anon;

COMMENT ON FUNCTION get_overview_stats IS 'Optimized function to calculate all overview dashboard stats in a single query instead of 4+ separate queries';
