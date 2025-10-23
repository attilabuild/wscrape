-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  niche TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create contents table
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT,
  caption TEXT,
  hook TEXT,
  transcript TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE,
  content_type TEXT,
  post_url TEXT,
  thumbnail TEXT,
  viral_score INTEGER DEFAULT 0,
  hashtags TEXT[],
  mentions TEXT[],
  platform TEXT DEFAULT 'tiktok',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for contents
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own contents" ON public.contents;
DROP POLICY IF EXISTS "Users can insert their own contents" ON public.contents;
DROP POLICY IF EXISTS "Users can update their own contents" ON public.contents;
DROP POLICY IF EXISTS "Users can delete their own contents" ON public.contents;

-- Create policies for contents
CREATE POLICY "Users can view their own contents" 
  ON public.contents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contents" 
  ON public.contents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contents" 
  ON public.contents FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contents" 
  ON public.contents FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for contents updated_at
DROP TRIGGER IF EXISTS set_contents_updated_at ON public.contents;
CREATE TRIGGER set_contents_updated_at
  BEFORE UPDATE ON public.contents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- STRIPE SUBSCRIPTION TABLES
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

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Prevent users from modifying subscriptions (only webhooks can do this)
DROP POLICY IF EXISTS "Prevent user modifications" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Prevent user updates" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Prevent user deletions" ON public.user_subscriptions;

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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
