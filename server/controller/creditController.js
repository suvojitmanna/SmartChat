import Transition from "../models/transition.js";
import Stripe from "stripe";
import "dotenv/config";

export const dummyPlans = [
  { _id: "basic", name: "Basic", price: 10, credits: 100, features: [] },
  { _id: "pro", name: "Pro", price: 20, credits: 500, features: [] },
  { _id: "premium", name: "Premium", price: 30, credits: 1000, features: [] },
];

export const getplans = async (req, res) => {
  res.json({ success: true, plans: dummyPlans });
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
  payment_method_types: ["card"],
  mode: "payment",
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
  success_url: `${process.env.CLIENT_URL}/loading`,
  cancel_url: `${process.env.CLIENT_URL}`,

  metadata: {
    transitionId: transition._id.toString(),
    appId: "smartgpt",
  },

  // 🔥 THIS FIXES EVERYTHING
  payment_intent_data: {
    metadata: {
      transitionId: transition._id.toString(),
      appId: "smartgpt",
    },
  },
});

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
