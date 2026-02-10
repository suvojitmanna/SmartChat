import Stripe from "stripe";
import Transition from "../models/transition.js";
import User from "../models/user.js";

export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // CASE 1 — Preferred
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { transitionId, appId } = session.metadata;

      if (appId !== "smartgpt") return res.json({ received: true });

      await processCredit(transitionId);
    }

    // CASE 2 — Fallback if checkout event missed
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessions.data[0];
      if (!session) return res.json({ received: true });

      const { transitionId, appId } = session.metadata;
      if (appId !== "smartgpt") return res.json({ received: true });

      await processCredit(transitionId);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Server Error");
  }
};

// Credit processor
async function processCredit(transitionId) {
  const transition = await Transition.findOne({
    _id: transitionId,
    isPaid: false,
  });

  if (!transition) {
    console.log("Already processed or not found");
    return;
  }

  await User.updateOne(
    { _id: transition.userId },
    { $inc: { credits: transition.credits } }
  );

  transition.isPaid = true;
  await transition.save();

  console.log("✅ Credits added:", transition.credits);
}
