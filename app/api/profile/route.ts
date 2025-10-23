import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface UserProfile {
  personal: {
    name: string;
    username: string;
    bio: string;
    location: string;
    website: string;
    email: string;
  };
  content: {
    primaryNiche: string;
    secondaryNiches: string[];
    contentStyle: string;
    targetAudience: string;
    contentGoals: string[];
    postingFrequency: string;
    preferredPlatforms: string[];
  };
  brand: {
    brandVoice: string;
    brandPersonality: string[];
    brandValues: string[];
    uniqueSellingPoint: string;
    brandStory: string;
  };
  audience: {
    targetAge: string;
    targetGender: string;
    targetLocation: string;
    audienceInterests: string[];
    audiencePainPoints: string[];
    audienceAspirations: string[];
  };
  preferences: {
    contentLength: string;
    tonePreference: string;
    hashtagStrategy: string;
    callToActionStyle: string;
    visualStyle: string;
  };
  analytics: {
    bestPerformingTopics: string[];
    worstPerformingTopics: string[];
    optimalPostingTimes: string[];
    seasonalTrends: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ProfileRequest {
  action: 'get' | 'save' | 'update' | 'delete';
  profileData?: Partial<UserProfile>;
}

const PROFILE_FILE_PATH = path.join(process.cwd(), 'data', 'user-profile.json');

export async function POST(request: NextRequest) {
  try {
    const body: ProfileRequest = await request.json();
    const { action, profileData } = body;

    console.log(`👤 Profile API: ${action}`);

    switch (action) {
      case 'get':
        return await handleGetProfile();
      
      case 'save':
        return await handleSaveProfile(profileData);
      
      case 'update':
        return await handleUpdateProfile(profileData);
      
      case 'delete':
        return await handleDeleteProfile();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: get, save, update, delete' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process profile request' },
      { status: 500 }
    );
  }
}

/**
 * Get user profile
 */
async function handleGetProfile() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(PROFILE_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    // Try to read existing profile
    try {
      const profileData = await fs.readFile(PROFILE_FILE_PATH, 'utf-8');
      const profile: UserProfile = JSON.parse(profileData);
      
      console.log('📋 Profile loaded successfully');
      return NextResponse.json({
        success: true,
        data: profile
      });
    } catch (fileError) {
      // Profile doesn't exist, return default profile
      console.log('📋 No existing profile found, returning default');
      return NextResponse.json({
        success: true,
        data: getDefaultProfile()
      });
    }
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

/**
 * Save new profile
 */
async function handleSaveProfile(profileData: Partial<UserProfile> | undefined) {
  if (!profileData) {
    return NextResponse.json(
      { error: 'Profile data is required for save action' },
      { status: 400 }
    );
  }

  try {
    // Ensure data directory exists
    const dataDir = path.dirname(PROFILE_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    const now = new Date().toISOString();
    const fullProfile: UserProfile = {
      ...getDefaultProfile(),
      ...profileData,
      createdAt: now,
      updatedAt: now
    };

    await fs.writeFile(PROFILE_FILE_PATH, JSON.stringify(fullProfile, null, 2));
    
    console.log('💾 Profile saved successfully');
    return NextResponse.json({
      success: true,
      data: fullProfile,
      message: 'Profile saved successfully'
    });
  } catch (error) {
    console.error('Failed to save profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

/**
 * Update existing profile
 */
async function handleUpdateProfile(profileData: Partial<UserProfile> | undefined) {
  if (!profileData) {
    return NextResponse.json(
      { error: 'Profile data is required for update action' },
      { status: 400 }
    );
  }

  try {
    // Get existing profile
    let existingProfile: UserProfile;
    try {
      const existingData = await fs.readFile(PROFILE_FILE_PATH, 'utf-8');
      existingProfile = JSON.parse(existingData);
    } catch {
      // If no existing profile, create new one
      existingProfile = getDefaultProfile();
    }

    // Deep merge the profile data
    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...profileData,
      personal: { ...existingProfile.personal, ...profileData.personal },
      content: { ...existingProfile.content, ...profileData.content },
      brand: { ...existingProfile.brand, ...profileData.brand },
      audience: { ...existingProfile.audience, ...profileData.audience },
      preferences: { ...existingProfile.preferences, ...profileData.preferences },
      analytics: { ...existingProfile.analytics, ...profileData.analytics },
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(PROFILE_FILE_PATH, JSON.stringify(updatedProfile, null, 2));
    
    console.log('🔄 Profile updated successfully');
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * Delete profile
 */
async function handleDeleteProfile() {
  try {
    await fs.unlink(PROFILE_FILE_PATH);
    
    console.log('🗑️ Profile deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return NextResponse.json({
        success: true,
        message: 'No profile to delete'
      });
    }
    
    console.error('Failed to delete profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}

/**
 * Get default profile structure
 */
function getDefaultProfile(): UserProfile {
  const now = new Date().toISOString();
  
  return {
    personal: {
      name: '',
      username: '',
      bio: '',
      location: '',
      website: '',
      email: ''
    },
    content: {
      primaryNiche: '',
      secondaryNiches: [],
      contentStyle: '',
      targetAudience: '',
      contentGoals: [],
      postingFrequency: '',
      preferredPlatforms: []
    },
    brand: {
      brandVoice: '',
      brandPersonality: [],
      brandValues: [],
      uniqueSellingPoint: '',
      brandStory: ''
    },
    audience: {
      targetAge: '',
      targetGender: '',
      targetLocation: '',
      audienceInterests: [],
      audiencePainPoints: [],
      audienceAspirations: []
    },
    preferences: {
      contentLength: '',
      tonePreference: '',
      hashtagStrategy: '',
      callToActionStyle: '',
      visualStyle: ''
    },
    analytics: {
      bestPerformingTopics: [],
      worstPerformingTopics: [],
      optimalPostingTimes: [],
      seasonalTrends: []
    },
    createdAt: now,
    updatedAt: now
  };
}
