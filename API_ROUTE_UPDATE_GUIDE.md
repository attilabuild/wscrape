# API Route Update Guide

This guide shows how to update existing API routes to include:
1. Logging (replacing console.log)
2. Rate limiting
3. Input validation

## Pattern to Follow

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withRateLimit, RATE_LIMITS, getUserIdentifier } from '@/lib/rate-limit';
import { validateRequest, [SchemaName] } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting (FIRST)
    const rateLimitResult = await withRateLimit(
      request,
      RATE_LIMITS.scraping, // or .ai, .general, .webhook
      getUserIdentifier // or custom identifier function
    );

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    // 2. Input validation (BEFORE authentication)
    const validation = await validateRequest(request, scrapeSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    // 3. Authentication
    const supabase = await createSupabaseFromRequest(request);
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('No token in Authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      logger.warn('Authentication failed', { error: authError?.message });
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    logger.debug('Request processed', { userId: user.id });

    // 4. Subscription check (if required)
    const subscriptionCheck = await requireActiveSubscription(user.id);
    if (!subscriptionCheck.authorized) {
      logger.warn('Subscription check failed', { userId: user.id });
      return NextResponse.json(
        { error: subscriptionCheck.error },
        { status: subscriptionCheck.status }
      );
    }

    // 5. Business logic
    const { username } = validation.data;
    // ... your logic here

    logger.info('Request completed', { userId: user.id });

    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    logger.error('API error', error, { endpoint: '/api/your-endpoint' });
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Rate Limit Types

- `RATE_LIMITS.scraping` - For scraping endpoints (10 req/min)
- `RATE_LIMITS.ai` - For AI analysis endpoints (20 req/min)
- `RATE_LIMITS.general` - For general endpoints (60 req/min)
- `RATE_LIMITS.webhook` - For webhooks (1000 req/min)

## Logging Levels

- `logger.debug()` - Development only, detailed info
- `logger.info()` - Important events (successful operations)
- `logger.warn()` - Warnings (auth failures, validation errors)
- `logger.error()` - Errors (exceptions, failures)

## Validation Schemas Available

- `scrapeSchema` - For /api/scrape
- `aiAnalysisSchema` - For /api/ai-analysis
- `viralAnalysisSchema` - For /api/viral-analysis
- `contentSchema` - For /api/content
- `contentSaveSchema` - For /api/content/save
- `profileSchema` - For /api/profile
- `scrapeCommentsSchema` - For /api/scrape-comments
- `analyzeCommentsSchema` - For /api/analyze-comments
- `videoAnalysisSchema` - For /api/video-analysis

## Routes Updated

✅ `/api/scrape` - Updated with logging, rate limiting, validation

## Routes Still To Update

- `/api/ai-analysis`
- `/api/viral-analysis`
- `/api/content`
- `/api/content/save`
- `/api/create-checkout-session`
- `/api/create-portal-session`
- `/api/profile`
- `/api/scrape-comments`
- `/api/analyze-comments`
- `/api/video-analysis`
- `/api/ai-assistant`

## Notes

- Replace all `console.log()` with `logger.debug()` or `logger.info()`
- Replace all `console.error()` with `logger.error()`
- Replace all `console.warn()` with `logger.warn()`
- Add rate limiting at the start of each route handler
- Add input validation before processing the request
- Remove sensitive data from logs (passwords, tokens, etc.)

