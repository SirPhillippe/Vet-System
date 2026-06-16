const axios = require('axios');

async function testVetAppointmentsAPI() {
    try {
        console.log('🧪 Testing vet appointments API...');

        // Test the vet appointments endpoint
        const response = await axios.get('http://localhost:5000/api/vet/appointments', {
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this with a valid token
            }
        });

        console.log('✅ API Response Status:', response.status);
        console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ API Error:', error.response ? {
            status: error.response.status,
            data: error.response.data
        } : error.message);
    }
}

// Also test without authentication to see the error
async function testWithoutAuth() {
    try {
        console.log('\n🧪 Testing without authentication...');

        const response = await axios.get('http://localhost:5000/api/vet/appointments');
        console.log('✅ Response:', response.data);

    } catch (error) {
        console.log('❌ Expected error (no auth):', error.response ? {
            status: error.response.status,
            data: error.response.data
        } : error.message);
    }
}

// Test the admin endpoint as well
async function testAdminAppointmentsAPI() {
    try {
        console.log('\n🧪 Testing admin appointments API...');

        const response = await axios.get('http://localhost:5000/api/admin/appointments');
        console.log('✅ Admin API Response Status:', response.status);
        console.log('📊 Admin Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Admin API Error:', error.response ? {
            status: error.response.status,
            data: error.response.data
        } : error.message);
    }
}

async function main() {
    await testWithoutAuth();
    await testAdminAppointmentsAPI();
    await testVetAppointmentsAPI();
}

main().catch(console.error);