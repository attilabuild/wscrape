/**
 * Input validation schemas using Zod
 * All API endpoints should validate their inputs using these schemas
 */

import { z } from 'zod';
import { NextRequest } from 'next/server';

// Common validation patterns
const usernameRegex = /^[a-zA-Z0-9._]+$/;
const urlRegex = /^https?:\/\/.+/;

// Scrape API validation
export const scrapeSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters')
    .regex(usernameRegex, 'Username contains invalid characters'),
  platform: z.enum(['instagram', 'tiktok']).optional().default('instagram'),
});

// AI Analysis API validation
export const aiAnalysisSchema = z.object({
  action: z.enum(['analyze_content', 'competitor_analysis', 'hashtag_strategy']),
  payload: z.object({
    videos: z.array(z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      views: z.number().min(0).optional(),
      likes: z.number().min(0).optional(),
      comments: z.number().min(0).optional(),
      shares: z.number().min(0).optional(),
      engagementRate: z.number().min(0).max(100).optional(),
      url: z.string().url().optional(),
    })).optional(),
    username: z.string().min(1).max(50).optional(),
    niche: z.string().max(100).optional(),
    competitors: z.array(z.string()).max(10).optional(),
    hashtags: z.array(z.string()).max(50).optional(),
  }),
});

// Viral Analysis API validation
export const viralAnalysisSchema = z.object({
  action: z.enum(['mass_analyze', 'generate_content', 'predict_viral', 'create_variations', 'get_insights']),
  payload: z.object({
    niches: z.array(z.string().max(50)).max(10).optional(),
    creators: z.array(z.string().max(50)).max(10).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    saveToDatabase: z.boolean().optional(),
    content: z.string().max(5000).optional(),
    videoId: z.string().optional(),
    username: z.string().max(50).optional(),
  }).optional(),
});

// Content API validation
export const contentSchema = z.object({
  action: z.enum(['get_all', 'get_by_niche', 'get_by_creator', 'search', 'add']),
  filters: z.object({
    niche: z.string().max(100).optional(),
    creator: z.string().max(50).optional(),
    minViralScore: z.number().min(0).max(100).optional(),
    minEngagement: z.number().min(0).optional(),
    searchQuery: z.string().max(200).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }).optional(),
  payload: z.object({
    username: z.string().max(50).optional(),
    caption: z.string().max(5000).optional(),
    hook: z.string().max(500).optional(),
    transcript: z.string().max(10000).optional(),
    views: z.number().min(0).optional(),
    likes: z.number().min(0).optional(),
    engagementRate: z.number().min(0).max(100).optional(),
    uploadDate: z.string().optional(),
    contentType: z.string().max(50).optional(),
    postUrl: z.string().url().optional(),
    viralScore: z.number().min(0).max(100).optional(),
    hashtags: z.array(z.string()).max(50).optional(),
    platform: z.string().max(20).optional(),
  }).optional(),
});

// Content Save API validation
export const contentSaveSchema = z.object({
  username: z.string().min(1).max(50),
  caption: z.string().max(5000).optional(),
  hook: z.string().max(500).optional(),
  transcript: z.string().max(10000).optional(),
  views: z.number().int().min(0).optional(),
  likes: z.number().int().min(0).optional(),
  engagementRate: z.number().min(0).max(100).optional(),
  uploadDate: z.string().optional(),
  contentType: z.string().max(50).optional(),
  postUrl: z.string().url().optional(),
  viralScore: z.number().min(0).max(100).optional(),
  hashtags: z.array(z.string()).max(50).optional(),
  platform: z.string().max(20).optional(),
});

// Profile API validation
export const profileSchema = z.object({
  action: z.enum(['get', 'update']),
  profileData: z.object({
    username: z.string().max(50).optional(),
    displayName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
    website: z.string().url().optional(),
    location: z.string().max(100).optional(),
    niche: z.string().max(50).optional(),
  }).optional(),
});

// Comment scraping validation
export const scrapeCommentsSchema = z.object({
  postUrl: z.string().url('Invalid post URL'),
  platform: z.enum(['instagram', 'tiktok']).optional().default('instagram'),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

// Comment analysis validation
export const analyzeCommentsSchema = z.object({
  comments: z.array(z.object({
    text: z.string().min(1).max(1000),
    author: z.string().max(50).optional(),
    likes: z.number().int().min(0).optional(),
    timestamp: z.string().optional(),
  })).min(1).max(1000),
});

// Video analysis validation
export const videoAnalysisSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().max(500),
  creator: z.string().max(50),
  platform: z.string().max(20),
  duration: z.string().optional(),
  views: z.number().int().min(0),
  likes: z.number().int().min(0),
  comments: z.number().int().min(0),
  shares: z.number().int().min(0).optional(),
  engagementRate: z.number().min(0).max(100).optional(),
});

// Helper function to validate request body
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string; status: number }> {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return {
        success: false,
        error: `Validation error: ${errors}`,
        status: 400,
      };
    }
    return {
      success: false,
      error: 'Invalid request body',
      status: 400,
    };
  }
}

