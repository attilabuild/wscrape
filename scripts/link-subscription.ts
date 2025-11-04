/**
 * Script to manually link a Stripe subscription to a user
 * Run this if the webhook didn't properly link the subscription
 * 
 * Usage: npx tsx scripts/link-subscription.ts <user_id> <stripe_subscription_id>
 */

import { createServerSupabaseClient } from '../lib/supabase-server';
import { stripe } from '../lib/stripe';

async function linkSubscription(userId: string, subscriptionId: string) {
  console.log(`🔗 Linking subscription ${subscriptionId} to user ${userId}`);

  try {
    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price']
    });

    const customerId = subscription.customer as string;
    const periodStart = subscription.current_period_start;
    const periodEnd = subscription.current_period_end;

    console.log(`📋 Subscription details:`, {
      customerId,
      status: subscription.status,
      periodStart: new Date(periodStart * 1000).toISOString(),
      periodEnd: new Date(periodEnd * 1000).toISOString(),
    });

    const supabase = createServerSupabaseClient();

    // Upsert subscription
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0]?.price?.id || '',
        stripe_status: subscription.status,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('❌ Error linking subscription:', error);
      process.exit(1);
    }

    console.log('✅ Subscription linked successfully!');
    console.log('📊 Linked subscription:', data);
  } catch (error: any) {
    console.error('❌ Failed to link subscription:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const userId = process.argv[2];
const subscriptionId = process.argv[3];

if (!userId || !subscriptionId) {
  console.error('Usage: npx tsx scripts/link-subscription.ts <user_id> <stripe_subscription_id>');
  console.error('Example: npx tsx scripts/link-subscription.ts 73a20bc0-6324-4978-b6a7-21570152c94e sub_1SPpOHB6ArUEh15JQiC4rsqr');
  process.exit(1);
}

linkSubscription(userId, subscriptionId);

