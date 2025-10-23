# Contents Database Setup

## Quick Setup - Run This SQL in Supabase

Your Contents tab now loads from the database instead of showing placeholder data!

### Step 1: Create the Contents Table

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs/sql/new)

2. Copy and paste this SQL:

```sql
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

-- Enable Row Level Security
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_contents_updated_at
  BEFORE UPDATE ON public.contents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

3. Click **"Run"**

4. You should see ✅ **Success**

### Step 2: Test It!

1. Go to your app: http://localhost:3000
2. Navigate to **Tools** → **Scrape Content**
3. Scrape some TikTok or Instagram videos
4. Go to **Contents** tab
5. You'll see your scraped content! 🎉

## What Changed?

### Before:
- ❌ Showed fake placeholder content
- ❌ Placeholder thumbnails (https://via.placeholder.com)
- ❌ Not personalized to you

### After:
- ✅ Loads YOUR scraped content from database
- ✅ No thumbnails/preview images shown
- ✅ Each user sees only their own content
- ✅ Content persists across sessions
- ✅ Fully searchable and filterable

## Features:
- **Row Level Security** - Users can only see their own content
- **Auto-save** - Scraped content automatically saves to your database
- **No Placeholders** - Clean, real data only
- **No Thumbnails** - Focus on text content (hooks, captions, transcripts)

## Verify Setup:

Check your contents table:
1. Go to [Table Editor](https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs/editor)
2. Click **"contents"** table
3. After scraping, you'll see your data here!

