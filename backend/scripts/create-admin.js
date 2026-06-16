const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'vet_management'
    });

    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)', ['Admin User', 'admin@vettech.com', hashedPassword, 'admin', 'active']
        );

        console.log('Admin user created successfully!');
        console.log('Email: admin@vettech.com');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await connection.end();
    }
}

createAdminUser();