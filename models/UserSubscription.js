import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    billing_cycle: { type: String, required: true, enum: ['monthly', 'yearly'] },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

// Compound index for uniqueness
userSubscriptionSchema.index({ user_id: 1, plan_id: 1, start_date: 1 }, { unique: true });

export default mongoose.model('UserSubscription', userSubscriptionSchema);
