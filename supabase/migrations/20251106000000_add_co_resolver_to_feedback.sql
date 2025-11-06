-- Add co-resolver functionality to feedback table
-- This allows tracking a second staff member who helped resolve feedback

-- Add co_resolver_id column to feedback table
ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS co_resolver_id uuid REFERENCES employees(id);

-- Add enable_co_resolving setting to venues table
ALTER TABLE venues
ADD COLUMN IF NOT EXISTS enable_co_resolving boolean DEFAULT false;

-- Add comment to explain the columns
COMMENT ON COLUMN feedback.co_resolver_id IS 'Optional second staff member who helped resolve the feedback';
COMMENT ON COLUMN venues.enable_co_resolving IS 'Enable co-resolver feature for this venue - allows selecting a secondary staff member when resolving feedback';

-- Create index for performance when querying by co_resolver
CREATE INDEX IF NOT EXISTS idx_feedback_co_resolver_id ON feedback(co_resolver_id) WHERE co_resolver_id IS NOT NULL;
