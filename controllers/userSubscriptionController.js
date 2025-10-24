import UserSubscription from "../models/UserSubscription.js";

export const createUserSubscription = async (req, res) => {
  try {
    const subscription = new UserSubscription(req.body);
    const saved = await subscription.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const subs = await UserSubscription.find().populate('user_id plan_id');
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const sub = await UserSubscription.findById(req.params.id).populate('user_id plan_id');
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
