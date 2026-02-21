// app/api/stripe/create-checkout-session/route.js

import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // Initialize Stripe INSIDE the function
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { priceId, userId, plan, billingCycle } = await request.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment`,
      metadata: {
        userId,
        plan,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
          billingCycle,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
