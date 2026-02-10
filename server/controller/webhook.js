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
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // 🔥 Use checkout.session.completed for Stripe Checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const { transitionId, appId } = session.metadata;

      if (appId !== "smartgpt") {
        return res.json({ received: true });
      }

      const transition = await Transition.findOne({
        _id: transitionId,
        isPaid: false,
      });

      if (!transition) {
        console.log("⚠️ Transaction already processed or not found");
        return res.json({ received: true });
      }

      // 💰 Add credits
      await User.updateOne(
        { _id: transition.userId },
        { $inc: { credits: transition.credits } }
      );

      transition.isPaid = true;
      await transition.save();

      console.log("✅ Credits added:", transition.credits);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("🔥 Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
};
