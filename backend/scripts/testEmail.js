const { sendAppointmentConfirmation } = require('../utils/emailService');

// Test data
const testData = {
    to: process.env.EMAIL_USER, // Send to yourself for testing
    name: "Test User",
    date: new Date().toISOString(),
    time: "14:30",
    service: "General Checkup",
    paymentUrl: "https://example.com/payment"
};

async function testEmailService() {
    try {
        console.log('🚀 Testing email service...');
        await sendAppointmentConfirmation(testData);
        console.log('✅ Test email sent successfully!');
    } catch (error) {
        console.error('❌ Error sending test email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
}

testEmailService();