import Stripe from "stripe";
import Transition from "../models/transition.js";
import User from "../models/user.js";
export const stripeWebhooks = async (requestAnimationFrame, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = Request.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      Request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error : ${error.message}`);
  }
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        {
          const paymentIntent = event.data.object;
          const sessionList = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
          });
          const session = sessionList.data[0];
          const { transactionId, appId } = session.metadata;

          if (appId === "smartgpt") {
            const transition = await Transition.findOne({
              _id: transactionId,
              isPaid: false,
            });

            //update credits in user account

            await User.updateOne(
              { _id: transition.userId },
              { $inc: { credits: transition.credits } },
            );
            //upload credit payment status
            transition.isPaid = true;
            await transition.save();
          } else {
            return response.json({
              received: true,
              message: "Ignored event: Invalid app",
            });
          }
        }
        break;
      default:
        console.log("Unhandled Event type:", event.type);
        break;
    }
    response.json({received:true})
  } catch (error) {
    console.error("Webhook processing ereror:",error)
    response.status(500).send('Internal Server Error')
  }
};
