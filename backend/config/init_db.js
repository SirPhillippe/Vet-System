// =============================================================================
// Pawfect Care — Database initializer (single setup command)
// =============================================================================
// Run with:  npm run db:setup   (or: node backend/config/init_db.js)
//
// This script:
//   1. Connects to MySQL using the values in backend/.env
//   2. Creates the database if it doesn't exist
//   3. Applies the consolidated schema in config/schema.sql (all tables)
//   4. Seeds baseline data: admin + vet logins, services, settings, inventory
//   5. Marks the legacy migrations as already applied (so run-migrations.js is
//      a safe no-op against a database created here)
//
// It is safe to re-run: the schema drops and recreates all tables, giving you
// a clean database every time.
// =============================================================================

const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_NAME = process.env.DB_NAME || 'vet_management';

// Legacy migration files that this consolidated schema already includes.
// Pre-recording them stops `scripts/run-migrations.js` from re-running (and
// dropping) tables if it is ever executed against this database.
const LEGACY_MIGRATIONS = [
    '01_initial_schema.sql',
    '02_sample_data.sql',
    '03_newsletter.sql',
    '04_employees.sql',
    '05_employees_seed.sql',
    '06_medical_records.sql',
    '07_add_pet_age_to_appointments.sql',
    '08_pet_age_decimal.sql',
    '09_working_hours_end.sql',
    '10_audit_logs.sql',
    '11_payment_details.sql',
    '12_appointment_status_no_show.sql'
];

async function initializeDatabase() {
    let connection;
    try {
        console.log('Database configuration:');
        console.log('Host:', process.env.DB_HOST || 'localhost');
        console.log('User:', process.env.DB_USER || 'root');
        console.log('Database:', DB_NAME);

        // Connect without selecting a database first.
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });
        console.log('Connected to MySQL server');

        // Create and select the database.
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
        await connection.query(`USE \`${DB_NAME}\``);
        console.log(`Database \`${DB_NAME}\` ready`);

        // Apply the consolidated schema.
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        await connection.query(schema);
        console.log('Schema applied (all tables created)');

        // --- Seed baseline data -------------------------------------------------

        // 1. Login accounts (passwords hashed at seed time — no hardcoded hashes).
        const adminPassword = await bcrypt.hash('admin123', 10);
        const vetPassword = await bcrypt.hash('vet123', 10);
        await connection.query(
            `INSERT INTO users (name, email, password, role, status)
             VALUES (?, ?, ?, 'admin', 'active'), (?, ?, ?, 'vet', 'active')`,
            ['Admin User', 'admin@vettech.com', adminPassword,
                'Dr. Smith', 'vet@vettech.com', vetPassword]
        );

        // 2. Services.
        const services = [
            ['General Checkup', 'Routine health examination', 30, 50.00],
            ['Vaccination', 'Standard pet vaccination', 20, 75.00],
            ['Dental Cleaning', 'Complete dental care', 60, 120.00],
            ['Surgery Consultation', 'Pre-surgery consultation', 45, 100.00]
        ];
        await connection.query(
            'INSERT INTO services (name, description, duration, price) VALUES ?',
            [services]
        );

        // 3. Clinic settings.
        await connection.query(
            `INSERT INTO settings (clinic_name, clinic_email, clinic_phone, clinic_address)
             VALUES (?, ?, ?, ?)`,
            ['VetTech Animal Hospital', 'contact@vettech.com', '123-456-7890',
                '123 Vet Street, Medical District, City']
        );

        // 4. Sample inventory.
        const inventory = [
            ['Amoxicillin 250mg', 'Medications', 80, 12.50, 20],
            ['Metronidazole 200mg', 'Medications', 60, 9.75, 15],
            ['Meloxicam 1.5mg/ml', 'Medications', 45, 18.00, 10],
            ['Dexamethasone Injection 2mg', 'Medications', 30, 22.00, 10],
            ['Rabies Vaccine', 'Vaccines', 50, 35.00, 15],
            ['Distemper/Parvovirus Vaccine', 'Vaccines', 40, 28.50, 15],
            ['Feline Calicivirus Vaccine', 'Vaccines', 35, 30.00, 10],
            ['Bordetella Vaccine', 'Vaccines', 25, 25.00, 10],
            ['Disposable Syringes 5ml', 'Medical Supplies', 200, 0.85, 50],
            ['Sterile Gloves (box of 100)', 'Medical Supplies', 20, 14.00, 5],
            ['Gauze Bandage Rolls', 'Medical Supplies', 100, 2.50, 25],
            ['Surgical Sutures (pack)', 'Medical Supplies', 40, 11.00, 10],
            ['IV Drip Set', 'Medical Supplies', 50, 6.50, 15],
            ['Digital Thermometer', 'Equipment', 10, 45.00, 3],
            ['Stethoscope', 'Equipment', 5, 120.00, 2],
            ['Elizabethan Collar (Medium)', 'Equipment', 25, 8.00, 8],
            ['Omega-3 Supplement (bottle)', 'Supplements', 30, 16.00, 8],
            ['Probiotic Powder (200g)', 'Supplements', 25, 13.50, 8],
            ['Antiseptic Solution 500ml', 'Cleaning Supplies', 40, 7.00, 10],
            ['Disinfectant Spray 1L', 'Cleaning Supplies', 30, 9.00, 10]
        ];
        await connection.query(
            'INSERT INTO inventory (name, category, quantity, unit_price, reorder_level) VALUES ?',
            [inventory]
        );

        // 5. Record legacy migrations as already applied.
        await connection.query(
            'INSERT INTO migrations (name) VALUES ?',
            [LEGACY_MIGRATIONS.map(name => [name])]
        );

        console.log('Baseline data seeded successfully');
        console.log('\nTest account credentials:');
        console.log('  Admin  ->  admin@vettech.com  /  admin123');
        console.log('  Vet    ->  vet@vettech.com    /  vet123');
        console.log('\n✅ Database initialization completed');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        if (connection) {
            try { await connection.end(); } catch (_) { /* ignore */ }
        }
        process.exit(1);
    }
}

initializeDatabase();
