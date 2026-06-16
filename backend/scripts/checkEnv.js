require('dotenv').config();

console.log('Checking environment variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set');

// Print first and last character of credentials (for verification without exposing full values)
if (process.env.EMAIL_USER) {
    console.log('EMAIL_USER starts with:', process.env.EMAIL_USER[0]);
    console.log('EMAIL_USER ends with:', process.env.EMAIL_USER.slice(-1));
}

if (process.env.EMAIL_APP_PASSWORD) {
    console.log('EMAIL_APP_PASSWORD length:', process.env.EMAIL_APP_PASSWORD.length);
}