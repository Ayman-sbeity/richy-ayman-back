import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true  // One subscription per user
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'professional'],
      required: true,
      default: 'free'
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
      default: 'monthly'
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    expirationDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Calculate expiration date based on billing cycle
userSubscriptionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('billingCycle') || this.isModified('startDate')) {
    const start = new Date(this.startDate || Date.now());
    if (this.billingCycle === 'monthly') {
      this.expirationDate = new Date(start.setMonth(start.getMonth() + 1));
    } else if (this.billingCycle === 'yearly') {
      this.expirationDate = new Date(start.setFullYear(start.getFullYear() + 1));
    }
  }
  next();
});

export default mongoose.model('UserSubscription', userSubscriptionSchema);
