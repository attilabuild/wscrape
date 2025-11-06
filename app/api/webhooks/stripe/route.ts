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
      console.error(`   Error stack:`, error.stack);
      console.error(`   Error name:`, error.name);
      
      // Provide more helpful error messages for common issues
      let errorMessage = error.message || 'Unknown error';
      if (error.message?.includes('Invalid API key') || error.message?.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        errorMessage = 'Invalid Supabase service role key. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.';
        console.error('⚠️ CRITICAL: Supabase service role key is invalid or missing!');
        console.error('⚠️ This is preventing webhooks from saving subscriptions to the database.');
        console.error('⚠️ Get the correct key from: Supabase Dashboard → Project Settings → API → service_role key');
      }
      
      return NextResponse.json(
        { error: `Webhook handler failed: ${errorMessage}` },
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
    // Try to get userId from customer metadata as fallback
    const customerId = session.customer as string;
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && (customer as any).metadata?.userId) {
          const fallbackUserId = (customer as any).metadata.userId;
          console.log(`📋 Found userId from customer metadata: ${fallbackUserId}`);
          // Continue with fallback userId
          return await saveSubscriptionFromCheckout(session, fallbackUserId);
        }
      } catch (error) {
        console.error(`❌ Error retrieving customer ${customerId}:`, error);
      }
    }
    console.log(`❌ Cannot process checkout - no userId found`);
    return;
  }

  return await saveSubscriptionFromCheckout(session, userId);
}

async function saveSubscriptionFromCheckout(session: Stripe.Checkout.Session, userId: string) {
  const supabase = createServerSupabaseClient();

  // Handle subscription mode (recurring payments)
  if (session.mode === 'subscription' && session.subscription) {
    try {
      console.log(`📋 Retrieving subscription ${session.subscription} for user ${userId}`);
      
      // Get subscription details with expand to ensure we get all fields
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ['items.data.price'] }
      );

      // Get period dates from subscription object
      // Stripe returns these as Unix timestamps (seconds since epoch)
      const periodStart = (subscription as any).current_period_start;
      const periodEnd = (subscription as any).current_period_end;
      const customerId = session.customer as string;
      
      console.log('📅 Subscription period dates:', {
        periodStart: periodStart,
        periodEnd: periodEnd,
        periodStartDate: periodStart ? new Date(periodStart * 1000).toISOString() : 'N/A',
        periodEndDate: periodEnd ? new Date(periodEnd * 1000).toISOString() : 'N/A',
        now: new Date().toISOString(),
        periodEndInFuture: periodEnd ? new Date(periodEnd * 1000) > new Date() : false
      });
      
      // Validate period dates - they should be in the future for active subscriptions
      if (periodEnd && new Date(periodEnd * 1000) <= new Date()) {
        console.warn('⚠️ WARNING: current_period_end is in the past! This should not happen for active subscriptions.');
        console.warn('   Period end:', new Date(periodEnd * 1000).toISOString());
        console.warn('   Now:', new Date().toISOString());
      }
      
      const subscriptionData = {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0]?.price?.id || '',
        stripe_status: subscription.status,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : new Date().toISOString(),
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Fallback: 30 days from now
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        updated_at: new Date().toISOString(),
      };

      console.log(`💾 Saving subscription to database:`, {
        userId,
        subscriptionId: subscription.id,
        status: subscription.status,
        customerId,
      });

      // Use upsert with proper conflict handling
      // If user_id is the primary key, upsert will update on conflict
      // Otherwise, we'll insert or update based on user_id
      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id',
        })
        .select();

      if (error) {
        console.error(`❌ Database error saving subscription:`, error);
        console.error(`   Error details:`, JSON.stringify(error, null, 2));
        
        // Try alternative: delete existing and insert new
        console.log(`🔄 Trying alternative: delete existing and insert`);
        await supabase
          .from('user_subscriptions')
          .delete()
          .eq('user_id', userId);
        
        const { data: insertData, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert(subscriptionData)
          .select();

        if (insertError) {
          console.error(`❌ Failed to insert subscription after delete:`, insertError);
          throw insertError;
        }

        console.log(`✅ Subscription saved via delete+insert method:`, insertData);
        return;
      }

      if (data && data.length > 0) {
        console.log(`✅ Subscription created/updated successfully for user ${userId}`);
        console.log(`   Saved subscription:`, {
          id: data[0].user_id,
          subscriptionId: data[0].stripe_subscription_id,
          status: data[0].stripe_status,
        });
      } else {
        console.warn(`⚠️ Upsert returned no data (but no error)`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing subscription:`, error);
      console.error(`   Stack:`, error.stack);
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
  
  // Check if subscription already exists
  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('user_id, stripe_customer_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  // Get period dates from subscription object
  // Stripe returns these as Unix timestamps (seconds since epoch)
  const periodStart = (subscription as any).current_period_start;
  const periodEnd = (subscription as any).current_period_end;
  const customerId = subscription.customer as string;

  console.log('📅 Subscription updated - period dates:', {
    periodStart: periodStart,
    periodEnd: periodEnd,
    periodStartDate: periodStart ? new Date(periodStart * 1000).toISOString() : 'N/A',
    periodEndDate: periodEnd ? new Date(periodEnd * 1000).toISOString() : 'N/A',
    now: new Date().toISOString(),
    periodEndInFuture: periodEnd ? new Date(periodEnd * 1000) > new Date() : false
  });

  // Validate period dates - they should be in the future for active subscriptions
  if (periodEnd && new Date(periodEnd * 1000) <= new Date()) {
    console.warn('⚠️ WARNING: current_period_end is in the past! This should not happen for active subscriptions.');
    console.warn('   Period end:', new Date(periodEnd * 1000).toISOString());
    console.warn('   Now:', new Date().toISOString());
  }

  const subscriptionData = {
    stripe_subscription_id: subscription.id,
    stripe_status: subscription.status,
    stripe_price_id: (subscription.items.data[0]?.price as any)?.id || '',
    stripe_customer_id: customerId,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : new Date().toISOString(),
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Fallback: 30 days from now
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    // Update existing subscription
    await supabase
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('stripe_subscription_id', subscription.id);
    
    console.log(`✅ Subscription updated for user ${existing.user_id}`);
  } else {
    // Subscription doesn't exist yet - try multiple methods to find user
    let userId: string | null = null;

    // Method 1: Find by customer_id in existing subscription records
    const { data: customerSubscription } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (customerSubscription?.user_id) {
      userId = customerSubscription.user_id;
      console.log(`📋 Found user_id via customer_id lookup: ${userId}`);
    } else {
      // Method 2: Get user_id from Stripe customer metadata
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && (customer as any).metadata?.userId) {
          userId = (customer as any).metadata.userId;
          console.log(`📋 Found user_id via Stripe customer metadata: ${userId}`);
        }
      } catch (error) {
        console.error(`❌ Error retrieving Stripe customer ${customerId}:`, error);
      }
    }

    if (userId) {
      // Found user - create/update subscription
      console.log(`💾 Saving subscription ${subscription.id} for user ${userId}`);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert({
          ...subscriptionData,
          user_id: userId,
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error(`❌ Database error saving subscription:`, error);
        // Try delete + insert as fallback
        await supabase
          .from('user_subscriptions')
          .delete()
          .eq('user_id', userId);
        
        const { data: insertData, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            ...subscriptionData,
            user_id: userId,
          })
          .select();

        if (insertError) {
          console.error(`❌ Failed to insert subscription:`, insertError);
          throw insertError;
        }

        console.log(`✅ Subscription saved via delete+insert for user ${userId}`);
      } else if (data && data.length > 0) {
        console.log(`✅ Subscription created/updated for user ${userId}:`, {
          subscriptionId: data[0].stripe_subscription_id,
          status: data[0].stripe_status,
        });
      } else {
        console.warn(`⚠️ Upsert returned no data for user ${userId}`);
      }
    } else {
      // No user found - log detailed warning
      console.warn(`⚠️ Could not find user for subscription ${subscription.id} (customer: ${customerId})`);
      console.warn(`   Tried: customer_id lookup, Stripe customer metadata`);
      console.warn(`   This subscription will not be accessible until linked to a user`);
      console.warn(`   The subscription will be linked when checkout.session.completed fires`);
    }
  }
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

