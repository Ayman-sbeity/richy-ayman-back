import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import { sendNewPropertyNotification } from './utils/emailService.js';

async function testListingEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    const users = await User.find({}, 'email name');
    
    if (users.length === 0) {
      console.log('⚠ No users found to send emails to');
      await mongoose.disconnect();
      return;
    }

    const testProperty = {
      title: 'Test Luxury Apartment',
      city: 'Beirut',
      property_type: 'Apartment',
      listing_type: 'Sale',
      price: 250000
    };

    const result = await sendNewPropertyNotification(users, testProperty);
    

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testListingEmail();
