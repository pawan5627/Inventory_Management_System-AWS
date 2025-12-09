-- Add phone and location columns to users table if they don't exist

DO $$ 
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(32);
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='location') THEN
        ALTER TABLE users ADD COLUMN location VARCHAR(128);
    END IF;
END $$;
