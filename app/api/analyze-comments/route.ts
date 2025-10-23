import { NextRequest, NextResponse } from 'next/server';

interface Comment {
  text: string;
  ownerUsername: string;
  likesCount: number;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { comments } = await request.json();

    if (!comments || comments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No comments provided'
      }, { status: 400 });
    }

    // Analyze sentiment
    const sentiment = analyzeSentiment(comments);
    
    // Extract common themes
    const themes = extractThemes(comments);
    
    // Get top comments
    const topComments = comments
      .filter((c: Comment) => c.likesCount > 0)
      .sort((a: Comment, b: Comment) => b.likesCount - a.likesCount)
      .slice(0, 3)
      .map((c: Comment) => ({
        username: c.ownerUsername,
        text: c.text,
        likes: c.likesCount
      }));
    
    // Generate actionable suggestions
    const suggestions = generateSuggestions(comments, sentiment, themes);

    return NextResponse.json({
      success: true,
      analysis: {
        sentiment,
        themes,
        topComments,
        suggestions
      }
    });

  } catch (error: any) {
    console.error('Comment analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze comments'
    }, { status: 500 });
  }
}

function analyzeSentiment(comments: Comment[]) {
  const positiveKeywords = ['love', 'great', 'amazing', 'awesome', 'good', 'best', 'perfect', 'excellent', 'thanks', 'helpful', 'inspiring', 'motivated', 'fire', '🔥', '💪', '❤️', '👏', '🙌', 'yes', 'agree', 'idol'];
  const negativeKeywords = ['bad', 'hate', 'terrible', 'awful', 'worst', 'sucks', 'disappointed', 'useless', 'wrong', 'fail', 'problem'];
  
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  comments.forEach(comment => {
    const text = comment.text.toLowerCase();
    const hasPositive = positiveKeywords.some(word => text.includes(word));
    const hasNegative = negativeKeywords.some(word => text.includes(word));

    if (hasPositive && !hasNegative) {
      positive++;
    } else if (hasNegative && !hasPositive) {
      negative++;
    } else {
      neutral++;
    }
  });

  const total = comments.length;
  return {
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100)
  };
}

function extractThemes(comments: Comment[]) {
  const themes: { [key: string]: number } = {};
  
  // Common content themes
  const themePatterns = {
    'Questions': /\?|how|what|why|when|where|who/i,
    'Support/Encouragement': /good luck|you can|go for it|keep going|believe|support|motivation|inspire/i,
    'Requests': /please|can you|would you|could you|tutorial|more/i,
    'Appreciation': /thanks|thank you|appreciate|love|amazing|great/i,
    'Criticism': /but|however|problem|issue|fix|wrong/i,
    'Advice/Feedback': /should|try|suggest|recommend|better|improve/i,
    'Excitement': /wow|omg|damn|fire|🔥|yes|let\'s go|excited/i,
    'Personal Stories': /\bi\b.*\b(did|tried|started|failed|made|built)/i
  };

  comments.forEach(comment => {
    const text = comment.text;
    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      if (pattern.test(text)) {
        themes[theme] = (themes[theme] || 0) + 1;
      }
    });
  });

  // Return top 5 themes
  return Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);
}

function generateSuggestions(comments: Comment[], sentiment: any, themes: string[]) {
  const suggestions: string[] = [];
  
  // Most engaged comments (high likes)
  const topComments = comments
    .filter(c => c.likesCount > 0)
    .sort((a, b) => b.likesCount - a.likesCount)
    .slice(0, 3);

  // Sentiment-based suggestions
  if (sentiment.positive > 60) {
    suggestions.push('Your audience loves this content! Create more content in this style to capitalize on the positive response.');
    suggestions.push('Consider pinning or responding to the most liked positive comments to boost engagement further.');
  } else if (sentiment.negative > 30) {
    suggestions.push('There are concerns in the comments. Address the negative feedback directly to build trust with your audience.');
  } else {
    suggestions.push('Engagement is moderate. Ask questions in your captions to encourage more comments and interaction.');
  }

  // Theme-based suggestions
  if (themes.includes('Questions')) {
    suggestions.push('Many viewers have questions! Create a follow-up video or post answering the most common questions to drive more engagement.');
  }

  if (themes.includes('Requests')) {
    suggestions.push('Your audience is asking for more content. This is great! Consider creating a series or tutorial based on their requests.');
  }

  if (themes.includes('Support/Encouragement')) {
    suggestions.push('You have a supportive community! Share your journey and struggles to deepen the connection with your audience.');
  }

  if (themes.includes('Advice/Feedback')) {
    suggestions.push('Viewers are offering suggestions. Listen to constructive feedback and show them you value their input by implementing changes.');
  }

  if (themes.includes('Personal Stories')) {
    suggestions.push('People are sharing their own stories. Reply to these comments to build deeper relationships and community.');
  }

  // Engagement patterns
  if (topComments.length > 0) {
    const avgTopLikes = topComments.reduce((sum, c) => sum + c.likesCount, 0) / topComments.length;
    if (avgTopLikes > 5) {
      suggestions.push(`The top comments are getting ${Math.round(avgTopLikes)} likes on average. These are hot topics! Consider making content that addresses them.`);
    }
  }

  // Default suggestions if not enough data
  if (suggestions.length < 3) {
    suggestions.push('Reply to at least 10 comments within the first hour to boost the post in the algorithm.');
    suggestions.push('Use the most common words in comments as hashtags or topics for your next post.');
    suggestions.push('Create a "Community Spotlight" post featuring the best comments to encourage more engagement.');
  }

  return suggestions.slice(0, 5);
}

