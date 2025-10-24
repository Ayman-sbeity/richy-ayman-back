import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    monthly_price: { type: Number, required: true },
    yearly_price: { type: Number, required: true },
    max_listings: { type: Number, required: true, default: 1 },
    max_photos: { type: Number, required: true, default: 5 },
    validity_days: { type: Number, required: true, default: 30 },
    user_type: { type: String, required: true, enum: ["owner", "realtor", "both"] },
    highlighted: { type: Boolean, default: false },
    features: { type: [String] },
  },
  { timestamps: true }
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
