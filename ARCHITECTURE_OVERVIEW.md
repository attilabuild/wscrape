# wscrape - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                      (Next.js Frontend)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Landing Page        Dashboard           Auth Pages            │
│  ┌──────────┐       ┌──────────────┐    ┌──────────┐         │
│  │          │       │              │    │          │         │
│  │ - Hero   │       │ - Sidebar    │    │ - Login  │         │
│  │ - CTA    │       │ - Header     │    │ - Signup │         │
│  │ - Footer │       │ - Tools      │    │ - Reset  │         │
│  │          │       │ - Contents   │    │          │         │
│  └──────────┘       │ - Profile    │    └──────────┘         │
│                     └──────────────┘                          │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTPS/REST API
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /api/scrape          /api/ai-analysis    /api/viral-analysis  │
│  ┌──────────┐         ┌──────────────┐   ┌─────────────────┐  │
│  │ Content  │         │ AI Engine    │   │ ML Predictor    │  │
│  │ Scraping │         │ Analysis     │   │ Viral Score     │  │
│  └──────────┘         └──────────────┘   └─────────────────┘  │
│                                                                 │
│  /api/content         /api/profile       /api/scrape-comments  │
│  ┌──────────┐         ┌──────────────┐   ┌─────────────────┐  │
│  │ CRUD Ops │         │ User Profile │   │ Comment Scrape  │  │
│  └──────────┘         └──────────────┘   └─────────────────┘  │
│                                                                 │
└────────┬──────────────────┬───────────────────┬────────────────┘
         │                  │                   │
         │                  │                   │
    ┌────▼─────┐     ┌─────▼──────┐    ┌──────▼────────┐
    │          │     │            │    │               │
    │ Supabase │     │  OpenAI    │    │    Apify      │
    │ Database │     │  GPT API   │    │   Scrapers    │
    │          │     │            │    │               │
    └──────────┘     └────────────┘    └───────────────┘
    PostgreSQL       AI Generation     Web Scraping
```

---

## Layer-by-Layer Breakdown

### 1. Frontend Layer (Client-Side)

**Technology**: Next.js 15 with React 19

**Key Components**:

```
app/
├── page.tsx                    → Landing page
├── dashboard/page.tsx          → Main dashboard
├── login/page.tsx             → Authentication
└── video-analysis/page.tsx    → Standalone tools

components/
├── dashboard/
│   ├── Sidebar.tsx            → Navigation
│   ├── Tools.tsx              → Multi-tool interface
│   ├── Contents.tsx           → Content library
│   ├── Profile.tsx            → User settings
│   └── ContentGrid.tsx        → Reusable content display
└── ProtectedRoute.tsx         → Auth wrapper
```

**Responsibilities**:
- User interface rendering
- User input handling
- Client-side state management
- API communication
- Real-time updates

**Data Flow**:
```
User Action → State Update → API Call → Response → UI Update
```

---

### 2. API Layer (Server-Side)

**Technology**: Next.js API Routes (Server Components)

**Route Structure**:

```
app/api/
├── scrape/route.ts
│   └── Handles content scraping requests
│
├── ai-analysis/route.ts
│   ├── analyze_content       → Performance analysis
│   ├── generate_suggestions  → AI content ideas
│   ├── optimize_content      → Viral optimization
│   ├── competitor_analysis   → Competitor insights
│   └── hashtag_strategy      → Hashtag recommendations
│
├── viral-analysis/route.ts
│   └── predict_viral         → Viral potential scoring
│
├── content/route.ts
│   ├── get_all              → Fetch user content
│   ├── search               → Search content
│   ├── filter_by_niche      → Filter operations
│   └── save/update/delete   → CRUD operations
│
├── profile/route.ts
│   ├── get                  → Fetch profile
│   └── save                 → Update profile
│
├── scrape-comments/route.ts
│   └── Scrape Instagram comments
│
└── ai-assistant/route.ts
    └── Chatbot interactions
```

**Responsibilities**:
- Request validation
- Business logic orchestration
- External API coordination
- Database operations
- Response formatting
- Error handling

---

### 3. Service Layer (Business Logic)

**Location**: `lib/` directory

**Core Services**:

#### a. **AI Analysis Engine** (`lib/ai-analysis.ts`)

```typescript
class AIAnalysisEngine {
  // Core Methods
  analyzeScrapedContent()      → Performance insights
  generateContentSuggestions() → AI content ideas
  optimizeForViral()          → Content optimization
  analyzeCompetitorStrategy() → Competitive analysis
  generateHashtagStrategy()   → Hashtag recommendations
}
```

**Architecture**:
```
Input (Videos/Content)
    ↓
Data Preprocessing
    ↓
OpenAI GPT Analysis (or Fallback)
    ↓
Pattern Recognition
    ↓
Scoring & Ranking
    ↓
Actionable Insights
    ↓
Structured Output
```

---

#### b. **Viral Predictor** (`lib/viral-predictor.ts`)

```typescript
class ViralPredictor {
  // Prediction Pipeline
  predictViral()              → Viral probability
  findOptimalPostingTime()    → Best time to post
  analyzeCompetitorPatterns() → Pattern analysis
  trainModel()                → ML training
}
```

**Algorithm Flow**:
```
Content Input
    ↓
Extract Features
    ├─ Hook Strength (25%)
    ├─ Emotional Impact (20%)
    ├─ Content Length (10%)
    ├─ Hashtag Strategy (8%)
    ├─ Time Factors (12%)
    ├─ Engagement Elements (15%)
    └─ Niche Alignment (10%)
    ↓
Weighted Scoring
    ↓
Niche Benchmarking
    ↓
Prediction Result (0-100%)
```

---

#### c. **Content Generator** (`lib/ai-content-generator.ts`)

```typescript
class AIContentGenerator {
  // Generation Methods
  generateContent()           → Template-based generation
  generateHookVariations()    → Hook alternatives
  predictViralPotential()     → Content scoring
  generateContentCalendar()   → 30-day plan
}
```

**Template System**:
```
Pre-built Templates
    ├─ Question Hook
    ├─ Absolute Statement
    ├─ Numbered Secrets
    ├─ Controversial Take
    ├─ Story Hook
    ├─ Insider Secret
    ├─ Comparison Hook
    └─ Challenge Hook
    ↓
Niche Adaptation
    ↓
Viral Word Enhancement
    ↓
Hashtag Strategy
    ↓
Final Content + Variations
```

---

#### d. **Apify Scraper** (`lib/apify-scraper.ts`)

```typescript
class ApifyScraper {
  // Scraping Methods
  scrapeVideos()              → Profile content
  scrapeComments()            → Post comments
}
```

**Scraping Flow**:
```
User Input (Username/URL)
    ↓
Platform Detection
    ├─ TikTok → Apify TikTok Actor
    └─ Instagram → Apify Instagram Actor
    ↓
API Request (with retry logic)
    ↓
Data Extraction
    ↓
Data Normalization
    ↓
Structured Response
```

---

### 4. Data Layer

#### a. **Supabase (PostgreSQL)**

**Tables Schema**:

```
┌─────────────────────────────────────────┐
│         profiles                        │
├─────────────────────────────────────────┤
│ id         UUID (PK, FK to auth.users)  │
│ name       TEXT                         │
│ niche      TEXT                         │
│ bio        TEXT                         │
│ created_at TIMESTAMP                    │
│ updated_at TIMESTAMP                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         contents                        │
├─────────────────────────────────────────┤
│ id              UUID (PK)               │
│ user_id         UUID (FK)               │
│ username        TEXT                    │
│ caption         TEXT                    │
│ hook            TEXT                    │
│ transcript      TEXT                    │
│ views           INTEGER                 │
│ likes           INTEGER                 │
│ comments        INTEGER                 │
│ shares          INTEGER                 │
│ engagement_rate DECIMAL                 │
│ viral_score     INTEGER                 │
│ hashtags        TEXT[]                  │
│ platform        TEXT                    │
│ created_at      TIMESTAMP               │
│ updated_at      TIMESTAMP               │
└─────────────────────────────────────────┘
```

**Security (RLS)**:
```sql
-- Users can only access their own data
CREATE POLICY "user_isolation" 
ON public.contents FOR ALL
USING (auth.uid() = user_id);
```

---

#### b. **Authentication (Supabase Auth)**

```
┌────────────────────────────────────┐
│        auth.users                  │
│   (Managed by Supabase)            │
├────────────────────────────────────┤
│ id           UUID (PK)             │
│ email        TEXT                  │
│ encrypted_pw TEXT                  │
│ created_at   TIMESTAMP             │
│ ...                                │
└────────────────────────────────────┘

Authentication Flow:
User Credentials → Supabase Auth → JWT Token → Session
```

---

### 5. External Services

#### a. **OpenAI API**

**Used For**:
- Content analysis
- Sentiment analysis
- Text generation
- Strategic recommendations

**Models**:
- GPT-4 (primary)
- GPT-3.5-turbo (fallback)

**Request Pattern**:
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a viral content expert..." },
    { role: "user", content: "Analyze this content..." }
  ],
  temperature: 0.7,
  max_tokens: 1000
});
```

---

#### b. **Apify**

**Used For**:
- TikTok profile scraping
- Instagram profile scraping
- Instagram comment scraping

**Actors**:
- `apify/tiktok-profile-scraper`
- `apify/instagram-profile-scraper`
- `apify/instagram-comment-scraper`

**Request Pattern**:
```typescript
const run = await apifyClient.actor(actorId).call({
  username: 'target_username',
  resultsLimit: 10
});

const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
```

---

## Data Flow Diagrams

### Content Scraping Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Enter username
     ▼
┌─────────────┐
│  Dashboard  │
│   (Tools)   │
└──────┬──────┘
       │ 2. POST /api/scrape
       ▼
┌──────────────────┐
│  Scrape API      │
│  Route Handler   │
└────┬─────────────┘
     │ 3. Initialize ApifyScraper
     ▼
┌──────────────────┐
│  ApifyScraper    │
│  Service         │
└────┬─────────────┘
     │ 4. Call Apify Actor
     ▼
┌──────────────────┐
│  Apify Platform  │
│  (External)      │
└────┬─────────────┘
     │ 5. Scrape TikTok/Instagram
     │
     │ 6. Return video data
     ▼
┌──────────────────┐
│  ApifyScraper    │
│  Transform Data  │
└────┬─────────────┘
     │ 7. Return normalized data
     ▼
┌──────────────────┐
│  Scrape API      │
│  Response        │
└────┬─────────────┘
     │ 8. JSON response
     ▼
┌─────────────┐
│  Dashboard  │
│  Display    │
└─────────────┘
     │ 9. User saves content
     ▼
┌──────────────────┐
│  Supabase DB     │
│  contents table  │
└──────────────────┘
```

---

### AI Content Generation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Select niche + quantity
     ▼
┌─────────────┐
│  Dashboard  │
│  (Generate) │
└──────┬──────┘
       │ 2. POST /api/ai-analysis
       │    action: generate_suggestions
       ▼
┌──────────────────────┐
│  AI Analysis API     │
│  Route Handler       │
└────┬─────────────────┘
     │ 3. Load user profile
     ▼
┌──────────────────────┐
│  Supabase DB         │
│  profiles table      │
└────┬─────────────────┘
     │ 4. Profile data
     ▼
┌──────────────────────┐
│  AI Analysis Engine  │
│  generateSuggestions │
└────┬─────────────────┘
     │ 5. Prepare prompt
     ▼
┌──────────────────────┐
│  OpenAI GPT API      │
│  (External)          │
└────┬─────────────────┘
     │ 6. AI-generated ideas
     ▼
┌──────────────────────┐
│  AI Analysis Engine  │
│  Parse & Score       │
└────┬─────────────────┘
     │ 7. Structured content
     ▼
┌──────────────────────┐
│  AI Analysis API     │
│  Response            │
└────┬─────────────────┘
     │ 8. JSON response
     ▼
┌─────────────┐
│  Dashboard  │
│  Display    │
└─────────────┘
```

---

### Viral Prediction Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Paste content
     ▼
┌─────────────┐
│  Dashboard  │
│  (Predict)  │
└──────┬──────┘
       │ 2. POST /api/viral-analysis
       ▼
┌──────────────────────┐
│  Viral Analysis API  │
│  Route Handler       │
└────┬─────────────────┘
     │ 3. Initialize ViralPredictor
     ▼
┌──────────────────────┐
│  Viral Predictor     │
│  ML Engine           │
└────┬─────────────────┘
     │ 4. Extract features
     │
     │ Hook Strength     ✓
     │ Emotional Impact  ✓
     │ Content Length    ✓
     │ Hashtags          ✓
     │ Engagement        ✓
     │ Niche Alignment   ✓
     │
     │ 5. Calculate weighted score
     ▼
┌──────────────────────┐
│  Scoring Algorithm   │
│  (ML Model)          │
└────┬─────────────────┘
     │ 6. Viral probability
     │    + Expected metrics
     │    + Recommendations
     ▼
┌──────────────────────┐
│  Viral Analysis API  │
│  Response            │
└────┬─────────────────┘
     │ 7. JSON response
     ▼
┌─────────────┐
│  Dashboard  │
│  Display    │
└─────────────┘
```

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────┐
│           Client Request                    │
└──────────────┬──────────────────────────────┘
               │
               │ 1. Request with session token
               ▼
┌──────────────────────────────────────────────┐
│         Supabase Auth Middleware             │
│         (Automatic JWT verification)         │
└──────────────┬───────────────────────────────┘
               │
               │ 2. Valid token?
               ├─ Yes → Continue
               └─ No  → Redirect to /login
               ▼
┌──────────────────────────────────────────────┐
│         Row Level Security (RLS)             │
│         (Database-level filtering)           │
└──────────────┬───────────────────────────────┘
               │
               │ 3. Filter by user_id = auth.uid()
               ▼
┌──────────────────────────────────────────────┐
│         Database Query                       │
│         (Only user's own data)               │
└──────────────────────────────────────────────┘
```

### API Key Security

```
Environment Variables (.env.local)
    ↓
Server-Side Only (API Routes)
    ↓
Never Exposed to Client
    ↓
Rotated Regularly
```

---

## Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────────┐
│         Request                         │
└──────────────┬──────────────────────────┘
               │
               │ Check cache
               ▼
┌──────────────────────────────────────────┐
│         Cache Layer (Future)             │
│         - Redis for API responses        │
│         - CDN for static assets          │
└──────────────┬───────────────────────────┘
               │
               ├─ Hit  → Return cached data
               └─ Miss → Fetch from source
               ▼
┌──────────────────────────────────────────┐
│         Data Source                      │
│         (Database/External API)          │
└──────────────────────────────────────────┘
```

### Database Optimization

```sql
-- Recommended Indexes
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_viral_score ON contents(viral_score DESC);
CREATE INDEX idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX idx_contents_hashtags ON contents USING GIN(hashtags);
```

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────┐
│            User Browser                     │
└──────────────┬──────────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────────┐
│         Vercel Edge Network                 │
│         - CDN                               │
│         - SSL Termination                   │
│         - DDoS Protection                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         Next.js Application                 │
│         (Vercel Serverless Functions)       │
└─────┬──────────────┬────────────┬───────────┘
      │              │            │
      │              │            │
      ▼              ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Supabase │  │ OpenAI   │  │  Apify   │
│   DB     │  │   API    │  │  Actors  │
└──────────┘  └──────────┘  └──────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    ├─ Vercel Edge Function 1
    ├─ Vercel Edge Function 2
    ├─ Vercel Edge Function 3
    └─ Vercel Edge Function N
```

### Database Scaling

```
Supabase PostgreSQL
    ├─ Read Replicas (Future)
    ├─ Connection Pooling
    └─ Query Optimization
```

### API Rate Limiting (Future)

```typescript
// Per-user rate limits
const rateLimit = {
  scraping: "100 requests/hour",
  aiGeneration: "50 requests/hour",
  viralPrediction: "200 requests/hour"
};
```

---

## Monitoring & Observability

### Metrics to Track

```
Application Metrics:
├─ API response times
├─ Error rates
├─ User engagement
└─ Feature usage

Infrastructure Metrics:
├─ Database query performance
├─ External API latency
├─ Function execution time
└─ Memory usage

Business Metrics:
├─ Active users
├─ Content generated
├─ Scraping success rate
└─ User retention
```

---

## Technology Decision Matrix

| Requirement | Technology | Reason |
|------------|------------|--------|
| Frontend Framework | Next.js 15 | SSR, SEO, built-in API routes |
| UI Library | React 19 | Component-based, large ecosystem |
| Styling | Tailwind CSS 4 | Utility-first, rapid development |
| Database | Supabase (PostgreSQL) | Built-in auth, RLS, real-time |
| Authentication | Supabase Auth | Turnkey solution, secure |
| AI/ML | OpenAI GPT | Best-in-class language models |
| Web Scraping | Apify | Reliable, scalable, no maintenance |
| Hosting | Vercel | Seamless Next.js integration |
| Type Safety | TypeScript | Catch errors at compile-time |

---

## Future Architecture Evolution

### Phase 1 (Current)
- ✅ Core features
- ✅ Basic AI integration
- ✅ Content management
- ✅ User authentication

### Phase 2 (Next 3 months)
- [ ] Redis caching layer
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Webhook integrations

### Phase 3 (6-12 months)
- [ ] Mobile app (React Native)
- [ ] Video generation (AI)
- [ ] Multi-platform posting
- [ ] Advanced ML models (custom trained)

---

**Last Updated**: January 2025  
**Architecture Version**: 2.0

