const db = require('../config/database');

async function checkMedicalRecordsTable() {
    try {
        console.log('🔍 Checking medical_records table...\n');

        // Check if table exists
        const [tables] = await db.query("SHOW TABLES LIKE 'medical_records'");
        if (tables.length === 0) {
            console.log('❌ medical_records table does not exist!');
            return;
        }
        console.log('✅ medical_records table exists\n');

        // Get table structure
        const columns = await db.query("DESCRIBE medical_records");
        console.log('📋 Medical Records table structure:');
        columns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        // Get record count
        const countResult = await db.query("SELECT COUNT(*) as count FROM medical_records");
        console.log(`\n📊 Current medical records count: ${countResult[0].count}`);

        // Get sample records
        const records = await db.query("SELECT * FROM medical_records LIMIT 5");
        if (records.length > 0) {
            console.log('\n📝 Sample records:');
            records.forEach((record, index) => {
                console.log(`Record ${index + 1}:`, {
                    id: record.id,
                    vet_id: record.vet_id,
                    patient_name: record.patient_name,
                    status: record.status
                });
            });
        } else {
            console.log('\n📝 No medical records found in the table');
        }

        // Check if there are any vets in the users table
        const vets = await db.query("SELECT id, name, role FROM users WHERE role = 'vet' LIMIT 5");
        console.log('\n👨‍⚕️ Available vets:');
        if (vets.length > 0) {
            vets.forEach(vet => {
                console.log(`ID: ${vet.id}, Name: ${vet.name}, Role: ${vet.role}`);
            });
        } else {
            console.log('No vets found in users table');
        }

    } catch (error) {
        console.error('❌ Error checking medical_records table:', error);
    } finally {
        process.exit(0);
    }
}

checkMedicalRecordsTable(); 