import express from "express";
import { getplans, purchaseplan } from "../controller/creditController.js";
import { protect } from "../middlewares/auth.js";

const creditRouter = express.Router();

creditRouter.get("/plan", protect, getplans);
creditRouter.post("/purchase", protect, purchaseplan); // POST must match frontend

export default creditRouter;
