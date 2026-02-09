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
  } catch (error) {
    console.error("❌ Signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const sessionList = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      if (!sessionList.data.length) {
        console.log("No session found for payment");
        return res.json({ received: true });
      }

      const session = sessionList.data[0];
      const { transitionId, appId } = session.metadata;

      if (appId !== "smartgpt") {
        console.log("Ignored event for different app");
        return res.json({ received: true });
      }

      const transition = await Transition.findOne({
        _id: transitionId,
        isPaid: false,
      });

      if (!transition) {
        console.log("Transition not found or already paid");
        return res.json({ received: true });
      }

      await User.updateOne(
        { _id: transition.userId },
        { $inc: { credits: transition.credits } }
      );

      transition.isPaid = true;
      await transition.save();

      console.log("✅ Credits added successfully");
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
};
