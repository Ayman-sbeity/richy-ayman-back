import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002';

async function testNewListingEmail() {
  console.log('🚀 Testing Email Notification for New Listing\n');
  
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
      email: 'emailtest@test.com',
      password: 'test123456'
    });
    
    const token = loginResponse.data.token;
    
    console.log('2️⃣  Creating new property listing...');
    const listingData = {
      title: 'Luxury Penthouse in Downtown',
      description: 'Amazing views, 3 bedrooms, modern design',
      price: 1200000,
      location: '456 Main Street, New York, NY',
      city: 'New York',
      property_type: 'apartment',
      listing_type: 'Sale',
      bedrooms: 3,
      bathrooms: 2,
      area: 1800
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/api/listings`,
      listingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    

    await axios.delete(
      `${API_BASE_URL}/api/listings/${response.data._id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Server not running. Start it with: node server.js');
    }
  }
}

testNewListingEmail();
