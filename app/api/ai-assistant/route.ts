import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message, history, userProfile } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // If no OpenAI API key, provide helpful fallback responses
    if (!OPENAI_API_KEY) {
      const fallbackResponse = getFallbackResponse(message);
      return NextResponse.json({
        success: true,
        response: fallbackResponse
      });
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Build context from user profile
    let profileContext = '';
    if (userProfile) {
      profileContext = `\n\nUser Profile Context:
- Niche: ${userProfile.niche || 'Not specified'}
- Name: ${userProfile.name || 'Not specified'}
- Bio: ${userProfile.bio || 'Not specified'}`;
    }

    // Build conversation history
    const conversationHistory = history?.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    })) || [];

    const systemPrompt = `You are an expert AI Content Assistant specializing in social media content creation, particularly for TikTok and Instagram. Your role is to:

1. Help users create viral content strategies
2. Write compelling hooks and captions
3. Suggest relevant hashtags
4. Analyze content performance
5. Provide platform-specific tips
6. Boost engagement strategies

Always be:
- Concise and actionable
- Specific to their niche when possible
- Data-driven when discussing metrics
- Encouraging and supportive
- Focused on content creation topics only

If asked about non-content topics, politely redirect to content-related questions.${profileContext}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      response: response
    });
  } catch (error: any) {
    
    // Provide fallback on error
    return NextResponse.json({
      success: true,
      response: getFallbackResponse((await request.json()).message)
    });
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Viral content
  if (lowerMessage.includes('viral') || lowerMessage.includes('views')) {
    return `🚀 To create viral content:

1. **Strong Hook (First 3 seconds)**
   - Start with a question or bold statement
   - Create curiosity or controversy
   - Example: "This one trick changed everything..."

2. **Valuable Content**
   - Teach something useful
   - Entertain or inspire
   - Solve a problem

3. **Clear CTA**
   - Ask for engagement
   - "Double tap if you agree"
   - "Follow for more tips"

4. **Optimal Posting**
   - Post consistently (1-3x daily)
   - Best times: 6-9 AM, 12-2 PM, 7-11 PM`;
  }

  // Hooks
  if (lowerMessage.includes('hook')) {
    return `✨ Powerful Hook Formulas:

1. **The Question**
   - "Want to know the secret to...?"
   - "Ever wondered why...?"

2. **The Bold Claim**
   - "This changed my life in 30 days"
   - "I made $10k using this method"

3. **The Curiosity Gap**
   - "Nobody talks about this..."
   - "The truth about..."

4. **The Transformation**
   - "From broke to successful"
   - "Before vs After"

5. **The Mistake**
   - "I wasted 5 years doing this"
   - "Stop making this mistake"`;
  }

  // Hashtags
  if (lowerMessage.includes('hashtag')) {
    return `#️⃣ Hashtag Strategy:

1. **Mix Sizes**
   - 2-3 large (1M+ posts): #ContentCreator
   - 3-4 medium (100K-1M): #ContentTips
   - 3-4 small (10K-100K): #NicheSpecific

2. **Stay Relevant**
   - Match your content exactly
   - Avoid banned hashtags
   - Use trending tags when relevant

3. **Create Branded**
   - Your own unique hashtag
   - Build community around it

4. **Research**
   - Check competitors' hashtags
   - Test and track performance`;
  }

  // Engagement
  if (lowerMessage.includes('engagement') || lowerMessage.includes('likes') || lowerMessage.includes('comments')) {
    return `📈 Boost Engagement:

1. **Ask Questions**
   - End with "What do you think?"
   - "Comment your answer below"

2. **Create Controversy**
   - Take a stance (respectfully)
   - Spark discussion

3. **Respond Quickly**
   - Reply to comments in first hour
   - Build relationships

4. **Use CTAs**
   - "Save this for later"
   - "Share with someone who needs this"
   - "Follow for daily tips"

5. **Post Consistently**
   - Quality + Consistency = Growth`;
  }

  // Default response
  return `💡 I'm your AI Content Assistant! I can help you with:

• **Content Strategy** - Planning viral content
• **Hook Writing** - Grab attention in 3 seconds
• **Hashtag Optimization** - Reach more people
• **Engagement Tips** - Get more likes & comments
• **Platform Tactics** - TikTok & Instagram tips
• **Content Ideas** - Never run out of ideas

What would you like help with today?`;
}

