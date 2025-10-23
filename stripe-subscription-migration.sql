-- ============================================
-- STRIPE SUBSCRIPTION MIGRATION
-- ============================================
-- This migration adds only the subscription table
-- Safe to run on existing databases
-- ============================================

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  stripe_status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Prevent user modifications" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Prevent user updates" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Prevent user deletions" ON public.user_subscriptions;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Prevent users from modifying subscriptions (only webhooks can do this)
CREATE POLICY "Prevent user modifications" 
  ON public.user_subscriptions FOR INSERT 
  WITH CHECK (false);

CREATE POLICY "Prevent user updates" 
  ON public.user_subscriptions FOR UPDATE 
  USING (false);

CREATE POLICY "Prevent user deletions" 
  ON public.user_subscriptions FOR DELETE 
  USING (false);

-- Create trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);

