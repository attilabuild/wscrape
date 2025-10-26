-- Add unique constraint to user_subscriptions table if it doesn't exist
-- This allows ON CONFLICT to work properly

-- First, check if constraint exists, if not add it
ALTER TABLE user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_key;

ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);

-- Verify the constraint was added
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'user_subscriptions' 
AND constraint_type = 'UNIQUE';

