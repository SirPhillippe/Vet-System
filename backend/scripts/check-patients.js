const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management'
};

async function checkPatients() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Get distinct patients from appointments
        const [patients] = await connection.execute(`
            SELECT DISTINCT 
                pet_name, 
                client_name, 
                client_email, 
                client_phone,
                pet_type,
                pet_breed
            FROM appointments 
            WHERE pet_name IS NOT NULL 
            AND pet_name != '' 
            AND client_name IS NOT NULL
            ORDER BY client_name, pet_name
            LIMIT 20
        `);

        console.log(`\n📋 Found ${patients.length} unique patients:`);
        patients.forEach((patient, index) => {
            console.log(`\n${index + 1}. Pet: ${patient.pet_name}`);
            console.log(`   Owner: ${patient.client_name}`);
            console.log(`   Email: ${patient.client_email}`);
            console.log(`   Phone: ${patient.client_phone}`);
            console.log(`   Type: ${patient.pet_type || 'N/A'}`);
            console.log(`   Breed: ${patient.pet_breed || 'N/A'}`);
        });

        // Check medical records table structure
        const [medicalRecords] = await connection.execute('DESCRIBE medical_records');
        console.log('\n📊 Medical Records table structure:');
        medicalRecords.forEach(field => {
            console.log(`  ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkPatients().catch(console.error); 