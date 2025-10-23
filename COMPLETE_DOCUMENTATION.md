# wscrape - Complete Application Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Core Components](#core-components)
8. [Libraries & Utilities](#libraries--utilities)
9. [Authentication System](#authentication-system)
10. [Setup & Installation](#setup--installation)
11. [Environment Variables](#environment-variables)
12. [Deployment](#deployment)

---

## Application Overview

**wscrape** is a complete AI-powered social media intelligence platform designed for content creators and marketers. It provides comprehensive tools to:

- **Scrape viral content** from TikTok and Instagram
- **Analyze comment sentiment** and engagement patterns
- **Generate AI-powered content** using OpenAI GPT models
- **Predict viral potential** of content before posting
- **Manage content library** with advanced search and filtering
- **Analyze video performance** across platforms

### Key Value Propositions
- 🤖 **AI-Powered Insights**: Deep learning algorithms analyze what makes content go viral
- 📊 **Data-Driven Decisions**: Performance metrics and competitor analysis
- ✨ **Content Generation**: Automated viral content creation based on winning patterns
- 🎯 **Viral Prediction**: Predict engagement before posting
- 📚 **Content Management**: Organize and search your content library

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.4.6 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Forms**: Formspree (@formspree/react)

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI/ML**: OpenAI API (GPT models)
- **Web Scraping**: Apify Client

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Storage**: Supabase Storage (for user data)

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js with Turbopack
- **Linter**: ESLint (Next.js config)
- **Type Checking**: TypeScript strict mode

---

## Architecture

### Application Structure

```
wscrape/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── ai-analysis/         # AI content analysis
│   │   ├── ai-assistant/        # Chatbot AI assistant
│   │   ├── analyze-comments/    # Comment sentiment analysis
│   │   ├── content/             # Content CRUD operations
│   │   ├── profile/             # User profile management
│   │   ├── scrape/              # Content scraping
│   │   ├── scrape-comments/     # Comment scraping
│   │   ├── video-analysis/      # Video performance analysis
│   │   └── viral-analysis/      # Viral potential prediction
│   ├── dashboard/               # Main dashboard pages
│   ├── login/                   # Authentication pages
│   ├── signup/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── video-analysis/          # Standalone video analysis
│   ├── layout.tsx               # Root layout with SEO
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Tools.tsx
│   │   ├── Contents.tsx
│   │   ├── Profile.tsx
│   │   ├── ContentGrid.tsx
│   │   ├── VideoAnalysis.tsx
│   │   └── ... (other components)
│   └── ProtectedRoute.tsx       # Auth wrapper component
├── lib/                          # Core libraries & utilities
│   ├── supabase.ts              # Supabase client
│   ├── ai-analysis.ts           # AI analysis engine
│   ├── ai-content-generator.ts  # Content generation
│   ├── viral-predictor.ts       # Viral prediction ML
│   ├── apify-scraper.ts         # Apify integration
│   ├── scraper.ts               # Custom scraper
│   ├── content-variations.ts    # Content variation engine
│   ├── mass-creator-analyzer.ts # Bulk analysis
│   └── viral-database.ts        # Viral content database
├── data/                         # Static data
│   └── viral-database.json      # Pre-trained viral patterns
├── public/                       # Static assets
├── supabase-schema.sql          # Database schema
├── tsconfig.json                # TypeScript config
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind config
└── package.json                 # Dependencies
```

### Data Flow

```
User Request
    ↓
Next.js Page/Component
    ↓
API Route (Server-Side)
    ↓
Service Layer (lib/)
    ↓
External APIs (Apify, OpenAI) / Database (Supabase)
    ↓
Response Processing
    ↓
UI Update
```

### Key Architectural Patterns

1. **Server-Side API Routes**: All data fetching and processing happens on the server
2. **Row-Level Security (RLS)**: Database-level security with Supabase
3. **Client Components**: Interactive UI with React hooks
4. **Protected Routes**: Authentication-based access control
5. **Real-time Updates**: Supabase subscriptions for live data
6. **AI-First Design**: AI integration at every step

---

## Features

### 1. Content Scraping
- **Platform Support**: TikTok, Instagram
- **Data Extracted**:
  - Video metadata (views, likes, comments, shares)
  - Captions and hooks
  - Transcripts (where available)
  - Hashtags and mentions
  - Upload dates and engagement rates
- **Storage**: Automatically saves to user's content library
- **Provider**: Apify (production) with fallback to mock data

### 2. Comment Analysis
- **Platform**: Instagram (primary)
- **Analysis Features**:
  - Sentiment analysis (positive, neutral, negative)
  - Theme extraction
  - Top comments identification
  - Actionable insights generation
- **Export**: CSV and JSON formats

### 3. AI Content Generation
- **Input Methods**:
  - Niche-based generation
  - Competitor analysis-based
  - User profile-personalized
- **Content Types**:
  - Hooks
  - Full captions
  - Hashtag strategies
  - Content variations (10+ per idea)
- **Templates**: 8+ pre-built viral templates
- **Personalization**: Uses user profile (name, niche, bio) for context

### 4. Viral Prediction
- **Analysis Factors**:
  - Hook strength (25% weight)
  - Emotional impact (20%)
  - Content length optimization (10%)
  - Hashtag strategy (8%)
  - Timing factors (12%)
  - Engagement elements (15%)
  - Niche alignment (10%)
- **Outputs**:
  - Viral probability (0-100%)
  - Expected engagement rate
  - Expected views/likes/comments
  - Optimization recommendations
  - Confidence score

### 5. Content Management
- **Library Features**:
  - Search by keywords
  - Filter by niche, creator, viral score
  - Sort by engagement, date, views
  - Bulk operations
- **Content Actions**:
  - Copy to clipboard
  - Export (CSV, JSON)
  - Edit and update
  - Delete
- **Statistics Dashboard**:
  - Total content pieces
  - Average engagement
  - Top performers
  - Content distribution

### 6. Video Analysis
- **Standalone Tool**: Dedicated page for in-depth analysis
- **Embedded Version**: Quick analysis in Tools section
- **Analysis Types**:
  - Performance metrics
  - Hook effectiveness
  - Caption quality
  - Hashtag performance
  - Optimal posting times

### 7. AI Content Assistant
- **Chatbot Interface**: Conversational AI for content strategy
- **Capabilities**:
  - Content ideas and brainstorming
  - Hook and caption writing
  - Hashtag optimization
  - Platform-specific tips
  - Engagement strategies
- **Context-Aware**: Uses conversation history and user profile

### 8. User Profile Management
- **Profile Fields**:
  - Name
  - Content niche
  - Bio/Description
- **Integration**: Profile data enhances AI content generation
- **Storage**: Supabase with RLS

---

## Database Schema

### Tables

#### 1. `profiles` Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  niche TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Store user profile information for personalized AI content generation

**Policies**:
- Users can view only their own profile
- Users can insert/update only their own profile

#### 2. `contents` Table
```sql
CREATE TABLE public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Store scraped and generated content for each user

**Policies**:
- Users can only access their own content (SELECT, INSERT, UPDATE, DELETE)

**Indexes** (recommended for production):
- `user_id` (automatic via foreign key)
- `viral_score DESC` (for sorting)
- `created_at DESC` (for sorting)
- GIN index on `hashtags` (for array searching)

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- No cross-user data leakage
- Database-level security (not just application-level)

---

## API Routes

### Content Scraping

#### `POST /api/scrape`
Scrape content from TikTok or Instagram profiles.

**Request Body**:
```typescript
{
  username: string;      // Without @ symbol
  platform: 'tiktok' | 'instagram';
  count: number;         // Number of videos (default: 10)
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    videos: VideoData[];
    metadata: {
      username: string;
      platform: string;
      count: number;
      scrapedAt: string;
      dataSource: string;
    }
  }
}
```

**Implementation**: Uses Apify scrapers for real data extraction

---

#### `POST /api/scrape-comments`
Scrape comments from Instagram posts.

**Request Body**:
```typescript
{
  postUrl: string;       // Instagram post URL
  platform: 'instagram';
  count: number;         // Number of comments (50-500)
}
```

**Response**:
```typescript
{
  success: boolean;
  comments: Comment[];
  count: number;
}
```

---

### AI Analysis

#### `POST /api/ai-analysis`
Multi-purpose AI analysis endpoint.

**Actions**:
1. `analyze_content` - Analyze scraped content performance
2. `generate_suggestions` - Generate AI content ideas
3. `optimize_content` - Optimize content for virality
4. `competitor_analysis` - Analyze competitor strategies
5. `hashtag_strategy` - Generate hashtag recommendations

**Request Body**:
```typescript
{
  action: string;
  payload: {
    // Action-specific data
  }
}
```

**Example (analyze_content)**:
```typescript
{
  action: 'analyze_content',
  payload: {
    videos: VideoData[];
    username: string;
    niche: string;
  }
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    analysis: AnalysisResult;
    metrics: PerformanceMetrics;
    summary: Summary;
    actionableInsights: Insights;
  }
}
```

---

#### `POST /api/viral-analysis`
Predict viral potential of content.

**Request Body**:
```typescript
{
  action: 'predict_viral',
  payload: {
    content: string;
    contentType: string;
    findOptimalTime: boolean;
  }
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    prediction: {
      viralProbability: number;
      expectedEngagement: number;
      expectedViews: number;
      confidenceScore: number;
    };
    recommendations: string[];
    optimalTime?: Date;
  }
}
```

---

#### `POST /api/analyze-comments`
Analyze sentiment and themes in comments.

**Request Body**:
```typescript
{
  comments: Comment[];
}
```

**Response**:
```typescript
{
  success: boolean;
  analysis: {
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    themes: string[];
    topComments: Comment[];
    suggestions: string[];
  }
}
```

---

### Content Management

#### `POST /api/content`
CRUD operations for user content library.

**Actions**:
- `get_all` - Get all user content
- `search` - Search content by query
- `filter_by_niche` - Filter by niche
- `save` - Save new content
- `update` - Update existing content
- `delete` - Delete content

**Request Body**:
```typescript
{
  action: string;
  query?: string;
  niche?: string;
  data?: ContentData;
}
```

---

### Profile Management

#### `POST /api/profile`
User profile operations.

**Actions**:
- `get` - Fetch user profile
- `save` - Save/update profile

**Request Body**:
```typescript
{
  action: 'get' | 'save';
  data?: {
    name: string;
    niche: string;
    bio: string;
  }
}
```

---

### AI Assistant

#### `POST /api/ai-assistant`
Conversational AI for content strategy.

**Request Body**:
```typescript
{
  message: string;
  history: Message[];
  userProfile: UserProfile;
}
```

**Response**:
```typescript
{
  success: boolean;
  response: string;
}
```

---

## Core Components

### Dashboard Components

#### 1. **Sidebar** (`components/dashboard/Sidebar.tsx`)
- Navigation menu
- Active tab highlighting
- Sub-navigation for Tools
- Mobile responsive drawer

#### 2. **Header** (`components/dashboard/Header.tsx`)
- Page title display
- Contextual information
- User status

#### 3. **Tools** (`components/dashboard/Tools.tsx`)
Main tools interface with sub-pages:
- **Scrape**: Content scraping form and results
- **Generate**: AI content generation
- **Predict**: Viral prediction tool
- **Templates**: Quick viral templates
- **Comments**: Comment scraping and analysis
- **Video Analysis**: Embedded video analyzer
- **AI Assistant**: Chatbot interface

Features:
- State management for all tools
- API integration
- Results visualization
- Export functionality

#### 4. **Contents** (`components/dashboard/Contents.tsx`)
Content library management:
- Grid/List view of saved content
- Search and filter controls
- Statistics dashboard
- Bulk actions
- Content preview
- Copy/export functionality

#### 5. **Profile** (`components/dashboard/Profile.tsx`)
User profile editor:
- Name, niche, bio fields
- Profile picture (future)
- Preferences
- Logout functionality

#### 6. **ContentGrid** (`components/dashboard/ContentGrid.tsx`)
Reusable content display component:
- Card-based layout
- Engagement metrics
- Hook preview
- Copy/save actions
- Responsive grid

#### 7. **VideoAnalysis** (`components/dashboard/VideoAnalysis.tsx`)
Standalone video analysis tool:
- URL input for any video
- Deep performance analysis
- Hook effectiveness scoring
- Optimization recommendations

---

### Authentication Components

#### **ProtectedRoute** (`components/ProtectedRoute.tsx`)
HOC for route protection:
- Session checking
- Auto-redirect to login
- Loading states
- Auth state listener

**Usage**:
```tsx
<ProtectedRoute>
  <DashboardContent />
</ProtectedRoute>
```

---

## Libraries & Utilities

### 1. **Supabase Client** (`lib/supabase.ts`)
```typescript
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

**Features**:
- Persistent sessions
- Auto token refresh
- Client-side auth

---

### 2. **AI Analysis Engine** (`lib/ai-analysis.ts`)
Core AI analysis functionality using OpenAI GPT models.

**Key Classes**:
- `AIAnalysisEngine`: Main analysis orchestrator

**Methods**:
- `analyzeScrapedContent()`: Analyze performance patterns
- `generateContentSuggestions()`: Create AI content ideas
- `optimizeForViral()`: Improve content for virality
- `analyzeCompetitorStrategy()`: Competitive analysis
- `generateHashtagStrategy()`: Smart hashtag selection

**Features**:
- Fallback to rule-based analysis when API unavailable
- Context-aware generation using user profiles
- Pattern recognition from viral database
- Chain-of-thought reasoning for optimization

---

### 3. **AI Content Generator** (`lib/ai-content-generator.ts`)
Advanced content generation with viral templates.

**Key Classes**:
- `AIContentGenerator`: Template-based content creation

**Features**:
- 8+ pre-built viral templates (Question Hook, Absolute Statement, Numbered List, etc.)
- Viral word banks (power words, emotion words, action words)
- Niche-specific hashtag databases
- Hook variation generator (10+ variations per hook)
- Content calendar generator (30-day plans)

**Templates**:
1. **Question Hook**: "What if I told you [statement]?"
2. **Absolute Statement**: "[Never/Always] [action] if you want [outcome]"
3. **Numbered Secrets**: "[Number] [secrets] [target audience] [action]"
4. **Controversial Take**: "Unpopular opinion: [statement]"
5. **Story Hook**: "[Time] ago, [situation]. Today, [transformation]."
6. **Insider Secret**: "The [industry] secret nobody talks about"
7. **Comparison Hook**: "[Successful] vs [unsuccessful]: [difference]"
8. **Challenge Hook**: "I challenge you to [action] for [timeframe]"

---

### 4. **Viral Predictor** (`lib/viral-predictor.ts`)
Machine learning-based viral potential prediction.

**Key Classes**:
- `ViralPredictor`: ML prediction engine

**Features**:
- Multi-factor viral scoring (7 weighted factors)
- Engagement metric prediction
- Optimal posting time finder
- Competitor pattern analysis
- Confidence scoring
- Model training on historical data

**Prediction Factors**:
- Hook Strength (25%)
- Emotional Impact (20%)
- Content Length (10%)
- Hashtag Strategy (8%)
- Time Factors (12%)
- Engagement Elements (15%)
- Niche Alignment (10%)

**Niche Benchmarks**:
```typescript
{
  business: { avgEngagement: 8.5%, viralThreshold: 15.0% },
  motivation: { avgEngagement: 11.2%, viralThreshold: 18.0% },
  fitness: { avgEngagement: 9.8%, viralThreshold: 16.0% },
  lifestyle: { avgEngagement: 7.3%, viralThreshold: 12.0% },
  education: { avgEngagement: 6.9%, viralThreshold: 11.0% }
}
```

---

### 5. **Apify Scraper** (`lib/apify-scraper.ts`)
Integration with Apify for real content scraping.

**Key Classes**:
- `ApifyScraper`: Apify API client wrapper

**Features**:
- TikTok profile scraping (Apify Actor)
- Instagram profile scraping (Apify Actor)
- Comment scraping (Instagram)
- Retry logic with exponential backoff
- Data transformation and normalization
- Error handling and fallback

**Apify Actors Used**:
- TikTok Profile Scraper
- Instagram Profile Scraper
- Instagram Comment Scraper

---

### 6. **Content Variations** (`lib/content-variations.ts`)
Generate multiple variations of successful content.

**Features**:
- Synonym replacement
- Structure preservation
- Tone adjustments
- Hook transformations
- A/B testing variations

---

### 7. **Viral Database** (`lib/viral-database.ts` + `data/viral-database.json`)
Pre-trained dataset of viral content patterns.

**Data Structure**:
```typescript
{
  posts: ViralPost[];
  patterns: ContentPattern[];
  templates: Template[];
  performanceBenchmarks: Benchmarks;
}
```

**Usage**: Training data for AI models and pattern recognition

---

## Authentication System

### Flow Diagram

```
User → Landing Page
  ↓
  Login/Signup → Supabase Auth
  ↓
  Session Created
  ↓
  Dashboard (Protected)
  ↓
  Session Refresh (Auto)
  ↓
  Logout → Session Cleared → Landing Page
```

### Components

#### 1. **Login** (`app/login/page.tsx`)
- Email/password authentication
- Google OAuth (optional)
- Forgot password link
- Auto-redirect if already logged in
- Error handling

#### 2. **Signup** (`app/signup/page.tsx`)
- Email/password registration
- Password confirmation
- Google OAuth sign-up
- Email verification message
- Auto-redirect after signup

#### 3. **Forgot Password** (`app/forgot-password/page.tsx`)
- Email input for reset
- Reset email sending
- Success confirmation

#### 4. **Reset Password** (`app/reset-password/page.tsx`)
- New password input
- Password confirmation
- Token validation
- Redirect to login after reset

### Session Management

**Client-Side**:
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) router.push('/login');
```

**Protected Routes**:
```typescript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

**Logout**:
```typescript
await supabase.auth.signOut();
router.push('/');
```

### Security Features

1. **Row Level Security (RLS)**: Database-level access control
2. **JWT Tokens**: Secure session tokens
3. **Auto Token Refresh**: Seamless session extension
4. **Email Verification**: Optional email confirmation
5. **Password Reset**: Secure password recovery
6. **Google OAuth**: Alternative authentication method

---

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Apify account (for scraping)
- OpenAI account (for AI features)

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd wscrape
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables

Create `.env.local` in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qwteebuimebslzzqzgrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Apify Configuration
APIFY_API_TOKEN=your_apify_token_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key_here
```

### Step 4: Setup Supabase Database

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs/sql/new)
2. Run the SQL from `supabase-schema.sql`
3. Verify tables are created:
   - `profiles`
   - `contents`

### Step 5: Configure Authentication (Optional)

**Enable Google OAuth**:
1. Go to Supabase → Authentication → Providers
2. Enable Google provider
3. Add Google Cloud OAuth credentials
4. Configure redirect URIs

**Email Settings**:
1. Go to Supabase → Authentication → Settings
2. Configure email templates
3. (Optional) Disable email confirmation for testing

### Step 6: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 7: Test the Application

1. **Signup**: Create a new account
2. **Profile**: Set your name, niche, and bio
3. **Scrape**: Test content scraping
4. **Generate**: Test AI content generation
5. **Contents**: Verify content library

---

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `APIFY_API_TOKEN` | Apify API token | Apify Console → Settings → Integrations |
| `OPENAI_API_KEY` | OpenAI API key | OpenAI Platform → API Keys |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | App URL for redirects | `http://localhost:3000` |
| `FORMSPREE_FORM_ID` | Contact form ID | N/A |

### Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use different keys** for development and production
3. **Rotate API keys** regularly
4. **Limit API key permissions** to minimum required
5. **Use Vercel Environment Variables** for production

---

## Deployment

### Vercel Deployment (Recommended)

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

#### Step 2: Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Step 3: Add Environment Variables
In Vercel dashboard → Project → Settings → Environment Variables:

Add all variables from `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `APIFY_API_TOKEN`
- `OPENAI_API_KEY`

#### Step 4: Deploy
Click "Deploy" and wait for build to complete.

#### Step 5: Configure Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records
4. Wait for SSL certificate provisioning

---

### Alternative Deployment Options

#### 1. **Netlify**
```bash
npm run build
netlify deploy --prod --dir=.next
```

#### 2. **Docker**
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t wscrape .
docker run -p 3000:3000 wscrape
```

#### 3. **Self-Hosted (PM2)**
```bash
npm run build
pm2 start npm --name "wscrape" -- start
pm2 save
pm2 startup
```

---

## Application Flow Examples

### Example 1: Content Scraping Flow

```
1. User navigates to Dashboard → Tools → Scrape
2. Enters Instagram username "hormozi"
3. Clicks "Analyze @hormozi"
4. Frontend calls POST /api/scrape
   {
     username: "hormozi",
     platform: "instagram",
     count: 10
   }
5. API route initializes ApifyScraper
6. Apify scrapes 10 recent videos
7. Data is transformed and returned
8. Frontend displays results in ContentGrid
9. AI analysis runs automatically
10. User can save content to library
11. Content saved to Supabase contents table
```

---

### Example 2: AI Content Generation Flow

```
1. User navigates to Dashboard → Tools → Generate
2. Selects niche: "Business"
3. Selects quantity: "10 Ideas"
4. Clicks "Generate Content"
5. Frontend calls POST /api/ai-analysis
   {
     action: "generate_suggestions",
     payload: {
       niche: "business",
       count: 10,
       profileContext: { name: "John", niche: "Business", bio: "..." },
       savedContent: [...]
     }
   }
6. API route initializes AIAnalysisEngine
7. Engine selects relevant templates
8. OpenAI GPT generates content ideas
9. Content is ranked by viral potential
10. Top 10 ideas returned to frontend
11. User can save generated content to library
```

---

### Example 3: Viral Prediction Flow

```
1. User navigates to Dashboard → Tools → Predict
2. Pastes content into textarea
3. Selects niche: "Motivation"
4. Clicks "Predict Viral Potential"
5. Frontend calls POST /api/viral-analysis
   {
     action: "predict_viral",
     payload: {
       content: "...",
       contentType: "motivation",
       findOptimalTime: true
     }
   }
6. API route initializes ViralPredictor
7. Analyzer calculates viral factors:
   - Hook strength: 75/100
   - Emotional impact: 82/100
   - Content length: 90/100
   - Hashtags: 60/100
   - Engagement elements: 70/100
   - Niche alignment: 85/100
8. Weighted score calculated: 77/100
9. Engagement metrics predicted
10. Optimal posting time found
11. Results displayed with recommendations
```

---

## Key Design Decisions

### 1. **Why Next.js App Router?**
- Server-side rendering for better SEO
- API routes for backend logic
- Easy deployment on Vercel
- Built-in optimization (images, fonts, etc.)
- Modern React features (Server Components)

### 2. **Why Supabase?**
- Built-in authentication (no custom auth needed)
- PostgreSQL with real-time capabilities
- Row Level Security for data protection
- Easy integration with Next.js
- Free tier for development

### 3. **Why Apify?**
- Reliable scraping infrastructure
- Pre-built actors for social platforms
- Handles anti-bot measures
- Scalable (pay-per-use)
- No need to maintain scrapers

### 4. **Why OpenAI?**
- State-of-the-art language models
- Excellent for content generation
- Good API documentation
- Reasonable pricing
- Fallback to rule-based analysis when unavailable

### 5. **Why Client Components for Dashboard?**
- Rich interactivity required
- Form state management
- Real-time updates
- User interactions (clicks, hovers, etc.)
- Better UX with instant feedback

### 6. **Why Tailwind CSS?**
- Utility-first approach (faster development)
- No CSS file bloat
- Consistent design system
- Easy responsive design
- Built-in dark mode support

---

## Performance Optimizations

### 1. **Code Splitting**
- Automatic by Next.js
- Components lazy-loaded
- Reduced initial bundle size

### 2. **Image Optimization**
- Next.js Image component
- Automatic WebP conversion
- Lazy loading

### 3. **API Caching**
- Implement caching for repeated requests
- Cache scraped data temporarily
- Redis for production (future)

### 4. **Database Indexing**
- Indexes on frequently queried columns
- GIN indexes for array fields (hashtags)
- Composite indexes for complex queries

### 5. **Edge Functions**
- Deploy API routes on Vercel Edge
- Reduce latency globally
- Faster response times

---

## Security Considerations

### 1. **Data Security**
- Row Level Security (RLS) on all tables
- User data isolated per account
- No cross-user access

### 2. **API Security**
- API keys stored in environment variables
- Server-side only (not exposed to client)
- Rate limiting (future implementation)

### 3. **Authentication**
- JWT-based sessions
- Secure password hashing (Supabase)
- Email verification (optional)
- OAuth support (Google)

### 4. **Input Validation**
- Validate all user inputs
- Sanitize data before database insertion
- Prevent SQL injection (Supabase handles this)

### 5. **CORS**
- Configure allowed origins
- Restrict API access to your domain

---

## Testing Recommendations

### 1. **Unit Tests** (Future Implementation)
- Test AI analysis functions
- Test viral prediction algorithms
- Test content generation

**Tools**: Jest, React Testing Library

### 2. **Integration Tests**
- Test API routes
- Test database operations
- Test authentication flow

**Tools**: Cypress, Playwright

### 3. **E2E Tests**
- Test complete user flows
- Test scraping → analysis → generation → save

**Tools**: Playwright, Cypress

---

## Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics**: Built-in performance monitoring
2. **Sentry**: Error tracking and reporting
3. **PostHog**: Product analytics and user tracking
4. **Supabase Logs**: Database query monitoring

### Key Metrics to Track

- API response times
- Scraping success rates
- AI generation quality scores
- User engagement (content saved, generated)
- Error rates
- User retention

---

## Future Enhancements

### Planned Features

1. **Multi-Platform Support**
   - YouTube scraping
   - Twitter/X scraping
   - LinkedIn analysis

2. **Advanced Analytics**
   - Trend detection
   - Competitor tracking dashboard
   - Performance over time graphs

3. **Collaboration Features**
   - Team accounts
   - Content sharing
   - Collaborative editing

4. **Content Scheduling**
   - Schedule posts
   - Buffer/Hootsuite integration
   - Multi-platform posting

5. **Mobile App**
   - React Native app
   - On-the-go content generation
   - Push notifications

6. **Advanced AI Features**
   - Image generation (DALL-E)
   - Video script generation
   - Voice-over generation

---

## Troubleshooting Guide

### Common Issues

#### 1. **Supabase Connection Error**
```
Error: supabaseUrl is required
```
**Solution**: Check `.env.local` for correct Supabase URL and key

---

#### 2. **Apify Scraping Fails**
```
Error: No videos found for @username
```
**Possible Causes**:
- Invalid username
- Private account
- Platform restrictions
- Apify quota exceeded

**Solution**: Verify username, check Apify dashboard for quota

---

#### 3. **OpenAI API Error**
```
Error: OpenAI API key invalid
```
**Solution**: Verify API key in `.env.local`, check OpenAI dashboard for quota

---

#### 4. **Authentication Not Working**
```
Error: Session not found
```
**Solution**: 
- Clear browser cookies
- Check Supabase auth settings
- Verify environment variables

---

#### 5. **Database RLS Policy Error**
```
Error: permission denied for table profiles
```
**Solution**: Run SQL schema again, ensure RLS policies are created

---

## Contributing Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:
```
feat(scraping): add YouTube scraping support

- Implemented YouTube scraper using Apify
- Added YouTube platform option in UI
- Updated API routes to handle YouTube data

Closes #123
```

---

## License

[Add your license information here]

---

## Support & Contact

- **Documentation**: See setup files (AUTH_SETUP.md, CONTENTS_DATABASE_SETUP.md)
- **Issues**: [GitHub Issues]
- **Email**: support@wscrape.com

---

## Changelog

### Version 2.0.0 (Current)
- ✅ Complete AI-powered content generation
- ✅ Viral prediction engine
- ✅ Comment analysis
- ✅ User authentication
- ✅ Content library management
- ✅ Video analysis tool
- ✅ AI content assistant

### Version 1.0.0
- Basic scraping functionality
- Simple content display

---

**Built with ❤️ by the wscrape team**

