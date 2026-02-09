import Transition from "../models/transition.js";
import Stripe from "stripe";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      "✔ 500 image generations",
      "✔ 24/7 VIP support",
      "✔ Access to premium models",
      "✔ Dedicated account manager",
    ],
  },
];

// Get Plans
export const getplans = async (req, res) => {
  res.json({ success: true, plans: dummyPlans });
};

// Purchase Plan
export const purchaseplan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = dummyPlans.find((p) => p._id === planId);
    if (!plan) return res.json({ success: false, message: "Invalid plan" });

    const transition = await Transition.create({
      userId,
      planId,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

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
      success_url: `${process.env.CLIENT_URL}/loading`,
      cancel_url: `${process.env.CLIENT_URL}`,

      // 🔥 CRITICAL FIX — metadata must go inside payment_intent_data
      payment_intent_data: {
        metadata: {
          transitionId: transition._id.toString(),
          appId: "smartgpt",
        },
      },

      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.log("Stripe Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
