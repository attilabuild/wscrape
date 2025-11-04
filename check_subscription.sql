-- Check subscription for specific user
SELECT 
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_status,
  current_period_end,
  premium_access,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id = '73a20bc0-6324-4978-b6a7-21570152c94e';

-- Also check all recent subscriptions
SELECT 
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_status,
  current_period_end,
  premium_access,
  created_at,
  updated_at
FROM user_subscriptions
ORDER BY created_at DESC
LIMIT 20;

-- Check if there are any subscriptions without user_id (unlinked)
SELECT 
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_status,
  current_period_end,
  premium_access,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id IS NULL OR user_id = '';
