const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'vet_management'
    });

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Update the admin user's password
        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@vettech.com']
        );

        if (result.affectedRows > 0) {
            console.log('Admin password has been reset successfully!');
            console.log('Email: admin@vettech.com');
            console.log('New Password: admin123');
        } else {
            console.log('No admin user found with the email admin@vettech.com');
        }
    } catch (error) {
        console.error('Error resetting admin password:', error);
    } finally {
        await connection.end();
    }
}

resetAdminPassword();