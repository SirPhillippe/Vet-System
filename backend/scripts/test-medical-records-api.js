const { query } = require('../config/database');

async function testMedicalRecordsAPI() {
    try {
        console.log('Testing medical records API...');

        // Test 1: Check if medical_records table exists and has data
        console.log('\n1. Checking medical_records table...');
        const countResult = await query('SELECT COUNT(*) as count FROM medical_records');
        console.log(`Total medical records: ${countResult[0].count}`);

        // Test 2: Get a sample of medical records
        console.log('\n2. Getting sample medical records...');
        const records = await query(`
            SELECT mr.*, u.name as vet_name 
            FROM medical_records mr 
            LEFT JOIN users u ON mr.vet_id = u.id 
            WHERE mr.status = 'active'
            ORDER BY mr.record_date DESC 
            LIMIT 5
        `);
        
        console.log(`Found ${records.length} active records:`);
        records.forEach((record, index) => {
            console.log(`${index + 1}. ${record.patient_name} (${record.owner_name}) - ${record.diagnosis}`);
        });

        // Test 3: Check users table for vet information
        console.log('\n3. Checking users table for vet information...');
        const users = await query('SELECT id, name, role FROM users WHERE role = "vet" OR role = "admin" LIMIT 5');
        console.log('Available users:');
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Name: ${user.name}, Role: ${user.role}`);
        });

        // Test 4: Simulate the admin API query
        console.log('\n4. Simulating admin API query...');
        const adminQuery = `
            SELECT mr.*, u.name as vet_name 
            FROM medical_records mr 
            LEFT JOIN users u ON mr.vet_id = u.id 
            WHERE mr.status = 'active'
            ORDER BY mr.record_date DESC, mr.created_at DESC 
            LIMIT 10 OFFSET 0
        `;
        
        const adminResults = await query(adminQuery);
        console.log(`Admin query returned ${adminResults.length} records`);
        
        if (adminResults.length > 0) {
            console.log('Sample record structure:');
            console.log(JSON.stringify(adminResults[0], null, 2));
        }

    } catch (error) {
        console.error('Error testing medical records API:', error);
    } finally {
        process.exit(0);
    }
}

// Run the test
testMedicalRecordsAPI(); 