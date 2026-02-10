import mongoose from "mongoose";

const transitionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planId: String,
  amount: Number,
  credits: Number,
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Transition", transitionSchema);
