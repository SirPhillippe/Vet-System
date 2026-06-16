const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management'
};

async function verifyDatabaseData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Check total appointments
        const [totalCount] = await connection.execute('SELECT COUNT(*) as total FROM appointments');
        console.log(`\n📊 Total appointments in database: ${totalCount[0].total}`);

        // Check appointments by date range
        const [dateRangeCount] = await connection.execute(`
            SELECT 
                CASE 
                    WHEN appointment_date < CURDATE() THEN 'Past'
                    WHEN appointment_date = CURDATE() THEN 'Today'
                    WHEN appointment_date BETWEEN CURDATE() + INTERVAL 1 DAY AND CURDATE() + INTERVAL 7 DAY THEN 'Next 7 days'
                    ELSE 'Future'
                END as period,
                COUNT(*) as count
            FROM appointments 
            GROUP BY period
            ORDER BY 
                CASE period
                    WHEN 'Past' THEN 1
                    WHEN 'Today' THEN 2
                    WHEN 'Next 7 days' THEN 3
                    ELSE 4
                END
        `);

        console.log('\n📅 Appointments by period:');
        dateRangeCount.forEach(row => {
            console.log(`  ${row.period}: ${row.count} appointments`);
        });

        // Show recent appointments (last 10)
        const [recentAppointments] = await connection.execute(`
            SELECT 
                id, 
                client_name, 
                pet_name, 
                appointment_date, 
                appointment_time, 
                status, 
                service_id,
                created_at
            FROM appointments 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        console.log('\n📋 Most recent appointments:');
        recentAppointments.forEach((appointment, index) => {
            console.log(`\n${index + 1}. ID: ${appointment.id}`);
            console.log(`   Client: ${appointment.client_name}`);
            console.log(`   Pet: ${appointment.pet_name}`);
            console.log(`   Date: ${appointment.appointment_date}`);
            console.log(`   Time: ${appointment.appointment_time}`);
            console.log(`   Status: ${appointment.status}`);
            console.log(`   Service ID: ${appointment.service_id}`);
            console.log(`   Created: ${appointment.created_at}`);
        });

        // Check appointments with service names
        const [appointmentsWithServices] = await connection.execute(`
            SELECT 
                a.id,
                a.client_name,
                a.pet_name,
                a.appointment_date,
                a.appointment_time,
                a.status,
                s.name as service_name
            FROM appointments a
            LEFT JOIN services s ON a.service_id = s.id
            WHERE DATE(a.appointment_date) = CURDATE()
            ORDER BY a.appointment_time
        `);

        console.log('\n📋 Today\'s appointments with service names:');
        if (appointmentsWithServices.length > 0) {
            appointmentsWithServices.forEach((appointment, index) => {
                console.log(`\n${index + 1}. ID: ${appointment.id}`);
                console.log(`   Client: ${appointment.client_name}`);
                console.log(`   Pet: ${appointment.pet_name}`);
                console.log(`   Time: ${appointment.appointment_time}`);
                console.log(`   Status: ${appointment.status}`);
                console.log(`   Service: ${appointment.service_name || 'Unknown'}`);
            });
        } else {
            console.log('   No appointments for today');
        }

        // Check database table structure
        const [tableStructure] = await connection.execute('DESCRIBE appointments');
        console.log('\n📋 Appointments table structure:');
        tableStructure.forEach(column => {
            console.log(`  ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key} - ${column.Default}`);
        });

        // Check if there are any appointments with NULL values
        const [nullCheck] = await connection.execute(`
            SELECT 
                COUNT(*) as total_with_nulls
            FROM appointments 
            WHERE client_name IS NULL 
               OR pet_name IS NULL 
               OR appointment_date IS NULL 
               OR appointment_time IS NULL
        `);

        console.log(`\n⚠️ Appointments with NULL values: ${nullCheck[0].total_with_nulls}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

verifyDatabaseData().catch(console.error);