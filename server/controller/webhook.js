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
    console.log("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { transitionId, appId } = session.metadata;

      if (appId !== "smartgpt") return res.json({ received: true });

      const transition = await Transition.findOne({
        _id: transitionId,
        isPaid: false,
      });

      if (!transition) return res.json({ received: true });

      await User.updateOne(
        { _id: transition.userId },
        { $inc: { credits: transition.credits } }
      );

      transition.isPaid = true;
      await transition.save();
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Server Error");
  }
};
