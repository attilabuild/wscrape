# Stripe Интеграција План за wscrape

## 🎯 Преглед

Stripe интеграција ће омогућити монетизацију wscrape платформе кроз subscription-based модел са credit системом.

---

## 📋 1. Stripe Setup и Конфигурација

### 1.1. Stripe Account Setup
```bash
# 1. Креирај Stripe account на https://dashboard.stripe.com
# 2. Активирај Test Mode за development
# 3. Обавиј Stripe Identity verification за production
```

### 1.2. Environment Variables
```env
# .env.local
STRIPE_SECRET_KEY=sk_test_... # Test key за development
STRIPE_PUBLISHABLE_KEY=pk_test_... # Public key за frontend
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook secret
STRIPE_PRICE_ID_PRO=price_... # Pro plan price ID
STRIPE_PRICE_ID_ENTERPRISE=price_... # Enterprise plan price ID
```

### 1.3. Package Installation
```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

---

## 🏗️ 2. Database Schema за Stripe

### 2.1. Supabase Табеле
```sql
-- User subscriptions table
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  stripe_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User credits table
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions log
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL, -- Positive for add, negative for subtract
  type TEXT NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 💳 3. Stripe Products и Pricing

### 3.1. Subscription Plans
```typescript
// lib/subscription-plans.ts
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 10,
    features: [
      '10 credits per month',
      'Basic scraping (TikTok, Instagram)',
      'Limited AI analysis',
      'Community support'
    ],
    stripePriceId: null
  },
  pro: {
    name: 'Pro',
    price: 29,
    credits: 100,
    features: [
      '100 credits per month',
      'Unlimited scraping',
      'Full AI analysis',
      'Priority support',
      'Export data',
      'Advanced analytics'
    ],
    stripePriceId: 'price_pro_monthly'
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    credits: 500,
    features: [
      '500 credits per month',
      'Everything in Pro',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'API access'
    ],
    stripePriceId: 'price_enterprise_monthly'
  }
};
```

### 3.2. Stripe Products Setup
```typescript
// scripts/create-stripe-products.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createProducts() {
  // Pro Plan Product
  const proProduct = await stripe.products.create({
    name: 'wscrape Pro',
    description: 'Professional social media analytics and content generation'
  });

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: { interval: 'month' }
  });

  // Enterprise Plan Product
  const enterpriseProduct = await stripe.products.create({
    name: 'wscrape Enterprise',
    description: 'Enterprise-grade social media analytics platform'
  });

  const enterprisePrice = await stripe.prices.create({
    product: enterpriseProduct.id,
    unit_amount: 9900, // $99.00
    currency: 'usd',
    recurring: { interval: 'month' }
  });

  console.log('Products created:', { proPrice: proPrice.id, enterprisePrice: enterprisePrice.id });
}
```

---

## 🔧 4. Backend Implementation

### 4.1. Stripe Client Setup
```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true
});

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!
};
```

### 4.2. Customer Management
```typescript
// lib/stripe-customer.ts
import { stripe } from './stripe';
import { supabase } from './supabase';

export class StripeCustomer {
  static async createOrGetCustomer(userId: string, email: string) {
    // Check if customer already exists
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (existing?.stripe_customer_id) {
      return existing.stripe_customer_id;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId }
    });

    // Save to database
    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customer.id
      });

    return customer.id;
  }
}
```

### 4.3. Checkout Session API
```typescript
// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { StripeCustomer } from '@/lib/stripe-customer';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json();

    // Get user email
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create or get Stripe customer
    const customerId = await StripeCustomer.createOrGetCustomer(user.id, user.email!);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
        userId: user.id
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
```

### 4.4. Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfig } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeConfig.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  // Update user subscription
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      stripe_status: subscription.status
    });

  // Add credits based on plan
  const plan = getPlanByPriceId(subscription.items.data[0].price.id);
  if (plan) {
    await addCreditsToUser(userId, plan.credits, 'subscription_purchase');
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await supabase
    .from('user_subscriptions')
    .update({
      stripe_status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from('user_subscriptions')
    .update({
      stripe_status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
}
```

---

## 💰 5. Credit System

### 5.1. Credit Management
```typescript
// lib/credit-system.ts
import { supabase } from './supabase';

export class CreditSystem {
  static async getUserCredits(userId: string): Promise<number> {
    const { data } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    
    return data?.credits || 0;
  }

  static async addCredits(userId: string, amount: number, type: string, description?: string) {
    // Add to user_credits table
    await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        credits: await this.getUserCredits(userId) + amount
      });

    // Log transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: type,
        description: description || `${type} - ${amount} credits`
      });
  }

  static async useCredits(userId: string, amount: number, type: string, description?: string) {
    const currentCredits = await this.getUserCredits(userId);
    
    if (currentCredits < amount) {
      throw new Error('Insufficient credits');
    }

    await this.addCredits(userId, -amount, type, description);
  }

  static async checkCredits(userId: string, required: number): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    return credits >= required;
  }
}
```

### 5.2. Credit Usage in API Routes
```typescript
// app/api/scrape/route.ts - Updated with credit system
export async function POST(request: NextRequest) {
  try {
    // ... existing auth and validation ...

    // Check credits before scraping
    const hasCredits = await CreditSystem.checkCredits(user.id, 1);
    if (!hasCredits) {
      return NextResponse.json({ 
        error: 'Insufficient credits. Please upgrade your plan.' 
      }, { status: 402 });
    }

    // Perform scraping
    const results = await apifyScraper.scrapeVideos(platform, username);
    
    // Deduct credits after successful scraping
    await CreditSystem.useCredits(user.id, 1, 'scraping', `Scraped ${platform} content`);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
  }
}
```

---

## 🎨 6. Frontend Implementation

### 6.1. Pricing Page
```typescript
// app/pricing/page.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6">
                ${plan.price}
                {plan.price > 0 && <span className="text-lg text-gray-400">/month</span>}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.price > 0 ? (
                <button
                  onClick={() => handleSubscribe(plan.stripePriceId!)}
                  disabled={loading === plan.stripePriceId}
                  className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                >
                  {loading === plan.stripePriceId ? 'Processing...' : 'Subscribe'}
                </button>
              ) : (
                <button className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium cursor-not-allowed">
                  Current Plan
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 6.2. Credit Display Component
```typescript
// components/CreditDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CreditDisplay() {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      setCredits(data?.credits || 0);
      setLoading(false);
    };

    fetchCredits();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Credits</span>
        <span className="text-2xl font-bold text-white">{credits}</span>
      </div>
      {credits < 10 && (
        <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">
          Add Credits
        </button>
      )}
    </div>
  );
}
```

---

## 🔒 7. Security и Best Practices

### 7.1. Webhook Security
```typescript
// Webhook signature verification
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### 7.2. Rate Limiting
```typescript
// app/api/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(identifier: string, limit: number, window: number) {
  const now = Date.now();
  const windowStart = now - window;
  
  const requests = rateLimitMap.get(identifier) || [];
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  return true;
}
```

### 7.3. Error Handling
```typescript
// lib/stripe-errors.ts
export function handleStripeError(error: any) {
  if (error.type === 'StripeCardError') {
    return 'Your card was declined. Please try a different payment method.';
  } else if (error.type === 'StripeRateLimitError') {
    return 'Too many requests. Please try again later.';
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
}
```

---

## 📊 8. Monitoring и Analytics

### 8.1. Stripe Dashboard
- Monitor payments and subscriptions
- Track failed payments
- Analyze revenue metrics
- Set up alerts for critical events

### 8.2. Custom Analytics
```typescript
// lib/analytics.ts
export class SubscriptionAnalytics {
  static async trackSubscriptionCreated(userId: string, planId: string) {
    // Track in your analytics system
    console.log('Subscription created:', { userId, planId, timestamp: new Date() });
  }

  static async trackCreditUsage(userId: string, amount: number, type: string) {
    // Track credit usage patterns
    console.log('Credit used:', { userId, amount, type, timestamp: new Date() });
  }
}
```

---

## 🚀 9. Deployment Checklist

### 9.1. Environment Setup
- [ ] Stripe account created and verified
- [ ] Products and prices created in Stripe
- [ ] Webhook endpoints configured
- [ ] Environment variables set in production
- [ ] Database schema deployed

### 9.2. Testing
- [ ] Test checkout flow in Stripe test mode
- [ ] Verify webhook handling
- [ ] Test credit system
- [ ] Test subscription upgrades/downgrades
- [ ] Test payment failures

### 9.3. Production Launch
- [ ] Switch to live Stripe keys
- [ ] Monitor webhook delivery
- [ ] Set up error alerting
- [ ] Test with real payment methods

---

## 📈 10. Future Enhancements

### 10.1. Advanced Features
- **Usage-based billing** - Pay per credit used
- **Team subscriptions** - Multiple users per account
- **Custom plans** - Enterprise custom pricing
- **API access** - Direct API access for enterprise users

### 10.2. Analytics Dashboard
- Revenue tracking
- User subscription analytics
- Credit usage patterns
- Churn analysis

---

## 🎯 Закључак

Овај план обезбеђује комплетну Stripe интеграцију за wscrape платформу са:

✅ **Subscription Management** - Месечне претплате са различитим плановима
✅ **Credit System** - Флексибилни credit систем за коришћење функција
✅ **Security** - Безбедна обрада плаћања и webhook-ова
✅ **User Experience** - Интуитиван pricing page и credit display
✅ **Monitoring** - Праћење и аналитика subscription метрика

Интеграција је дизајнирана да буде скалабилна, безбедна и лака за одржавање! 🚀
