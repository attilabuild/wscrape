/**
 * Rate limiting middleware for API routes
 * Uses Upstash Redis for distributed rate limiting
 * Falls back to in-memory rate limiting if Redis is not configured
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory fallback for development
class InMemoryRateLimit {
  private requests: Map<string, number[]> = new Map();

  constructor() {
    // Clean up old entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of this.requests.entries()) {
        const filtered = timestamps.filter(ts => now - ts < 120000); // Keep last 2 minutes
        if (filtered.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, filtered);
        }
      }
    }, 60000);
  }

  async limit(identifier: string, limit: number, window: number): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const windowMs = window * 1000;
    
    const timestamps = this.requests.get(identifier) || [];
    const recent = timestamps.filter(ts => now - ts < windowMs);
    
    if (recent.length >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.max(...recent) + windowMs,
      };
    }

    recent.push(now);
    this.requests.set(identifier, recent);

    return {
      success: true,
      limit,
      remaining: limit - recent.length,
      reset: now + windowMs,
    };
  }
}

// Try to use Upstash if available
let ratelimitInstance: InMemoryRateLimit | any = null;

try {
  // Try to use Upstash Redis if configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    // Dynamically import Upstash to avoid errors if not installed properly
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');
    
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    
    ratelimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    });
  }
} catch (error) {
  // Fallback to in-memory
}

// Default to in-memory if Upstash not available
if (!ratelimitInstance) {
  ratelimitInstance = new InMemoryRateLimit();
}

export interface RateLimitConfig {
  limit: number;
  window: number; // in seconds
}

// Default rate limits for different endpoint types
export const RATE_LIMITS = {
  // Scraping endpoints (expensive operations)
  scraping: { limit: 10, window: 60 }, // 10 requests per minute
  // AI analysis endpoints (expensive operations)
  ai: { limit: 20, window: 60 }, // 20 requests per minute
  // General API endpoints
  general: { limit: 60, window: 60 }, // 60 requests per minute
  // Webhooks (no rate limit - they're called by Stripe)
  webhook: { limit: 1000, window: 60 }, // Very high limit
} as const;

/**
 * Rate limiting middleware
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.general,
  getIdentifier?: (request: NextRequest) => Promise<string> | string
): Promise<{
  success: boolean;
  response?: NextResponse;
  identifier?: string;
  remaining?: number;
  reset?: number;
}> {
  try {
    // Get identifier (user ID, IP address, or custom)
    let identifier: string;
    
    if (getIdentifier) {
      identifier = await getIdentifier(request);
    } else {
      // Default: use IP address
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      identifier = `ip:${ip}`;
    }

    // Apply rate limit
    let result: { success: boolean; limit: number; remaining: number; reset: number };
    
    // Check if it's Upstash Ratelimit (has different API)
    if (ratelimitInstance.limit && typeof ratelimitInstance.limit === 'function' && ratelimitInstance.limit.length === 1) {
      // Upstash Ratelimit - uses sliding window configured in constructor
      const ratelimitResult = await ratelimitInstance.limit(identifier);
      result = {
        success: ratelimitResult.success,
        limit: config.limit,
        remaining: ratelimitResult.remaining,
        reset: ratelimitResult.reset,
      };
    } else {
      // In-memory rate limit
      result = await ratelimitInstance.limit(identifier, config.limit, config.window);
    }

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.reset.toString(),
              'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            },
          }
        ),
        identifier,
        remaining: 0,
        reset: result.reset,
      };
    }

    return {
      success: true,
      identifier,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    // Log the error but don't block users
    console.error('Rate limiting error:', error);
    return { success: true };
  }
}

/**
 * Helper to get user ID from request for rate limiting
 */
export async function getUserIdentifier(request: NextRequest): Promise<string> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      // Hash the token to create a stable identifier
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      return `user:${hash.substring(0, 16)}`;
    }
    
    // Fallback to IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    return `ip:${ip}`;
  } catch {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    return `ip:${ip}`;
  }
}
