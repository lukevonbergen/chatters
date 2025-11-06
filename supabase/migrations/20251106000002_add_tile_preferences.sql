-- Add preference columns to custom_dashboard_tiles table
ALTER TABLE custom_dashboard_tiles
ADD COLUMN IF NOT EXISTS date_range_preset text DEFAULT 'all_time',
ADD COLUMN IF NOT EXISTS chart_type text DEFAULT 'donut';

-- Add comment for clarity
COMMENT ON COLUMN custom_dashboard_tiles.date_range_preset IS 'Date range preset: 7_days, this_month, last_month, last_quarter, all_time';
COMMENT ON COLUMN custom_dashboard_tiles.chart_type IS 'Chart visualization type: kpi, bar, line, donut';
