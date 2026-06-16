const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management'
};

async function checkServicesTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Check if services table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE "services"');
        if (tables.length === 0) {
            console.log('❌ Services table does not exist!');
            return;
        }

        console.log('✅ Services table exists');

        // Check services table structure
        const [columns] = await connection.execute('DESCRIBE services');
        console.log('\n📋 Services table structure:');
        columns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        // Check services data
        const [services] = await connection.execute('SELECT * FROM services');
        console.log(`\n📊 Total services: ${services.length}`);

        if (services.length > 0) {
            console.log('\n📋 Sample services:');
            services.forEach((service, index) => {
                console.log(`\nService ${index + 1}:`);
                Object.keys(service).forEach(key => {
                    console.log(`  ${key}: ${service[key]}`);
                });
            });
        }

        // Check appointments with service_id
        const [appointmentsWithService] = await connection.execute(`
            SELECT a.id, a.client_name, a.service_id, s.name as service_name 
            FROM appointments a 
            LEFT JOIN services s ON a.service_id = s.id 
            LIMIT 5
        `);

        console.log('\n📋 Sample appointments with service info:');
        appointmentsWithService.forEach((appointment, index) => {
            console.log(`\nAppointment ${index + 1}:`);
            console.log(`  ID: ${appointment.id}`);
            console.log(`  Client: ${appointment.client_name}`);
            console.log(`  Service ID: ${appointment.service_id}`);
            console.log(`  Service Name: ${appointment.service_name || 'NULL'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkServicesTable().catch(console.error);