-- Create manager_invitations table for tracking manager invitation flow
CREATE TABLE IF NOT EXISTS manager_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    venue_ids UUID[] NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manager_invitations_email ON manager_invitations(email);
CREATE INDEX IF NOT EXISTS idx_manager_invitations_token ON manager_invitations(token);
CREATE INDEX IF NOT EXISTS idx_manager_invitations_account_id ON manager_invitations(account_id);
CREATE INDEX IF NOT EXISTS idx_manager_invitations_status ON manager_invitations(status);
CREATE INDEX IF NOT EXISTS idx_manager_invitations_expires_at ON manager_invitations(expires_at);

-- Add RLS policies
ALTER TABLE manager_invitations ENABLE ROW LEVEL SECURITY;

-- Master users can view invitations for their account
CREATE POLICY "Master users can view their account invitations"
    ON manager_invitations FOR SELECT
    USING (
        account_id IN (
            SELECT account_id FROM users WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Master users can create invitations for their account
CREATE POLICY "Master users can create invitations"
    ON manager_invitations FOR INSERT
    WITH CHECK (
        account_id IN (
            SELECT account_id FROM users WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Master users can update invitations for their account
CREATE POLICY "Master users can update their account invitations"
    ON manager_invitations FOR UPDATE
    USING (
        account_id IN (
            SELECT account_id FROM users WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Master users can delete invitations for their account
CREATE POLICY "Master users can delete their account invitations"
    ON manager_invitations FOR DELETE
    USING (
        account_id IN (
            SELECT account_id FROM users WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Admin users have full access
CREATE POLICY "Admin users have full access to invitations"
    ON manager_invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add comment
COMMENT ON TABLE manager_invitations IS 'Tracks manager invitation lifecycle from creation to acceptance';
