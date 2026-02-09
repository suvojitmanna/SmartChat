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
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.log("❌ Signature verification failed.");
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const { transitionId, appId } = session.metadata || {};

        if (appId !== "smartgpt") {
          return res.json({ received: true });
        }

        const transition = await Transition.findOne({
          _id: transitionId,
          isPaid: false,
        });

        if (!transition) {
          return res.status(404).json({
            message: "Transaction not found or already paid",
          });
        }

        await User.updateOne(
          { _id: transition.userId },
          { $inc: { credits: transition.credits } },
        );

        transition.isPaid = true;
        await transition.save();

        console.log("✅ Credits added to user:", transition.userId);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
};
