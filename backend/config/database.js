const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true // Enable multiple statements for migrations
};

console.log('Database configuration:');
console.log('Host:', config.host);
console.log('User:', config.user);
console.log('Database:', config.database);
console.log('Pool Size:', config.connectionLimit);

// Create a connection pool
const pool = mysql.createPool(config);
const promisePool = pool.promise();

// Helper function to execute queries with better error handling
const query = async(sql, params) => {
    try {
        console.log('Executing SQL:', sql);
        console.log('Parameters:', params);
        const [rows] = await promisePool.execute(sql, params);
        console.log('Query result:', rows);
        return rows;
    } catch (error) {
        console.error('❌ Database Query Error:', error);
        console.error('SQL:', sql);
        console.error('Parameters:', params);
        throw error;
    }
};

// Test the connection
promisePool.query('SELECT 1')
    .then(() => {
        console.log('✅ MySQL Connection Pool Created Successfully');
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
        console.error('Please check your .env file and MySQL credentials');
        process.exit(1);
    });

module.exports = {
    pool: promisePool,
    query,
    config // Export config for use in scripts that need direct connections
};