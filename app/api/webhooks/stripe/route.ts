import { NextRequest, NextResponse } from "next/server";
import { stripe, priceIdToPlan } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ─── Checkout completed → Activate plan ───
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;

        if (!userId) break;

        // Get subscription to find the price
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const priceId = subscription.items.data[0]?.price?.id;
          const plan = priceId ? priceIdToPlan(priceId) : "PRO";

          await db.user.update({
            where: { id: userId },
            data: {
              plan: plan as any,
              stripeId: session.customer as string,
            },
          });

          console.log(`User ${userId} upgraded to ${plan}`);
        }
        break;
      }

      // ─── Subscription updated (plan change) ───
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const plan = priceId ? priceIdToPlan(priceId) : "FREE";

        // Check if subscription is still active
        if (subscription.status === "active" || subscription.status === "trialing") {
          await db.user.update({
            where: { id: userId },
            data: { plan: plan as any },
          });
        }
        break;
      }

      // ─── Subscription canceled → Downgrade to free ───
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await db.user.update({
          where: { id: userId },
          data: { plan: "FREE" },
        });

        console.log(`User ${userId} downgraded to FREE`);
        break;
      }

      // ─── Payment failed ───
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`Payment failed for customer ${invoice.customer}`);
        // TODO: Send email notification to user
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
