const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management'
};

async function checkAppointmentsData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Check appointments count
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
        console.log(`\n📊 Total appointments: ${count[0].count}`);

        // Show sample data
        const [appointments] = await connection.execute('SELECT * FROM appointments LIMIT 5');
        console.log('\n📋 Sample appointments:');
        appointments.forEach((appointment, index) => {
            console.log(`\nAppointment ${index + 1}:`);
            Object.keys(appointment).forEach(key => {
                console.log(`  ${key}: ${appointment[key]}`);
            });
        });

        // Check for today's appointments
        const [todayCount] = await connection.execute('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()');
        console.log(`\n📅 Today's appointments: ${todayCount[0].count}`);

        // Check status distribution
        const [statusCounts] = await connection.execute('SELECT status, COUNT(*) as count FROM appointments GROUP BY status');
        console.log('\n📈 Status distribution:');
        statusCounts.forEach(status => {
            console.log(`  ${status.status}: ${status.count}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAppointmentsData().catch(console.error);