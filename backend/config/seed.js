const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'vet_management'
        });

        console.log('Connected to database');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await connection.query(
            `INSERT INTO users (name, email, password, role, status) 
             VALUES (?, ?, ?, ?, ?)`, ['Admin User', 'admin@vettech.com', adminPassword, 'admin', 'active']
        );
        console.log('Admin user created');

        // Create vet user
        const vetPassword = await bcrypt.hash('vet123', 10);
        await connection.query(
            `INSERT INTO users (name, email, password, role, specialization, status) 
             VALUES (?, ?, ?, ?, ?, ?)`, ['Dr. Smith', 'vet@vettech.com', vetPassword, 'vet', 'General Practice', 'active']
        );
        console.log('Vet user created');

        // Create client user
        const clientPassword = await bcrypt.hash('client123', 10);
        await connection.query(
            `INSERT INTO users (name, email, password, role, status) 
             VALUES (?, ?, ?, ?, ?)`, ['John Doe', 'client@vettech.com', clientPassword, 'client', 'active']
        );
        console.log('Client user created');

        // Add some services
        const services = [
            ['General Checkup', 'Routine health examination', 30, 50.00],
            ['Vaccination', 'Standard pet vaccination', 20, 75.00],
            ['Dental Cleaning', 'Complete dental care', 60, 120.00],
            ['Surgery Consultation', 'Pre-surgery consultation', 45, 100.00]
        ];

        await connection.query(
            `INSERT INTO services (name, description, duration, price) 
             VALUES ?`, [services]
        );
        console.log('Services created');

        // Add a pet for the client
        const [clientResult] = await connection.query(
            'SELECT id FROM users WHERE email = ?', ['client@vettech.com']
        );
        const clientId = clientResult[0].id;

        await connection.query(
            `INSERT INTO pets (name, type, breed, age, user_id) 
             VALUES (?, ?, ?, ?, ?)`, ['Max', 'Dog', 'Golden Retriever', 3, clientId]
        );
        console.log('Pet created');

        // Add some appointments
        const [petResult] = await connection.query(
            'SELECT id FROM pets WHERE user_id = ?', [clientId]
        );
        const petId = petResult[0].id;

        const [vetResult] = await connection.query(
            'SELECT id FROM users WHERE role = ?', ['vet']
        );
        const vetId = vetResult[0].id;

        const [serviceResult] = await connection.query(
            'SELECT id, price FROM services WHERE name = ?', ['General Checkup']
        );
        const serviceId = serviceResult[0].id;
        const servicePrice = serviceResult[0].price;

        // Create an appointment for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        await connection.query(
            `INSERT INTO appointments 
             (user_id, pet_id, service_id, vet_id, appointment_date, appointment_time, status, price) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [clientId, petId, serviceId, vetId, tomorrowDate, '10:00:00', 'confirmed', servicePrice]
        );
        console.log('Appointment created');

        // Add clinic settings
        await connection.query(
            `INSERT INTO settings 
             (clinic_name, clinic_email, clinic_phone, clinic_address) 
             VALUES (?, ?, ?, ?)`, [
                'VetTech Animal Hospital',
                'contact@vettech.com',
                '123-456-7890',
                '123 Vet Street, Medical District, City'
            ]
        );
        console.log('Settings created');

        console.log('\nSeed completed successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin - Email: admin@vettech.com, Password: admin123');
        console.log('Vet - Email: vet@vettech.com, Password: vet123');
        console.log('Client - Email: client@vettech.com, Password: client123');

        await connection.end();
    } catch (error) {
        console.error('Error seeding database:', error);
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
        process.exit(1);
    }
}

seedDatabase();