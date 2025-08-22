import Stripe from "stripe";
import express from "express";
const app = express();

// Raw body for signature verification
app.post("/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  let event;
  try {
    const sig = req.headers["stripe-signature"] as string;
    event = stripe.webhooks.constructEvent(req.body, sig, signingSecret);
  } catch (err) {
    console.error("Invalid signature", err);
    return res.status(400).send("Invalid signature");
  }
  // Enqueue a job, don't do heavy work here
  // queue.publish("stripe-events", { type: event.type, data: event.data.object });
  res.json({ received: true });
});
export default app;
