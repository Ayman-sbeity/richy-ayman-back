import mongoose from "mongoose";
import dotenv from "dotenv";
import UserSubscription from "./models/UserSubscription.js";
import User from "./models/User.js";

dotenv.config();

const checkUserSubscription = async (userEmail) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`❌ User not found with email: ${userEmail}`);
      process.exit(1);
    }

    console.log("📋 User Details:");
    console.log(`  ID: ${user._id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Type: ${user.type}\n`);

    // Find all subscriptions for this user
    const subscriptions = await UserSubscription.find({ user_id: user._id });
    
    if (subscriptions.length === 0) {
      console.log("❌ No subscriptions found for this user\n");
      console.log("💡 Creating a free subscription...");
      
      const newSub = new UserSubscription({
        user_id: user._id,
        plan: 'free',
        billingCycle: 'monthly',
        status: 'active',
        price: 0,
        startDate: new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      });
      
      await newSub.save();
      console.log("✅ Free subscription created successfully!");
      
      const created = await UserSubscription.findOne({ user_id: user._id });
      console.log("\n📋 Subscription Details:");
      console.log(`  Plan: ${created.plan}`);
      console.log(`  Status: ${created.status}`);
      console.log(`  Start Date: ${created.startDate}`);
      console.log(`  Expiration Date: ${created.expirationDate}`);
      console.log(`  Billing Cycle: ${created.billingCycle}`);
      console.log(`  Price: $${created.price}`);
    } else {
      console.log(`📋 Found ${subscriptions.length} subscription(s):\n`);
      
      subscriptions.forEach((sub, index) => {
        console.log(`Subscription ${index + 1}:`);
        console.log(`  ID: ${sub._id}`);
        console.log(`  Plan: ${sub.plan}`);
        console.log(`  Status: ${sub.status}`);
        console.log(`  Start Date: ${sub.startDate}`);
        console.log(`  Expiration Date: ${sub.expirationDate}`);
        console.log(`  Billing Cycle: ${sub.billingCycle}`);
        console.log(`  Price: $${sub.price}`);
        console.log(`  Auto Renew: ${sub.autoRenew}`);
        
        const now = new Date();
        if (sub.status === 'active' && (!sub.expirationDate || sub.expirationDate > now)) {
          console.log(`  ✅ This subscription is ACTIVE and VALID`);
        } else if (sub.status !== 'active') {
          console.log(`  ⚠️  This subscription status is: ${sub.status}`);
        } else if (sub.expirationDate && sub.expirationDate <= now) {
          console.log(`  ⚠️  This subscription has EXPIRED`);
        }
        console.log();
      });
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.log("Usage: node checkSubscription.js <user-email>");
  console.log("Example: node checkSubscription.js user@example.com");
  process.exit(1);
}

checkUserSubscription(userEmail);
