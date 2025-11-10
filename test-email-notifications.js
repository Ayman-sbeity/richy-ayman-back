import { sendNewPropertyNotification } from './utils/emailService.js';
import User from './models/User.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailNotifications() {
  console.log('🚀 Testing Email Notifications for New Properties');
  console.log('================================================\n');

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');

    // Get all users from database
    const users = await User.find({}, 'email name');
    console.log(`📧 Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log('⚠️  No users found in database. Creating a test user...');

      // Create a test user
      const testUser = new User({
        email: 'test@example.com',
        name: 'Test User',
        type: 'owner',
        password_hash: 'hashedpassword123'
      });
      await testUser.save();
      console.log('✅ Test user created');
      users.push(testUser);
    }

    console.log('Users to notify:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
    });
    console.log();

    // Sample property data
    const propertyData = {
      title: 'Luxury Beachfront Villa',
      city: 'Miami Beach',
      property_type: 'Villa',
      listing_type: 'Sale',
      price: 2500000
    };

    console.log('🏠 Property Details:');
    console.log(`   Title: ${propertyData.title}`);
    console.log(`   City: ${propertyData.city}`);
    console.log(`   Type: ${propertyData.property_type}`);
    console.log(`   Listing: ${propertyData.listing_type}`);
    console.log(`   Price: $${propertyData.price.toLocaleString()}`);
    console.log();

    console.log('📤 Sending email notifications...');

    const result = await sendNewPropertyNotification(users, propertyData);

    console.log('\n✅ Email notification test completed!');
    console.log(`📊 Results: ${result.success}/${result.total} emails sent successfully`);

    if (result.success === result.total) {
      console.log('🎉 All emails sent successfully!');
      console.log('\n📧 Check your email inbox for notifications with:');
      console.log(`   - Subject: "New Property Available: ${propertyData.title}"`);
      console.log(`   - Property: ${propertyData.title} in ${propertyData.city}`);
    } else {
      console.log(`⚠️  ${result.total - result.success} emails failed to send`);
      console.log('Check the console output above for error details');
    }

    console.log('\n================================================');
    console.log('✅ Email notification test finished');

  } catch (error) {
    console.log('\n❌ Email notification test failed');
    console.log('Error:', error.message);
    if (error.stack) {
      console.log('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testEmailNotifications();