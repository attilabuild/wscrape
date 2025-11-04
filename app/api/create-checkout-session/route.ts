import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfig, getOrCreateStripeCustomer } from '@/lib/stripe';
import { createSupabaseFromRequest } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Get user from Supabase
    const supabase = await createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create or get Stripe customer
    const customerId = await getOrCreateStripeCustomer(user.id, user.email!);

    // Get the correct app URL (ensure HTTPS and www)
    // Default to https://www.wscrape.com if not set
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.wscrape.com';
    
    // Ensure HTTPS and www
    if (!appUrl.startsWith('https://')) {
      appUrl = appUrl.replace(/^http:\/\//, 'https://');
    }
    if (!appUrl.includes('www.')) {
      appUrl = appUrl.replace(/https:\/\/([^\/]+)/, 'https://www.$1');
    }
    
    const baseUrl = appUrl.replace(/\/$/, ''); // Remove trailing slash
    
    console.log(`🔗 Creating checkout session with baseUrl: ${baseUrl}`);
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripeConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

