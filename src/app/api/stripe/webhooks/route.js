import { adminDb } from "@/app/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import Stripe from "stripe"; // ← swap this import

export async function POST(request) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!apiKey || !webhookSecret) {
    console.error("❌ Missing Stripe Keys");
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
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
        const userId = session.client_reference_id || session.metadata?.userId;

        console.log("🔍 userId:", userId);
        console.log("🔍 plan:", session.metadata?.plan);
        console.log("🔍 billingCycle:", session.metadata?.billingCycle);

        if (!userId) {
          console.error("❌ No userId found in session.");
          break;
        }

        const plan = session.metadata?.plan || "pro";
        const billingCycle = session.metadata?.billingCycle || "monthly";

        const expiryDate =
          billingCycle === "annual"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // ✅ Admin SDK syntax — no doc() wrapper needed
        await adminDb.collection("users").doc(userId).update({
          plan: plan,
          billingCycle: billingCycle,
          subscriptionId: session.subscription || "test_sub_id",
          customerId: session.customer || "test_cust_id",
          paymentStatus: "active",
          planExpiresAt: expiryDate.toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log(`✅ SUCCESS: User ${userId} updated to ${plan} in Firestore.`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await adminDb.collection("users").doc(userId).update({
            paymentStatus: subscription.status,
            updatedAt: new Date().toISOString(),
          });
          console.log(`🔄 Subscription updated for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await adminDb.collection("users").doc(userId).update({
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
    console.error("❌ Webhook processing error:", error.message);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}