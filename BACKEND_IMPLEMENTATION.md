# 3.2. Бекенд Имплементација

## 3.2.1. Next.js API Руте: Улога Сервера у Full-Stack Архитектури

### Архитектонска Основа

Бекенд логика wscrape платформе је архитектонски ослоњена на коришћење Next.js API рута, што представља савремени и ефикасан приступ за изградњу Full-Stack апликација. Овај приступ елиминише потребу за засебним Node.js сервером (нпр. Express или NestJS), већ користи могућност Next.js-а да извршава JavaScript код на серверу.

API руте у Next.js 13+ App Router архитектури се аутоматски трансформишу у Serverless функције (AWS Lambda, Vercel Functions) приликом деплоја, са подршком за Edge Runtime за ултимативну перформансу. Ова архитектура постиже природну хоризонталну скалабилност и ефикасност трошкова, јер се плаћа само за време извршавања функције.

### Backend-for-Frontend (BFF) Образац

Централна теоријска улога API рута је да раде као Backend-for-Frontend (BFF). BFF образац је кључан за комплексну SaaS платформу јер прилагођава одговоре са више екстерних сервиса специфичним захтевима клијентског кода, смањујући тиме пренос података и комплексност клијентског стања.

#### Кључне BFF Функције:
- **Агрегација података** из више извора (Supabase, Apify, OpenAI)
- **Трансформација** сирових података у клијентски формат
- **Кеширање** често коришћених резултата
- **Rate limiting** и заштита од злоупотребе
- **Error handling** и graceful degradation

### Безбедносна Архитектура

BFF слој је имплементиран као безбедни посредник. Ово је апсолутни безбедносни императив: сви тајни кључеви и акредитиви за скупе и критичне екстерне сервисе као што су OpenAI, Apify и Stripe чувају се искључиво у Environment Variables на серверу.

#### Безбедносни Принципи:
```typescript
// ❌ НИКАДА у клијентском коду
const openaiKey = "sk-..."; // Овако НЕ!

// ✅ Правилно - само на серверу
const openaiKey = process.env.OPENAI_API_KEY;
```

#### Заштићени API Кључеви:
- `OPENAI_API_KEY` - AI анализе и генерација садржаја
- `APIFY_API_TOKEN` - Web scraping сервис
- `STRIPE_SECRET_KEY` - Плаћања и претплате
- `SUPABASE_SERVICE_ROLE_KEY` - Административни приступ бази

### Пословна Логика и Оркестрација

API руте нису само сигурносни проксији, већ и оркестратори пословне логике. Свака рута имплементира Defensive Programming принципе:

#### /api/scrape Route
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Аутентификација корисника
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Валидација уноса
    const { platform, username } = await request.json();
    if (!platform || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Провера кредита корисника
    const userCredits = await checkUserCredits(user.id);
    if (userCredits < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    // 4. Извршавање скрапинга
    const results = await apifyScraper.scrapeVideos(platform, username);
    
    // 5. Ажурирање кредита
    await decrementUserCredits(user.id);
    
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### /api/ai-analysis Route
```typescript
export async function POST(request: NextRequest) {
  try {
    const { videos, niche, username } = await request.json();
    
    // 1. Провера OpenAI API кључа
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: true, 
        data: getFallbackAnalysis(videos) 
      });
    }

    // 2. AI анализа са Prompt Engineering
    const analysis = await aiEngine.analyzeContent(videos, {
      niche,
      username,
      context: 'viral_content_analysis'
    });

    // 3. Структурирање резултата
    const structuredResults = {
      overallScore: analysis.score,
      viralPotential: analysis.potential,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      suggestions: analysis.suggestions
    };

    return NextResponse.json({ success: true, data: structuredResults });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
```

### Serverless Предности

#### Скалабилност
- Аутоматско хоризонтално скалирање
- Независни извршавања сваке функције
- Глобална дистрибуција (Edge Functions)

#### Ефикасност Трошкова
- Плаћање само за време извршавања
- Нема трошкова за idle време
- Аутоматско управљање ресурсима

#### Перформансе
- Cold start оптимизација
- Edge computing могућности
- CDN интеграција

---

## 3.2.2. Supabase: База Података, Аутентификација и Безбедност

### Архитектонска Улога

Supabase служи као централни backend-as-a-service (BaaS) за wscrape платформу, обезбеђујући:
- **PostgreSQL база података** са real-time могућностима
- **Аутентификација и ауторизација** система
- **Row-Level Security (RLS)** за заштиту података
- **Real-time subscriptions** за live updates
- **Storage** за фајлове и медије

### База Података Схема

#### Кориснички Профили (profiles)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  niche TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Садржај (contents)
```sql
CREATE TABLE contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  username TEXT,
  caption TEXT,
  hook TEXT,
  transcript TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  content_type TEXT,
  post_url TEXT,
  viral_score INTEGER DEFAULT 0,
  hashtags TEXT[],
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2.2.1. Row-Level Security (RLS) Политика

RLS је кључан безбедносни механизам који обезбеђује да корисници могу да приступе само својим подацима.

#### RLS Активација
```sql
-- Омогућавање RLS за све табеле
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
```

#### Политике за profiles табелу
```sql
-- Корисници могу да виде само свој профил
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Корисници могу да ажурирају само свој профил
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Корисници могу да креирају само свој профил
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Политике за contents табелу
```sql
-- Корисници могу да виде само свој садржај
CREATE POLICY "Users can view own content" ON contents
  FOR SELECT USING (auth.uid() = user_id);

-- Корисници могу да креирају садржај
CREATE POLICY "Users can insert own content" ON contents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Корисници могу да ажурирају свој садржај
CREATE POLICY "Users can update own content" ON contents
  FOR UPDATE USING (auth.uid() = user_id);

-- Корисници могу да бришу свој садржај
CREATE POLICY "Users can delete own content" ON contents
  FOR DELETE USING (auth.uid() = user_id);
```

### 3.2.2.2. Управљање Аутентификацијом и Корисницима

#### Supabase Auth Интеграција
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### Аутентификација Методе
1. **Email/Password** - Традиционална аутентификација
2. **Google OAuth** - Social login интеграција
3. **Magic Links** - Passwordless аутентификација
4. **Phone Auth** - SMS верификација

#### Кориснички Lifecycle
```typescript
// Креирање корисника
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword'
});

// Пријављивање
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`
  }
});

// Одјављивање
const { error } = await supabase.auth.signOut();
```

#### Заштита API Рута
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && req.nextUrl.pathname.startsWith('/api/protected')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return res;
}
```

---

## 3.2.3. Интеграција AI и Web Scraping Сервиса

### 3.2.3.1. Apify за Скалабилни Web Scraping

#### Apify Архитектура
Apify је cloud-based платформа за web scraping која пружа:
- **Pre-built Actors** за популарне сајтове
- **Proxy rotation** за избегавање блокирања
- **Scalable infrastructure** за велике volume-е
- **Data storage** и export могућности

#### Интеграција у wscrape
```typescript
// lib/apify-scraper.ts
import { ApifyApi } from 'apify-client';

export class ApifyScraper {
  private client: ApifyApi;
  
  constructor() {
    this.client = new ApifyApi({
      token: process.env.APIFY_API_TOKEN!
    });
  }

  async scrapeTikTokVideos(username: string): Promise<VideoData[]> {
    const run = await this.client.actor('apify/tiktok-scraper').call({
      usernames: [username],
      resultsLimit: 50,
      searchLimit: 1
    });

    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    
    return items
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
      .slice(0, 10)
      .map(this.normalizeTikTokData);
  }

  async scrapeInstagramVideos(username: string): Promise<VideoData[]> {
    const run = await this.client.actor('apify/instagram-scraper').call({
      usernames: [username],
      resultsType: 'posts',
      resultsLimit: 50
    });

    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    
    return items
      .filter(item => item.type === 'Reel' || item.type === 'Video')
      .slice(0, 10)
      .map(this.normalizeInstagramData);
  }
}
```

#### Скалабилност и Перформансе
- **Concurrent scraping** - Паралелно скрапирање више профила
- **Rate limiting** - Контрола брзине захтева
- **Error handling** - Graceful degradation при грешкама
- **Caching** - Кеширање резултата за избегавање дуплирања

### 3.2.3.2. OpenAI API за AI Анализу (Аналитичка Машина)

#### AI Архитектура
OpenAI GPT-4 служи као аналитичка машина за:
- **Content analysis** - Анализа виралног садржаја
- **Trend detection** - Откривање трендова
- **Content generation** - Генерација новог садржаја
- **Sentiment analysis** - Анализа коментара и реакција

#### Prompt Engineering
```typescript
// lib/ai-analysis.ts
export class AIAnalysisEngine {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
  }

  async analyzeContent(videos: VideoData[], context: AnalysisContext) {
    const prompt = this.buildAnalysisPrompt(videos, context);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media analyst specializing in viral content patterns.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return this.parseAnalysisResponse(response.choices[0].message.content);
  }

  private buildAnalysisPrompt(videos: VideoData[], context: AnalysisContext): string {
    return `
    Analyze these ${videos.length} social media videos for viral potential:
    
    Context:
    - Niche: ${context.niche}
    - Username: ${context.username}
    - Platform: ${context.platform}
    
    Videos:
    ${videos.map(v => `
    - Hook: ${v.hook}
    - Views: ${v.views}
    - Engagement: ${v.engagementRate}%
    - Hashtags: ${v.hashtags?.join(', ')}
    `).join('\n')}
    
    Provide analysis in JSON format:
    {
      "overallScore": number,
      "viralPotential": "Low|Medium|High",
      "strengths": string[],
      "improvements": string[],
      "suggestions": string[]
    }
    `;
  }
}
```

#### AI Модели и Коришћење
- **GPT-4** - Главни модел за комплексну анализу
- **GPT-3.5-turbo** - Fallback за једноставније задатке
- **Text-embedding-ada-002** - За семантичку претрагу садржаја
- **DALL-E** - За генерацију визуелног садржаја (будућа функционалност)

#### Cost Optimization
```typescript
// Стратегије за смањење трошкова
const strategies = {
  // Кеширање резултата
  caching: 'Cache frequent analyses for 24 hours',
  
  // Fallback механизми
  fallback: 'Use rule-based analysis when API fails',
  
  // Batch processing
  batching: 'Process multiple requests together',
  
  // Token optimization
  tokenOptimization: 'Use concise prompts and response formats'
};
```

---

## 3.2.4. Монетизација и Интеграција Stripe Сервиса

### Stripe Интеграција Архитектура

Stripe служи као payment processor за wscrape платформу, обезбеђујући:
- **Subscription management** - Управљање претплатама
- **Payment processing** - Обрада плаћања
- **Webhook handling** - Real-time event processing
- **Customer management** - Управљање корисницима

### Трослојни Систем Финансијске Интеграције

Финансијска интеграција реализована је кроз стабилан и безбедан трослојни систем:

#### 1. Иницирање Checkout Сесије

Када корисник одабере PRO план ($29.99/месец), Next.js API рута `/api/create-checkout-session` позива Stripe API и креира јединствену Checkout Session.

Сесија садржи:
- Идентификатор изабраног плана (Price ID)
- Метаподатке (metadata) који повезују Stripe купца са `user_id` у Supabase бази
- URL-ове за успех и отказивање
- Начине плаћања (card)

Овај приступ обезбеђује да се комплетан checkout процес одвија на Stripe домену, елиминишући потребу да wscrape чува или обрађује осетљиве податке о картицама.

#### 2. Webhook Догађаји и Синхронизација

Након успешне уплате, Stripe шаље догађај `checkout.session.completed` на backend руту `/api/webhooks/stripe`.

**Безбедносна верификација:**
- Сваки догађај се верификује помоћу `STRIPE_WEBHOOK_SECRET` параметра
- Stripe потписује сваки webhook са криптографским потписом
- Backend верификује потпис пре обраде догађаја
- Ово гарантује да је порука заиста дошла од Stripe-а и да није измењена

**Синхронизација са базом података:**

По верификацији, backend ажурира статус корисника у Supabase бази:
- `stripe_status` = 'active'
- `stripe_subscription_id` = ID претплате
- `stripe_customer_id` = ID купца
- `current_period_start` = Почетак периода
- `current_period_end` = Крај периода
- `cancel_at_period_end` = false

Webhook систем обрађује и друге догађаје:
- `customer.subscription.updated` - Промене претплате
- `customer.subscription.deleted` - Отказивање
- `invoice.payment_succeeded` - Успешна уплата
- `invoice.payment_failed` - Неуспела уплата

#### 3. Аутоматско Обнављање и Отказивање

**Аутоматско обнављање:**
- Stripe аутоматски обнавља претплате на месечном нивоу
- Шаље догађај `invoice.payment_succeeded` при успешној уплати
- Backend ажурира `current_period_end` датум
- Корисник задржава приступ без прекида

**Отказивање и суспензија:**
- У случају неуспеле уплате, Stripe шаље догађај `invoice.payment_failed`
- Backend ажурира статус на 'past_due'
- При ручном отказивању, Stripe шаље `customer.subscription.deleted`
- Backend ажурира статус на 'canceled'
- Wscrape аутоматски суспендује премиум приступ у реалном времену
- Корисник се редиректује на `/pricing` страницу

### Безбедносни Принципи Stripe Интеграције

#### PCI Compliance и Заштита Података

**Stripe Checkout домен:**
- Stripe Checkout се извршава у потпуности на Stripe домену
- Елиминише потребу да wscrape чува или обрађује осетљиве податке
- Wscrape никада не додирује податке о кредитним картицама
- Потпуна PCI DSS усклађеност без додатне сертификације

**Шифрована комуникација:**
- Сва комуникација између backend-а и Stripe-а одвија се преко HTTPS протокола
- API кључеви чувају се у серверским environment променљивим
- `STRIPE_SECRET_KEY` никада није изложен клијенту
- Потпуна заштита API кључева

#### Webhook Безбедност

**Криптографска верификација:**
- Webhook систем користи криптографску верификацију потписа
- Stripe потписује сваки webhook са `STRIPE_WEBHOOK_SECRET` кључем
- Backend верификује потпис пре обраде
- Спречава лажно представљање или убризгавање неауторизованих догађаја

**Defense-in-Depth приступ:**
- Webhook signature verification (слој 1)
- RLS политике на `user_subscriptions` табели (слој 2)
- Server-side провера претплате при сваком API позиву (слој 3)

Овај вишеслојни приступ обезбеђује да је немогуће манипулисати статусом претплате или приступити премиум функцијама без валидне, плаћене претплате.

#### Stripe Configuration
```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true
});

// Webhook endpoint
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
```

#### Subscription Plans
```typescript
// lib/subscription-plans.ts
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 10,
    features: ['Basic scraping', 'Limited AI analysis']
  },
  pro: {
    name: 'Pro',
    price: 29,
    credits: 100,
    features: ['Unlimited scraping', 'Full AI analysis', 'Priority support']
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    credits: 500,
    features: ['Everything in Pro', 'Custom integrations', 'Dedicated support']
  }
};
```

#### Payment Processing
```typescript
// app/api/create-checkout-session/route.ts
export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json();
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: userId
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
```

#### Webhook Handling
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
      
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancellation(deletedSubscription);
      break;
  }

  return NextResponse.json({ received: true });
}
```

#### Credit System
```typescript
// lib/credit-system.ts
export class CreditSystem {
  static async checkUserCredits(userId: string): Promise<number> {
    const { data } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    return data?.credits || 0;
  }

  static async decrementCredits(userId: string, amount: number = 1): Promise<void> {
    await supabase.rpc('decrement_user_credits', {
      user_id: userId,
      amount: amount
    });
  }

  static async addCredits(userId: string, amount: number): Promise<void> {
    await supabase.rpc('add_user_credits', {
      user_id: userId,
      amount: amount
    });
  }
}
```

### Безбедност Плаћања

#### PCI Compliance
- Stripe обрађује све payment data
- Нема чувања credit card информација
- Secure token-based плаћања

#### Fraud Prevention
```typescript
// Fraud detection strategies
const fraudPrevention = {
  // Rate limiting
  rateLimiting: 'Limit payment attempts per user',
  
  // IP monitoring
  ipMonitoring: 'Track suspicious IP addresses',
  
  // Amount validation
  amountValidation: 'Validate payment amounts',
  
  // User verification
  userVerification: 'Verify user identity before payments'
};
```

---

## Закључак

Бекенд имплементација wscrape платформе представља софистицирану, скалабилну и безбедну архитектуру која комбинује:

1. **Next.js API Routes** - Serverless backend функционалност
2. **Supabase** - База података, аутентификација и real-time могућности
3. **Apify** - Скалабилни web scraping
4. **OpenAI** - AI анализе и генерација садржаја
5. **Stripe** - Монетизација и управљање претплатама

Ова архитектура обезбеђује:
- **Безбедност** - RLS политике и заштићени API кључеви
- **Скалабилност** - Serverless функције и cloud сервиси
- **Перформансе** - Edge computing и кеширање
- **Монетизацију** - Комплетан payment processing систем
- **AI интеграцију** - Напредна аналитика и генерација садржаја

Резултат је робустан, сигуран и лако одржаван SaaS backend који подржава све функционалности wscrape платформе.
