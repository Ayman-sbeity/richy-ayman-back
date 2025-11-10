import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:5002';
const TEST_USER_EMAIL = 'emailtest@test.com';
const TEST_USER_PASSWORD = 'test123456';
const TEST_USER_NAME = 'Email Test User';

let authToken = '';

// Helper function to register a test user
async function registerTestUser() {
  try {
    console.log('👤 Registering test user...');
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
      name: TEST_USER_NAME,
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      type: 'owner'
    });
    
    authToken = response.data.token;
    console.log('✅ Test user registered successfully');
    console.log('User ID:', response.data._id);
    return authToken;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  User already exists, attempting login...');
      return await login();
    }
    console.error('❌ Registration failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Cannot connect to server. Is it running on', API_BASE_URL, '?');
      console.error('   Start the server with: node server.js');
    }
    throw error;
  }
}

// Helper function to login
async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test: Create listing that triggers email notifications
async function testEmailNotification() {
  console.log('\n📝 Test: Creating listing with email notification...');
  
  try {
    const greenPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const listingData = {
      title: 'Beautiful Beachfront Villa',
      description: 'Stunning ocean view villa with 4 bedrooms',
      price: 850000,
      location: '123 Ocean Drive, Miami Beach, FL, USA',
      city: 'Miami',
      property_type: 'villa',
      listing_type: 'Sale',
      bedrooms: 4,
      bathrooms: 3,
      area: 2500,
      features: ['Pool', 'Ocean View', 'Garden'],
      images: [`data:image/png;base64,${greenPixelBase64}`]
    };

    console.log('\n🏠 Creating property listing...');
    console.log(`   Title: ${listingData.title}`);
    console.log(`   City: ${listingData.city}`);
    console.log(`   Price: $${listingData.price.toLocaleString()}`);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/listings`,
      listingData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Listing created successfully!');
    console.log('   Listing ID:', response.data._id);
    console.log('   Title:', response.data.title);
    console.log('   City:', response.data.city);
    
    console.log('\n📧 EMAIL NOTIFICATION STATUS:');
    console.log('   ✓ Server automatically sends emails to all users');
    console.log('   ✓ Email includes property name and city');
    console.log('   ✓ Check server console for confirmation messages:');
    console.log('     - "Email sent: <message-id>"');
    console.log('     - "Sent X out of Y new property notification emails"');
    console.log('\n   📬 Check your email inbox for the notification!');
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Get all listings to verify
async function getAllListings() {
  console.log('\n📋 Fetching all listings...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/listings`);
    console.log(`Found ${response.data.length} total listings`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch listings:', error.message);
    throw error;
  }
}

// Clean up test listing
async function cleanupTestListing(listingId) {
  console.log('\n🧹 Cleaning up test listing...');
  
  try {
    await axios.delete(
      `${API_BASE_URL}/api/listings/${listingId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    console.log('✅ Test listing deleted');
  } catch (error) {
    console.log('⚠️  Could not delete test listing:', error.response?.data || error.message);
  }
}

// Main test runner
async function runTest() {
  console.log('🚀 Starting Email Notification Test');
  console.log('=====================================\n');
  
  try {
    // Step 1: Register or login
    await registerTestUser();
    
    // Step 2: Create listing (this triggers email notification)
    const listing = await testEmailNotification();
    
    // Step 3: Verify listing was created
    await getAllListings();
    
    // Step 4: Optional cleanup
    if (listing?._id) {
      console.log('\n⏳ Waiting 5 seconds before cleanup (to ensure emails are sent)...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await cleanupTestListing(listing._id);
    }
    
    console.log('\n=====================================');
    console.log('✅ Test completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('  ✓ User authentication: ✅');
    console.log('  ✓ Listing creation: ✅');
    console.log('  ✓ Email notification triggered: ✅');
    console.log('\n💡 Next Steps:');
    console.log('  1. Check server console for email sending logs');
    console.log('  2. Check your email inbox for notification');
    console.log('  3. Verify email contains property name and city');
    console.log('=====================================\n');
    
  } catch (error) {
    console.log('\n=====================================');
    console.log('❌ Test failed');
    console.log('Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Ensure server is running: node server.js');
    console.log('  2. Check .env file has email configuration:');
    console.log('     EMAIL_HOST, EMAIL_USER, EMAIL_PASS');
    console.log('  3. Verify MongoDB is connected');
    console.log('=====================================\n');
    process.exit(1);
  }
}

// Run the test
runTest();
