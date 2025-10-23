# Database Setup for Profile Storage

## Quick Setup (2 minutes)

Your profile preferences (Name, Niche, Bio) will now be saved to Supabase instead of local storage!

### Step 1: Create the Profiles Table

1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs/sql/new)

2. Copy and paste this SQL:

```sql
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

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

3. Click **"Run"** or press `Cmd/Ctrl + Enter`

4. You should see ✅ **Success. No rows returned**

### Step 2: Test It!

1. Go to your app: http://localhost:3000
2. Navigate to **Profile**
3. Fill in:
   - **Name**: Your name
   - **Niche**: Select your content niche
   - **Bio**: Write about yourself
4. Click **"Save Preferences"**
5. You should see: **✓ Preferences saved successfully!**

### Step 3: Verify in Supabase

1. Go to [Table Editor](https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs/editor)
2. Click on **"profiles"** table
3. You'll see your saved data! 🎉

## What Changed?

### Before:
- ❌ Preferences stored in browser (lost when you clear cache)
- ❌ Not synced across devices
- ❌ No database persistence

### After:
- ✅ Saved to Supabase database
- ✅ Synced across all your devices
- ✅ Persists forever
- ✅ Row Level Security (users can only see their own data)

## Security Features

- **Row Level Security (RLS)** is enabled
- Each user can only:
  - View their own profile
  - Create their own profile
  - Update their own profile
- No user can see or modify another user's data

## Troubleshooting

### Error: "relation 'public.profiles' does not exist"
→ Run the SQL script in Step 1 again

### Error: "permission denied for table profiles"
→ Make sure you're logged in and RLS policies are set up correctly

### Data not saving?
1. Check browser console for errors
2. Verify you're logged in
3. Make sure the SQL script ran successfully

## Optional: View Your Data

You can query your profile data in SQL Editor:

```sql
SELECT * FROM public.profiles WHERE id = auth.uid();
```

This will show your saved preferences!

