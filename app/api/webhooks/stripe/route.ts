import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfig } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

// Export runtime config to ensure this is a dynamic route (no static optimization)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET handler for debugging webhook endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is active',
    instructions: 'This endpoint should receive POST requests from Stripe, not GET requests.',
    webhookUrl: 'The webhook URL in Stripe Dashboard should be: https://www.wscrape.com/api/webhooks/stripe (no trailing slash)',
    note: 'If you are seeing 307 redirect errors, check: 1) The URL has no trailing slash, 2) The domain matches exactly (www vs non-www), 3) No redirects are configured at the hosting level'
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Read the raw body as text to preserve exact formatting for signature verification
    // Do NOT use request.json() as it will parse and potentially modify the body
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!stripeConfig.webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Log webhook secret info (first 10 chars for debugging, but not the full secret)
    const secretPreview = `${stripeConfig.webhookSecret.substring(0, 10)}...${stripeConfig.webhookSecret.substring(stripeConfig.webhookSecret.length - 4)}`;
    console.log(`🔐 Webhook secret configured: ${secretPreview}`);
    console.log(`📝 Signature header: ${signature ? 'Present' : 'MISSING'}`);
    console.log(`📦 Body length: ${body.length} bytes`);
    console.log(`📝 Signature format: ${signature ? signature.split(',').length + ' parts' : 'N/A'}`);
    
    // Verify the secret format (should start with whsec_)
    if (!stripeConfig.webhookSecret.startsWith('whsec_')) {
      console.error(`❌ Webhook secret format is incorrect! Should start with 'whsec_', but starts with: ${stripeConfig.webhookSecret.substring(0, 6)}`);
      return NextResponse.json(
        { error: 'Webhook secret format is incorrect. Must start with whsec_' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeConfig.webhookSecret
      );
      console.log(`✅ Webhook verified: ${event.type} (ID: ${event.id})`);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed');
      console.error(`   Error: ${err.message}`);
      console.error(`   Webhook secret preview: ${secretPreview}`);
      console.error(`   Signature header preview: ${signature ? signature.substring(0, 100) : 'MISSING'}`);
      console.error(`   Body preview (first 200 chars): ${body.substring(0, 200)}`);
      console.error(`   Body ends with: ...${body.substring(Math.max(0, body.length - 50))}`);
      
      // Provide helpful error message
      const errorMessage = err.message || 'Unknown signature error';
      if (errorMessage.includes('No signatures found')) {
        console.error('   ⚠️ DIAGNOSIS: This means the webhook secret in STRIPE_WEBHOOK_SECRET does not match the signing secret in Stripe Dashboard');
        console.error('   ⚠️ SOLUTION: Copy the exact signing secret from Stripe Dashboard → Webhooks → Your endpoint → Signing secret');
        console.error('   ⚠️ Make sure there are no extra spaces, quotes, or newlines in the environment variable');
      } else if (errorMessage.includes('timestamp')) {
        console.error('   ⚠️ DIAGNOSIS: This might indicate the webhook is too old or the server clock is skewed');
      } else if (errorMessage.includes('raw request body')) {
        console.error('   ⚠️ DIAGNOSIS: The request body may have been modified. Ensure you are reading the raw body with request.text(), not request.json()');
      }
      
      return NextResponse.json(
        { error: `Invalid signature: ${errorMessage}. Please verify STRIPE_WEBHOOK_SECRET matches the signing secret in Stripe Dashboard exactly (including whsec_ prefix).` },
        { status: 400 }
      );
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
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

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      return NextResponse.json({ received: true }, { status: 200 });
    } catch (error: any) {
      console.error(`❌ Webhook handler error for ${event.type}:`, error);
      return NextResponse.json(
        { error: `Webhook handler failed: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`📥 Processing checkout.session.completed: ${session.id}`);
  console.log(`   Mode: ${session.mode}, Customer: ${session.customer}, Subscription: ${session.subscription}`);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.log(`⚠️ No userId in metadata for session ${session.id}`);
    return;
  }

  const supabase = createServerSupabaseClient();

  // Handle subscription mode (recurring payments)
  if (session.mode === 'subscription' && session.subscription) {
    try {
      // Get subscription details with expand to ensure we get all fields
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ['items.data.price'] }
      );

      const periodStart = (subscription as any).current_period_start;
      const periodEnd = (subscription as any).current_period_end;
      
      await supabase.from('user_subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        stripe_price_id: (subscription.items.data[0]?.price as any)?.id || '',
        stripe_status: subscription.status,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : new Date().toISOString(),
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
      });
      
      console.log(`✅ Subscription created/updated for user ${userId}`);
    } catch (error: any) {
      console.error(`❌ Error processing subscription:`, error.message);
      throw error;
    }
  } 
  // Handle payment mode (one-time payments)
  else if (session.mode === 'payment') {
    console.log(`📝 One-time payment completed for user ${userId}`);
    // For one-time payments, you might want to grant temporary access
    // or handle it differently. For now, we'll just log it.
    // You could add a one-time payment grant here if needed.
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createServerSupabaseClient();
  
  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!existing) return;

  const periodStart = (subscription as any).current_period_start;
  const periodEnd = (subscription as any).current_period_end;

  await supabase
    .from('user_subscriptions')
    .update({
      stripe_status: subscription.status,
      stripe_price_id: (subscription.items.data[0]?.price as any)?.id || '',
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : new Date().toISOString(),
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createServerSupabaseClient();
  
  await supabase
    .from('user_subscriptions')
    .update({
      stripe_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price']
  });
  const supabase = createServerSupabaseClient();

  const periodStart = subscription.current_period_start;
  const periodEnd = subscription.current_period_end;

  await supabase
    .from('user_subscriptions')
    .update({
      stripe_status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : new Date().toISOString(),
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const supabase = createServerSupabaseClient();
  
  await supabase
    .from('user_subscriptions')
    .update({
      stripe_status: 'past_due',
    })
    .eq('stripe_subscription_id', subscriptionId);
}

