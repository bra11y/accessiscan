/**
 * ─── Stripe Integration ───
 *
 * Free tier: No Stripe needed (just plan limits in DB)
 * Paid tiers: Stripe Checkout → Webhook → Update user plan
 *
 * "Make it easy to give you money." — Every successful founder
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
  typescript: true,
});

// ─── Price IDs (create these in Stripe Dashboard) ───
// For MVP: create products manually at dashboard.stripe.com
export const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || "price_pro_yearly",
  BUSINESS_MONTHLY: process.env.STRIPE_PRICE_BIZ_MONTHLY || "price_biz_monthly",
  BUSINESS_YEARLY: process.env.STRIPE_PRICE_BIZ_YEARLY || "price_biz_yearly",
};

// ─── Plan to Price mapping ───
export const PLAN_PRICES = {
  PRO: {
    monthly: { priceId: PRICE_IDS.PRO_MONTHLY, amount: 49 },
    yearly: { priceId: PRICE_IDS.PRO_YEARLY, amount: 468 }, // $39/mo billed yearly
  },
  BUSINESS: {
    monthly: { priceId: PRICE_IDS.BUSINESS_MONTHLY, amount: 149 },
    yearly: { priceId: PRICE_IDS.BUSINESS_YEARLY, amount: 1428 }, // $119/mo billed yearly
  },
};

// ─── Create Checkout Session ───
export async function createCheckoutSession({
  userId,
  userEmail,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
      trial_period_days: 14, // 14-day free trial
    },
    allow_promotion_codes: true,
  });

  return session;
}

// ─── Create Customer Portal Session ───
// For managing/canceling subscriptions
export async function createPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

// ─── Get Subscription Details ───
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

// ─── Map Stripe Price to Plan ───
export function priceIdToPlan(priceId: string): string {
  if (
    priceId === PRICE_IDS.PRO_MONTHLY ||
    priceId === PRICE_IDS.PRO_YEARLY
  ) return "PRO";
  if (
    priceId === PRICE_IDS.BUSINESS_MONTHLY ||
    priceId === PRICE_IDS.BUSINESS_YEARLY
  ) return "BUSINESS";
  return "FREE";
}
