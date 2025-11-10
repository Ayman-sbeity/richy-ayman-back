import dotenv from 'dotenv';
dotenv.config();

console.log('📧 Email Password Debug');
console.log('=======================\n');
console.log('Password from .env:');
console.log('Length:', process.env.EMAIL_PASS?.length);
console.log('Value:', process.env.EMAIL_PASS);
console.log('');
console.log('Expected: 16 characters (no spaces)');
console.log('');
console.log('If your password has spaces like: "jzgn akht ybow exog"');
console.log('Remove ALL spaces to get: "jzgnakhtybowexog"');
