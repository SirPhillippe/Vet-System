// One-off helper: apply a single migration file by name and record it.
// Usage: node backend/scripts/run-single-migration.js 11_payment_details.sql
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management',
    multipleStatements: true
};

async function run() {
    const file = process.argv[2];
    if (!file) {
        console.error('Usage: node run-single-migration.js <migration_file.sql>');
        process.exit(1);
    }
    let connection;
    try {
        connection = await mysql.createConnection(config);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [existing] = await connection.query('SELECT name FROM migrations WHERE name = ?', [file]);
        if (existing.length > 0) {
            console.log(`Migration ${file} already recorded — skipping.`);
            return;
        }

        const sql = await fs.readFile(path.join(__dirname, '..', 'migrations', file), 'utf8');
        await connection.query(sql);
        await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
        console.log(`✅ Migration ${file} applied and recorded successfully`);
    } catch (error) {
        console.error('❌ Error applying migration:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

run();
