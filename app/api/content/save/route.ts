import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Save content API called');
    
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No auth token provided');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }
    
    // Get authenticated user
    const supabase = await createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log('👤 Auth check:', { hasUser: !!user, authError: authError?.message, userId: user?.id });
    
    if (authError || !user) {
      console.log('❌ Auth failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📦 Request body received:', Object.keys(body));
    const {
      username,
      caption,
      hook,
      transcript,
      views,
      likes,
      engagementRate,
      uploadDate,
      contentType,
      postUrl,
      viralScore,
      hashtags,
      platform
    } = body;

    // Prepare insert data (only include columns that exist in the schema)
    // Note: upload_date column doesn't exist, so we omit it and let Supabase use created_at
    const insertData: any = {
      user_id: user.id,
      username: username || 'unknown',
      caption: caption || '',
      hook: hook || '',
      transcript: transcript || caption || hook || '',
      views: views || 0,
      likes: likes || 0,
      engagement_rate: engagementRate || 0,
      content_type: contentType || 'general',
      post_url: postUrl || '',
      viral_score: viralScore || 50,
      hashtags: hashtags || [],
      platform: platform || contentType || 'general'
    };

    // Only add upload_date if the column exists in your schema
    // If you need to store upload_date, you'll need to add the column to your Supabase table first

    console.log('💾 Saving to Supabase:', { user_id: user.id, username: insertData.username, hook: insertData.hook?.substring(0, 50) });

    // Save to Supabase (only columns that exist in the schema)
    const { data, error } = await supabase
      .from('contents')
      .insert(insertData)
      .select();

    if (error) {
      console.error('❌ Supabase error saving content:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log('✅ Content saved successfully:', data?.[0]?.id);
    return NextResponse.json({
      success: true,
      data: data?.[0]
    });

  } catch (error) {
    console.error('Save content error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save content' },
      { status: 500 }
    );
  }
}

