# 🎁 How to Give Users Premium Access Without Subscription

## Method 1: Add `premium_access` Column to Database

### Step 1: Go to Supabase SQL Editor
URL: https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs/editor

### Step 2: Add the Column
Run this SQL:

```sql
-- Add premium_access column to user_subscriptions table
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS premium_access BOOLEAN DEFAULT FALSE;

-- Optional: Grant premium access to specific user
-- Replace 'USER_ID_HERE' with actual user ID
UPDATE user_subscriptions
SET premium_access = TRUE
WHERE user_id = 'USER_ID_HERE';
```

### Step 3: Update the Code
The `lib/subscription-guard.ts` needs to check for `premium_access`:

```typescript
// Check if user has premium access OR active subscription
const hasAccess = hasActiveSubscription || subscription.premium_access;
```

---

## Method 2: Direct Database Update (Easier)

### Give Premium to a User

1. Go to Supabase Dashboard → Table Editor → `user_subscriptions`
2. Find the user you want to give premium to
3. Add a new row OR update existing row with:
   - `user_id`: The user's ID
   - `premium_access`: `true` (boolean)

---

## Method 3: Add User to a "VIP" List

### Create a VIP Users Table

Run this SQL in Supabase:

```sql
-- Create VIP users table
CREATE TABLE IF NOT EXISTS vip_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_vip_users_user_id ON vip_users(user_id);
```

### Grant Premium to User

```sql
-- Add user to VIP list (replace with actual user ID)
INSERT INTO vip_users (user_id, notes)
VALUES ('USER_ID_HERE', 'Manual premium access')
ON CONFLICT (user_id) DO NOTHING;
```

### Update Code to Check VIP List

Modify `lib/subscription-guard.ts`:

```typescript
export async function verifyActiveSubscription(userId: string): Promise<SubscriptionStatus> {
  const supabase = createServerSupabaseClient();
  
  // Check subscription first
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_status, current_period_end, premium_access')
    .eq('user_id', userId)
    .single();

  if (!subscription) {
    // Check if user is in VIP list
    const { data: vip } = await supabase
      .from('vip_users')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (vip) {
      return { isActive: true, status: 'vip', periodEnd: '2099-12-31' };
    }
    
    return { isActive: false };
  }

  // Check if has premium access OR active subscription
  const isActiveStatus = ['active', 'trialing'].includes(subscription.stripe_status);
  const notExpired = subscription.current_period_end 
    ? new Date(subscription.current_period_end) > new Date() 
    : false;
  
  const isActive = isActiveStatus && notExpired;
  const hasPremiumAccess = subscription.premium_access === true;

  return {
    isActive: isActive || hasPremiumAccess,
    status: hasPremiumAccess ? 'premium' : subscription.stripe_status,
    periodEnd: subscription.current_period_end || '2099-12-31'
  };
}
```

---

## 🎯 Quick Answer: Simplest Method

**Just run this SQL in Supabase:**

```sql
-- Give premium access to a user (replace USER_ID_HERE)
UPDATE user_subscriptions
SET premium_access = TRUE,
    stripe_status = 'active',
    current_period_end = '2099-12-31'
WHERE user_id = 'USER_ID_HERE';

-- If user doesn't have a subscription row yet:
INSERT INTO user_subscriptions (user_id, premium_access, stripe_status, current_period_end)
VALUES ('USER_ID_HERE', TRUE, 'active', '2099-12-31')
ON CONFLICT (user_id) DO UPDATE 
SET premium_access = TRUE;
```

---

## 📝 How to Find User ID

1. Go to Supabase Dashboard → Authentication → Users
2. Search for the user's email
3. Copy their UUID

Or query:

```sql
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

