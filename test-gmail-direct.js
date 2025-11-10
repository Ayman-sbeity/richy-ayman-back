import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testGmailConnection() {
  console.log('🔐 Testing Gmail SMTP Connection');
  console.log('================================\n');
  
  const config = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };
  
  console.log('Config:');
  console.log('  User:', config.auth.user);
  console.log('  Pass length:', config.auth.pass?.length);
  console.log('  Pass:', config.auth.pass);
  console.log('');
  
  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport(config);
    
    console.log('Verifying connection...');
    await transporter.verify();
    
    console.log('✅ Connection verified!');
    console.log('Sending test email...\n');
    
    const info = await transporter.sendMail({
      from: `"Richi & Ayman" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email - Success!',
      text: 'If you receive this, your email is working!',
      html: '<b>If you receive this, your email is working!</b>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n📬 Check your inbox at:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Possible reasons:');
      console.error('   1. App Password is incorrect');
      console.error('   2. 2-Step Verification not properly enabled');
      console.error('   3. Wrong Gmail account');
      console.error('\n   Try creating a NEW App Password and use it immediately');
    }
  }
}

testGmailConnection();
