import dotenv from 'dotenv';
import { sendEmail } from './utils/emailService.js';

dotenv.config();

async function testEmailConfig() {
  console.log('📧 Testing Email Configuration');
  console.log('================================\n');
  
  console.log('Email Settings:');
  console.log(`  HOST: ${process.env.EMAIL_HOST || 'Not set'}`);
  console.log(`  PORT: ${process.env.EMAIL_PORT || 'Not set'}`);
  console.log(`  USER: ${process.env.EMAIL_USER || 'Not set'}`);
  console.log(`  PASS: ${process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'Not set'}`);
  console.log(`  FROM: ${process.env.EMAIL_FROM || 'Not set'}\n`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration incomplete!');
    console.log('\n⚙️  Add these to your .env file:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
    console.log('   EMAIL_FROM="Your Company <your-email@gmail.com>"');
    return;
  }
  
  try {
    console.log('📤 Sending test email...\n');
    
    await sendEmail({
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - Property Notification System',
      html: `
        <h2>Email System Test</h2>
        <p>Your email notification system is working correctly!</p>
        <p>When new properties are created, all users will receive notifications like this.</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('   Check your inbox at:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    console.error('\n💡 Common issues:');
    console.error('   - Gmail: Use App Password, not regular password');
    console.error('   - Enable "Less secure app access" in Gmail settings');
    console.error('   - Check firewall/network settings');
  }
}

testEmailConfig();
