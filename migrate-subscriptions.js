
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/Listing.js';
import UserSubscription from './models/UserSubscription.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  await migrateSubscriptions();
});

async function migrateSubscriptions() {
  try {
    console.log('Starting migration...\n');

    const listingsWithSubscriptions = await Listing.find({
      $or: [
        { subscription_plan: { $exists: true, $ne: null } },
        { billing_cycle: { $exists: true, $ne: null } }
      ]
    });

    console.log(`Found ${listingsWithSubscriptions.length} listings with subscription data\n`);

    const userSubscriptionMap = new Map();

    for (const listing of listingsWithSubscriptions) {
      const userId = listing.user_id.toString();
      
      if (!listing.subscription_plan || !listing.billing_cycle) {
        console.log(`⚠️  Skipping listing ${listing._id} - incomplete subscription data`);
        continue;
      }
      const planMap = {
        'Free': 'free',
        'free': 'free',
        'Basic': 'basic',
        'basic': 'basic',
        'Premium': 'premium',
        'premium': 'premium',
        'Professional': 'professional',
        'professional': 'professional'
      };

      const plan = planMap[listing.subscription_plan] || 'free';
      const billingCycle = listing.billing_cycle.toLowerCase();

      // Keep track of the highest plan for each user
      if (!userSubscriptionMap.has(userId)) {
        userSubscriptionMap.set(userId, {
          user_id: listing.user_id,
          plan: plan,
          billingCycle: billingCycle,
          startDate: listing.createdAt || new Date(),
          latestExpiry: listing.expires_at || new Date()
        });
      } else {
        // If user has multiple listings, keep the highest plan
        const existing = userSubscriptionMap.get(userId);
        const planPriority = { free: 0, basic: 1, premium: 2, professional: 3 };
        
        if (planPriority[plan] > planPriority[existing.plan]) {
          existing.plan = plan;
          existing.billingCycle = billingCycle;
        }

        // Keep the latest expiry date
        if (listing.expires_at && listing.expires_at > existing.latestExpiry) {
          existing.latestExpiry = listing.expires_at;
        }
      }
    }

    console.log(`Found ${userSubscriptionMap.size} unique users with subscriptions\n`);

    // Step 3: Create UserSubscription records
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const [userId, subData] of userSubscriptionMap) {
      try {
        // Check if subscription already exists
        const existing = await UserSubscription.findOne({ user_id: subData.user_id });
        
        if (existing) {
          console.log(`⏭️  Skipping user ${userId} - subscription already exists`);
          skipped++;
          continue;
        }

        // Calculate price
        const prices = {
          free: { monthly: 0, yearly: 0 },
          basic: { monthly: 19, yearly: 199 },
          premium: { monthly: 49, yearly: 499 },
          professional: { monthly: 99, yearly: 999 }
        };

        // Create subscription
        const subscription = new UserSubscription({
          user_id: subData.user_id,
          plan: subData.plan,
          billingCycle: subData.billingCycle,
          startDate: subData.startDate,
          price: prices[subData.plan][subData.billingCycle],
          status: subData.latestExpiry > new Date() ? 'active' : 'expired',
          autoRenew: false
        });

        // Save (pre-save hook will calculate expirationDate)
        await subscription.save();
        
        console.log(`✅ Created subscription for user ${userId} - ${subData.plan}/${subData.billingCycle}`);
        created++;
      } catch (err) {
        console.error(`❌ Error creating subscription for user ${userId}:`, err.message);
        errors++;
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`✅ Created: ${created} subscriptions`);
    console.log(`⏭️  Skipped: ${skipped} (already existed)`);
    console.log(`❌ Errors: ${errors}`);

    // Step 4: Clean up old fields from listings
    if (created > 0 || skipped > 0) {
      console.log('\n--- Cleaning up old fields from listings ---');
      
      const result = await Listing.updateMany(
        {},
        { 
          $unset: { 
            subscription_plan: '',
            billing_cycle: '',
            expires_at: ''
          }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} listings (removed old subscription fields)`);
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\nMigration interrupted by user');
  process.exit(0);
});
