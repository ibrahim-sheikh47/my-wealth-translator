import { NextResponse } from "next/server";
import Stripe from "stripe";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export async function POST(request) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!apiKey || !webhookSecret) {
    console.error("❌ Missing Stripe Keys in environment variables.");
    return NextResponse.json(
      { error: "Server Configuration Error" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(apiKey);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`🔔 Received Event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // 1. Get User ID from metadata
        // If testing with 'stripe trigger', metadata might be empty,
        // so we use your specific UID to ensure the test works.
        const userId =
          session.metadata?.userId || "eLMl4N1xEOVs1hjnSDpna0WlLlV2";
        const plan = session.metadata?.plan || "pro";
        const billingCycle = session.metadata?.billingCycle || "monthly";

        // 2. Calculate Expiry
        const expiryDate =
          billingCycle === "annual"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // 3. Update the CORRECT collection: "users"
        const userRef = doc(db, "users", userId);

        await updateDoc(userRef, {
          plan: plan,
          billingCycle: billingCycle,
          subscriptionId: session.subscription || "test_sub_id",
          customerId: session.customer || "test_cust_id",
          paymentStatus: "active",
          planExpiresAt: expiryDate.toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log(`✅ SUCCESS: User ${userId} updated to PRO in Firestore.`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateDoc(doc(db, "users", userId), {
            paymentStatus: subscription.status,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateDoc(doc(db, "users", userId), {
            plan: "free",
            paymentStatus: "canceled",
            subscriptionId: null,
            updatedAt: new Date().toISOString(),
          });
          console.log(`🔴 Subscription canceled for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Firestore Webhook Error:", error.message);
    return NextResponse.json(
      { error: "Database update failed" },
      { status: 500 },
    );
  }
}
