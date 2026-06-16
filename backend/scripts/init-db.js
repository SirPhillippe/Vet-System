const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function initializeDatabase() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection(config);

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS vet_management`);
        await connection.query(`USE vet_management`);

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'vet') NOT NULL,
                phone VARCHAR(20),
                specialization VARCHAR(100),
                working_hours JSON,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create services table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                duration INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create appointments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_name VARCHAR(100) NOT NULL,
                client_email VARCHAR(100) NOT NULL,
                client_phone VARCHAR(20) NOT NULL,
                client_address TEXT,
                pet_name VARCHAR(50) NOT NULL,
                pet_type VARCHAR(50) NOT NULL,
                pet_breed VARCHAR(50),
                pet_age INT NULL,
                service_id INT,
                vet_id INT NULL,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                status ENUM('pending', 'confirmed', 'completed', 'no-show', 'cancelled') DEFAULT 'pending',
                payment_status ENUM('pending', 'paid', 'refunded', 'not_required') DEFAULT 'pending',
                stripe_payment_intent VARCHAR(255) NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id),
                FOREIGN KEY (vet_id) REFERENCES users(id)
            )
        `);

        // Create newsletter_subscriptions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE NOT NULL,
                status ENUM('active', 'unsubscribed') DEFAULT 'active',
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                unsubscribed_at TIMESTAMP NULL
            )
        `);

        // Insert default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ('Admin User', 'admin@vettech.com', ?, 'admin')
            ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)
        `, [hashedPassword]);

        // Insert sample services
        const services = [
            ['General Checkup', 'Routine health examination and consultation', 30, 50.00],
            ['Vaccination', 'Standard pet vaccinations', 20, 35.00],
            ['Dental Cleaning', 'Professional dental cleaning and examination', 60, 120.00],
            ['Surgery Consultation', 'Pre-surgery consultation and assessment', 45, 85.00],
            ['Emergency Visit', 'Urgent care services', 60, 150.00]
        ];

        // Insert services
        for (const service of services) {
            await connection.query(
                `INSERT INTO services (name, description, duration, price)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 description = VALUES(description),
                 duration = VALUES(duration),
                 price = VALUES(price)`,
                service
            );
        }

        console.log('✅ Database initialized successfully!');
        console.log('Default admin credentials:');
        console.log('Email: admin@vettech.com');
        console.log('Password: admin123');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();