import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, PLAN_PRICES } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { plan, billing = "monthly" } = await request.json();

    if (!plan || !["PRO", "BUSINESS"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const prices = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    const priceConfig = billing === "yearly" ? prices.yearly : prices.monthly;

    const userId = (session.user as any).id;
    const userEmail = session.user.email!;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      userId,
      userEmail,
      priceId: priceConfig.priceId,
      successUrl: `${baseUrl}/dashboard?upgraded=true`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
