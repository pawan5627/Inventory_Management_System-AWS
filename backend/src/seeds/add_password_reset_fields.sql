-- Add password reset token fields to users table
-- This allows users to reset their password via email

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;

-- Comment columns for documentation
COMMENT ON COLUMN users.reset_token IS 'Token for password reset, hashed for security';
COMMENT ON COLUMN users.reset_token_expires IS 'Expiration timestamp for reset token';
