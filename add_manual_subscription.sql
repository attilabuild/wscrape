-- Option 1: Grant premium_access (simplest - no Stripe needed)
-- This gives the user premium access without requiring a Stripe subscription
INSERT INTO user_subscriptions (
  user_id,
  premium_access,
  stripe_status,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
)
VALUES (
  '45a898a5-1b6e-4516-bb27-256c8352574a',
  true,
  'active',
  NOW(),
  NOW() + INTERVAL '1 month',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  premium_access = true,
  stripe_status = 'active',
  current_period_end = NOW() + INTERVAL '1 month',
  updated_at = NOW();

-- Option 2: Create a full subscription record (if you want to track it like a Stripe subscription)
-- Use this if you want the subscription to appear in your system like a real Stripe subscription
INSERT INTO user_subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_status,
  stripe_price_id,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  premium_access,
  created_at,
  updated_at
)
VALUES (
  '45a898a5-1b6e-4516-bb27-256c8352574a',
  'manual_customer_' || '45a898a5-1b6e-4516-bb27-256c8352574a', -- Fake customer ID
  'manual_sub_' || '45a898a5-1b6e-4516-bb27-256c8352574a', -- Fake subscription ID
  'active',
  NULL, -- No price ID for manual
  NOW(),
  NOW() + INTERVAL '1 month',
  false,
  true, -- Also grant premium_access
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  stripe_status = 'active',
  premium_access = true,
  current_period_end = NOW() + INTERVAL '1 month',
  updated_at = NOW();

-- Verify the subscription was added
SELECT 
  user_id,
  stripe_status,
  premium_access,
  current_period_end,
  created_at
FROM user_subscriptions
WHERE user_id = '45a898a5-1b6e-4516-bb27-256c8352574a';

