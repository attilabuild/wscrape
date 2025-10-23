# Developer Quick Reference Guide

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Setup database
# Run SQL in Supabase: supabase-schema.sql

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

---

## 📁 Project Structure Cheat Sheet

```
app/
├── api/              → Backend API routes
│   ├── scrape/      → Content scraping
│   ├── ai-analysis/ → AI content analysis
│   └── ...
├── dashboard/        → Main app UI
├── login/           → Auth pages
└── page.tsx         → Landing page

components/
├── dashboard/       → Dashboard UI components
└── ProtectedRoute.tsx → Auth wrapper

lib/
├── supabase.ts      → DB client
├── ai-analysis.ts   → AI engine
├── viral-predictor.ts → ML predictions
└── apify-scraper.ts → Web scraping
```

---

## 🔑 Essential Code Snippets

### Authentication

#### Check if user is logged in
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // User not logged in
}
```

#### Get current user
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log(user.id, user.email);
```

#### Sign out
```typescript
await supabase.auth.signOut();
router.push('/');
```

---

### Database Operations

#### Query user content
```typescript
const { data, error } = await supabase
  .from('contents')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(10);
```

#### Insert content
```typescript
const { error } = await supabase
  .from('contents')
  .insert({
    user_id: user.id,
    hook: 'My viral hook',
    caption: 'Full caption...',
    viral_score: 85,
    hashtags: ['#viral', '#content'],
    platform: 'instagram'
  });
```

#### Update content
```typescript
const { error } = await supabase
  .from('contents')
  .update({ viral_score: 90 })
  .eq('id', contentId)
  .eq('user_id', user.id); // RLS protection
```

#### Delete content
```typescript
const { error } = await supabase
  .from('contents')
  .delete()
  .eq('id', contentId);
```

---

### API Calls

#### Scrape content
```typescript
const response = await fetch('/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'hormozi',
    platform: 'instagram',
    count: 10
  })
});

const result = await response.json();
if (result.success) {
  console.log(result.data.videos);
}
```

#### Generate AI content
```typescript
const response = await fetch('/api/ai-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generate_suggestions',
    payload: {
      niche: 'business',
      count: 5,
      profileContext: userProfile
    }
  })
});

const result = await response.json();
console.log(result.data.suggestions);
```

#### Predict viral potential
```typescript
const response = await fetch('/api/viral-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'predict_viral',
    payload: {
      content: 'My content here...',
      contentType: 'business',
      findOptimalTime: true
    }
  })
});

const result = await response.json();
console.log('Viral Score:', result.data.prediction.viralProbability);
```

---

### AI Analysis Engine Usage

#### Analyze scraped content
```typescript
import { AIAnalysisEngine } from '@/lib/ai-analysis';

const engine = new AIAnalysisEngine(process.env.OPENAI_API_KEY);

const analysis = await engine.analyzeScrapedContent(
  videos,
  'hormozi',
  'business'
);

console.log('Overall Score:', analysis.overallScore);
console.log('Insights:', analysis.keyInsights);
console.log('Recommendations:', analysis.recommendations);
```

#### Generate content suggestions
```typescript
const suggestions = await engine.generateContentSuggestions(
  'business',           // niche
  'entrepreneurs',      // target audience
  'motivational',       // content style
  competitorVideos      // reference data
);

suggestions.forEach(s => {
  console.log(`Hook: ${s.hook}`);
  console.log(`Expected Engagement: ${s.expectedEngagement}%`);
});
```

---

### Viral Predictor Usage

#### Predict viral score
```typescript
import { ViralPredictor } from '@/lib/viral-predictor';

const predictor = new ViralPredictor(viralDatabase);

const prediction = predictor.predictViral(
  content,
  'business',
  new Date(),      // scheduled time
  10000            // follower count
);

console.log('Viral Probability:', prediction.viralProbability);
console.log('Expected Views:', prediction.expectedViews);
console.log('Recommendations:', prediction.recommendations);
```

#### Find optimal posting time
```typescript
const optimal = predictor.findOptimalPostingTime(
  content,
  'business'
);

console.log('Best Time:', optimal.recommendedTime);
console.log('Expected Boost:', optimal.expectedBoost);
```

---

### Content Generator Usage

#### Generate content from template
```typescript
import { AIContentGenerator } from '@/lib/ai-content-generator';

const generator = new AIContentGenerator(viralPosts);

const content = generator.generateContent({
  niche: 'business',
  tone: 'motivational',
  length: 'medium',
  includeHashtags: true,
  targetAudience: 'entrepreneurs'
});

content.forEach(c => {
  console.log('Hook:', c.hook);
  console.log('Caption:', c.caption);
  console.log('Hashtags:', c.hashtags);
  console.log('Viral Score:', c.viralPrediction);
});
```

#### Generate hook variations
```typescript
const variations = generator.generateHookVariations(
  'What if I told you the secret to success?',
  10  // number of variations
);

variations.forEach((v, i) => {
  console.log(`Variation ${i + 1}: ${v}`);
});
```

---

## 🎨 UI Component Patterns

### Protected Page Wrapper
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### Loading State
```typescript
const [loading, setLoading] = useState(false);

{loading ? (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    <span>Loading...</span>
  </div>
) : (
  <button>Submit</button>
)}
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // API call
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}

{error && (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
    <p className="text-red-400">{error}</p>
  </div>
)}
```

---

## 🛠️ Common Development Tasks

### Add a new API route

1. Create file in `app/api/my-route/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Your logic here
    
    return NextResponse.json({
      success: true,
      data: {}
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

2. Call from frontend
```typescript
const response = await fetch('/api/my-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'value' })
});
```

---

### Add a new database table

1. Write SQL in Supabase Editor
```sql
CREATE TABLE public.my_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their own data" 
  ON public.my_table FOR SELECT 
  USING (auth.uid() = user_id);
```

2. Query from code
```typescript
const { data } = await supabase
  .from('my_table')
  .select('*')
  .eq('user_id', user.id);
```

---

### Add a new dashboard component

1. Create component file
```typescript
// components/dashboard/MyComponent.tsx
export default function MyComponent() {
  return (
    <div className="border border-white/10 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-4">
        My Component
      </h2>
    </div>
  );
}
```

2. Import in dashboard
```typescript
import MyComponent from '@/components/dashboard/MyComponent';

{activeTab === 'my-tab' && <MyComponent />}
```

---

## 🔍 Debugging Tips

### Check Supabase Connection
```typescript
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data);
console.log('Error:', error);
```

### Log API Responses
```typescript
console.log('API Response:', await response.json());
```

### Check Environment Variables
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
```

### View Database Policies
Go to Supabase → Database → Policies
Check if RLS policies are active

### Test API Routes Directly
Use Postman or curl:
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "platform": "instagram", "count": 5}'
```

---

## 📊 Performance Tips

### Optimize Database Queries
```typescript
// ❌ Bad: N+1 queries
for (const content of contents) {
  const profile = await supabase.from('profiles').select().eq('id', content.user_id);
}

// ✅ Good: Single join query
const { data } = await supabase
  .from('contents')
  .select(`
    *,
    profiles:user_id (name, niche)
  `);
```

### Use React.memo for expensive components
```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // Expensive rendering logic
  return <div>{data}</div>;
});
```

### Debounce search inputs
```typescript
import { useState, useCallback } from 'react';

const debouncedSearch = useCallback(
  debounce((query) => {
    // Search logic
  }, 500),
  []
);
```

---

## 🧪 Testing Examples

### Test API Route (Jest)
```typescript
import { POST } from '@/app/api/scrape/route';

describe('Scrape API', () => {
  it('should scrape content successfully', async () => {
    const request = new Request('http://localhost/api/scrape', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test',
        platform: 'instagram',
        count: 5
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data.videos).toHaveLength(5);
  });
});
```

### Test Component (React Testing Library)
```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/dashboard/MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('My Component')).toBeInTheDocument();
});
```

---

## 🔐 Security Checklist

- [ ] All API keys in environment variables (never in code)
- [ ] RLS enabled on all database tables
- [ ] User input sanitized before database insertion
- [ ] Protected routes wrapped with ProtectedRoute
- [ ] HTTPS only in production
- [ ] CORS configured for your domain only
- [ ] Rate limiting on API routes (future)
- [ ] No sensitive data in client-side code
- [ ] Git ignore `.env.local`

---

## 📝 Code Style Guide

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case for non-components (`ai-analysis.ts`)

### Import Order

```typescript
// 1. React/Next imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { supabase } from '@/lib/supabase';

// 3. Internal components
import MyComponent from '@/components/MyComponent';

// 4. Types
import type { User } from '@/types';

// 5. Styles (if any)
import styles from './styles.module.css';
```

### TypeScript Best Practices

```typescript
// ✅ Define interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Use type inference
const user = await getUser(); // Type is inferred

// ✅ Avoid 'any' type
const data: unknown = await response.json();
if (isValidData(data)) {
  // Type guard
}

// ✅ Use optional chaining
const userName = user?.profile?.name ?? 'Anonymous';
```

---

## 🚨 Common Errors & Solutions

### "Module not found"
```
Error: Cannot find module '@/components/MyComponent'
```
**Solution**: Check import path, ensure component exists, restart dev server

---

### "Hydration error"
```
Error: Text content does not match server-rendered HTML
```
**Solution**: Don't use browser-only APIs in SSR, use `useEffect` for client-only code

---

### "API route not found"
```
404 Not Found
```
**Solution**: Check file name is `route.ts` (not `index.ts`), restart dev server

---

### "Supabase RLS policy violation"
```
Error: new row violates row-level security policy
```
**Solution**: Check user is authenticated, verify RLS policies in Supabase dashboard

---

## 🎯 Development Workflow

### Daily Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Make changes

# 5. Test locally

# 6. Commit changes
git add .
git commit -m "feat: add new feature"

# 7. Push to GitHub
git push origin main
```

### Before Deployment
```bash
# 1. Run type check
npx tsc --noEmit

# 2. Run linter
npm run lint

# 3. Build for production
npm run build

# 4. Test production build locally
npm start

# 5. Deploy to Vercel
git push origin main  # Auto-deploys on Vercel
```

---

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Tools
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Apify Console](https://console.apify.com/)
- [OpenAI Platform](https://platform.openai.com/)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 💡 Pro Tips

1. **Use TypeScript strictly** - Catch errors at compile time
2. **Keep components small** - Single responsibility principle
3. **Optimize images** - Use Next.js Image component
4. **Use React DevTools** - Debug component hierarchy
5. **Enable strict mode** - Find potential issues early
6. **Comment complex logic** - Help future you
7. **Use git branches** - Never commit directly to main
8. **Test on mobile** - Responsive design is critical
9. **Monitor performance** - Use Vercel Analytics
10. **Keep dependencies updated** - `npm outdated`

---

## 🎓 Learning Path

### Beginner
1. Understand Next.js App Router
2. Learn basic Supabase queries
3. Master React hooks (useState, useEffect)
4. Learn Tailwind CSS utilities

### Intermediate
1. Understand authentication flow
2. Learn API route patterns
3. Master async/await
4. Understand TypeScript types

### Advanced
1. Optimize database queries
2. Implement caching strategies
3. Build custom hooks
4. Contribute to architecture

---

**Happy Coding! 🚀**

