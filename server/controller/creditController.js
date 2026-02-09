import Transition from "../models/transition.js";
import Stripe from "stripe";
import "dotenv/config";

export const dummyPlans = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "✔ 100 text generations",
      "✔ 50 image generations",
      "✔ Standard support",
      "✔ Access to basic models",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features: [
      "✔ 500 text generations",
      "✔ 200 image generations",
      "✔ Priority support",
      "✔ Access to pro models",
      "✔ Faster response time",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features: [
      "✔ 1000 text generations",
      " ✔ 500 image generations",
      "✔ 24/7 VIP support",
      "✔ Access to premium models",
      "✔ Dedicated account manager",
    ],
  },
];

//API controller for getting all plan
export const getplans = async (req, res) => {
  try {
    res.json({ success: true, plans: dummyPlans });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//Api Controller for purchasing a plan
export const purchaseplan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = dummyPlans.find((p) => p._id === planId);
    if (!plan) {
      return res.json({ success: false, message: "Invalid plan" });
    }

    const transition = await Transition.create({
      userId,
      planId,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const successUrl = `${process.env.CLIENT_URL}/loading`;
    const cancelUrl = `${process.env.CLIENT_URL}`;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: { name: plan.name },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { transitionId: transition._id.toString(), appId: "smartgpt" },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    res.json({ success: true, url: session.url });

  } catch (error) {
    console.log("Stripe Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

