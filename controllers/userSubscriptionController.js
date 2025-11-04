import UserSubscription from "../models/UserSubscription.js";

// GET current user's subscription
export const getCurrentUserSubscription = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const subscription = await UserSubscription.findOne({ 
      user_id: userId 
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    res.json(subscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create new subscription
export const createUserSubscription = async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;
    const userId = req.user._id || req.user.id;
    
    // Check if user already has subscription
    const existing = await UserSubscription.findOne({ user_id: userId });
    if (existing && existing.status === 'active') {
      return res.status(400).json({ 
        message: 'Active subscription already exists. Use PUT to update.' 
      });
    }
    
    // Calculate price based on plan
    const prices = {
      free: { monthly: 0, yearly: 0 },
      basic: { monthly: 19, yearly: 199 },
      premium: { monthly: 49, yearly: 499 },
      professional: { monthly: 99, yearly: 999 }
    };
    
    const subscription = new UserSubscription({
      user_id: userId,
      plan,
      billingCycle,
      price: prices[plan][billingCycle],
      startDate: new Date()
    });
    
    await subscription.save();
    res.status(201).json(subscription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update subscription
export const updateUserSubscription = async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;
    const userId = req.user._id || req.user.id;
    
    let subscription = await UserSubscription.findOne({ user_id: userId });
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    // Calculate price based on plan
    const prices = {
      free: { monthly: 0, yearly: 0 },
      basic: { monthly: 19, yearly: 199 },
      premium: { monthly: 49, yearly: 499 },
      professional: { monthly: 99, yearly: 999 }
    };
    
    // Update subscription
    subscription.plan = plan;
    subscription.billingCycle = billingCycle;
    subscription.price = prices[plan][billingCycle];
    subscription.startDate = new Date(); // Reset start date
    subscription.status = 'active';
    
    await subscription.save(); // Pre-save hook will calculate new expiration
    res.json(subscription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE cancel subscription
export const cancelUserSubscription = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const subscription = await UserSubscription.findOne({ user_id: userId });
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();
    
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin endpoints
export const getUserSubscriptions = async (req, res) => {
  try {
    const subs = await UserSubscription.find().populate('user_id');
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const sub = await UserSubscription.findById(req.params.id).populate('user_id');
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    await UserSubscription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscription deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
