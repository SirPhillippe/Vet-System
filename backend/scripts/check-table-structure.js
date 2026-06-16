const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management'
};

async function checkTableStructure() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Check appointments table structure
        const [columns] = await connection.execute('DESCRIBE appointments');
        console.log('\n📋 Appointments table structure:');
        columns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        // Check if table has any data
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
        console.log(`\n📊 Current appointments count: ${count[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkTableStructure().catch(console.error);