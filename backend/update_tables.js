const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management',
    multipleStatements: true // Enable multiple statements
});

// Define the order of SQL files to execute (order matters for foreign key constraints)
const sqlFiles = [
    'update_users.sql', // Update users first as it's referenced by other tables
    'update_pets.sql', // Update pets next as it's referenced by appointments
    'update_newsletter.sql', // These tables can be updated in any order
    'update_queries.sql', // as they only reference the users table
    'update_appointments.sql' // Update appointments last as it references both users and pets
];

// Function to execute SQL file
const executeSqlFile = (filePath) => {
    return new Promise((resolve, reject) => {
        console.log(`\nExecuting ${filePath}...`);
        const sql = fs.readFileSync(filePath, 'utf8');

        connection.query(sql, (err, results) => {
            if (err) {
                console.error(`\nError executing ${filePath}:`, err.message);
                if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                    console.error('This error occurred because a foreign key constraint failed.');
                    console.error('Make sure the referenced table is updated first.');
                }
                reject(err);
                return;
            }
            console.log(`Successfully executed ${filePath}`);
            if (Array.isArray(results)) {
                results.forEach((result, index) => {
                    if (result.message) {
                        console.log(`Result ${index + 1}:`, result.message);
                    }
                });
            }
            resolve(results);
        });
    });
};

// Execute files in sequence
async function updateTables() {
    try {
        console.log('Starting database updates...\n');

        for (const file of sqlFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                await executeSqlFile(filePath);
                console.log(`✓ ${file} completed successfully\n`);
            } else {
                console.warn(`Warning: ${file} not found, skipping...\n`);
            }
        }

        console.log('\n✓ All table updates completed successfully');
    } catch (error) {
        console.error('\n✗ Error during table updates:', error.message);
        process.exit(1);
    } finally {
        connection.end();
    }
}

// Run the updates
updateTables();