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

async function runMigrations() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection(config);

        // Get all migration files
        const migrationsDir = path.join(__dirname, '..', 'migrations');
        const files = await fs.readdir(migrationsDir);

        // Sort files to ensure correct order
        const migrationFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort((a, b) => {
                const numA = parseInt(a.split('_')[0]);
                const numB = parseInt(b.split('_')[0]);
                return numA - numB;
            });

        // Create migrations table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Get executed migrations
        const [executed] = await connection.query('SELECT name FROM migrations');
        const executedFiles = executed.map(row => row.name);

        // Run pending migrations
        for (const file of migrationFiles) {
            if (!executedFiles.includes(file)) {
                console.log(`Running migration: ${file}`);

                // Read and execute migration file
                const filePath = path.join(migrationsDir, file);
                const sql = await fs.readFile(filePath, 'utf8');
                await connection.query(sql);

                // Record migration
                await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);

                console.log(`✅ Migration ${file} completed successfully`);
            } else {
                console.log(`Skipping migration ${file} (already executed)`);
            }
        }

        console.log('✅ All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Error running migrations:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigrations();