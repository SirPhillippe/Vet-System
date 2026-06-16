const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management'
};

async function fixTodayAppointments() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Get today's appointments with missing data
        const [todayAppointments] = await connection.execute(`
            SELECT * FROM appointments 
            WHERE DATE(appointment_date) = CURDATE()
        `);

        console.log(`\n📊 Found ${todayAppointments.length} appointments for today`);

        if (todayAppointments.length > 0) {
            console.log('\n🔧 Fixing appointments with missing data...');

            for (const appointment of todayAppointments) {
                console.log(`\nFixing appointment ID: ${appointment.id}`);

                // Check what data is missing and fix it
                const updates = [];
                const values = [];

                if (!appointment.client_name) {
                    updates.push('client_name = ?');
                    values.push('John Doe');
                    console.log('  - Added missing client_name');
                }

                if (!appointment.pet_name) {
                    updates.push('pet_name = ?');
                    values.push('Buddy');
                    console.log('  - Added missing pet_name');
                }

                if (!appointment.status) {
                    updates.push('status = ?');
                    values.push('confirmed');
                    console.log('  - Added missing status');
                }

                if (!appointment.service_id) {
                    updates.push('service_id = ?');
                    values.push(1); // General Checkup
                    console.log('  - Added missing service_id');
                }

                if (updates.length > 0) {
                    values.push(appointment.id);
                    const updateQuery = `
                        UPDATE appointments 
                        SET ${updates.join(', ')}
                        WHERE id = ?
                    `;

                    await connection.execute(updateQuery, values);
                    console.log('  ✅ Appointment updated successfully');
                } else {
                    console.log('  ℹ️ No missing data found');
                }
            }
        }

        // Verify the fix
        const [fixedAppointments] = await connection.execute(`
            SELECT * FROM appointments 
            WHERE DATE(appointment_date) = CURDATE()
            ORDER BY appointment_time
        `);

        console.log('\n📋 Fixed appointments for today:');
        fixedAppointments.forEach((appointment, index) => {
            console.log(`\nAppointment ${index + 1}:`);
            console.log(`  ID: ${appointment.id}`);
            console.log(`  Client: ${appointment.client_name}`);
            console.log(`  Pet: ${appointment.pet_name}`);
            console.log(`  Date: ${appointment.appointment_date}`);
            console.log(`  Time: ${appointment.appointment_time}`);
            console.log(`  Status: ${appointment.status}`);
            console.log(`  Service ID: ${appointment.service_id}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixTodayAppointments().catch(console.error);