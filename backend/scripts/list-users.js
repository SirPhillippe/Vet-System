const mysql = require('mysql2/promise');

async function listUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'vet_management'
    });

    try {
        const [rows] = await connection.execute('SELECT id, name, email, role, status FROM users');
        console.log('Existing users:');
        console.table(rows);
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        await connection.end();
    }
}

listUsers();