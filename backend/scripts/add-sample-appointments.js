const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vet_management'
};

// Sample data arrays
const clientNames = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
    'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'William Garcia', 'Amanda Rodriguez',
    'James Lopez', 'Michelle White', 'Christopher Lee', 'Jessica Hall', 'Daniel Allen',
    'Ashley Young', 'Matthew King', 'Nicole Wright', 'Joshua Green', 'Stephanie Baker',
    'Andrew Adams', 'Rebecca Nelson', 'Kevin Carter', 'Laura Mitchell', 'Brian Perez',
    'Rachel Roberts', 'Steven Turner', 'Heather Phillips', 'Timothy Campbell', 'Melissa Parker'
];

const clientEmails = [
    'john.smith@email.com', 'sarah.johnson@email.com', 'michael.brown@email.com', 'emily.davis@email.com', 'david.wilson@email.com',
    'lisa.anderson@email.com', 'robert.taylor@email.com', 'jennifer.martinez@email.com', 'william.garcia@email.com', 'amanda.rodriguez@email.com',
    'james.lopez@email.com', 'michelle.white@email.com', 'christopher.lee@email.com', 'jessica.hall@email.com', 'daniel.allen@email.com',
    'ashley.young@email.com', 'matthew.king@email.com', 'nicole.wright@email.com', 'joshua.green@email.com', 'stephanie.baker@email.com',
    'andrew.adams@email.com', 'rebecca.nelson@email.com', 'kevin.carter@email.com', 'laura.mitchell@email.com', 'brian.perez@email.com',
    'rachel.roberts@email.com', 'steven.turner@email.com', 'heather.phillips@email.com', 'timothy.campbell@email.com', 'melissa.parker@email.com'
];

const clientPhones = [
    '555-0101', '555-0102', '555-0103', '555-0104', '555-0105',
    '555-0106', '555-0107', '555-0108', '555-0109', '555-0110',
    '555-0111', '555-0112', '555-0113', '555-0114', '555-0115',
    '555-0116', '555-0117', '555-0118', '555-0119', '555-0120',
    '555-0121', '555-0122', '555-0123', '555-0124', '555-0125',
    '555-0126', '555-0127', '555-0128', '555-0129', '555-0130'
];

const petNames = [
    'Buddy', 'Max', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Daisy', 'Rocky', 'Molly', 'Bear',
    'Luna', 'Duke', 'Sadie', 'Tucker', 'Sophie', 'Oliver', 'Chloe', 'Jack', 'Lola', 'Winston',
    'Zoe', 'Baxter', 'Ruby', 'Finn', 'Penny', 'Murphy', 'Gracie', 'Sam', 'Rosie', 'Rex',
    'Coco', 'Bailey', 'Maggie', 'Riley', 'Abby', 'Jake', 'Lily', 'Toby', 'Emma', 'Buster'
];

const services = [
    'Checkup', 'Vaccination', 'Surgery', 'Dental Care', 'Grooming', 'Emergency', 'Lab Testing', 'Other'
];

const statuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

// Generate random date within the last 3 months
function getRandomDate() {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const timeDiff = now.getTime() - threeMonthsAgo.getTime();
    const randomTime = threeMonthsAgo.getTime() + Math.random() * timeDiff;
    return new Date(randomTime);
}

// Generate random time between 8 AM and 6 PM
function getRandomTime() {
    const hours = Math.floor(Math.random() * 10) + 8; // 8 AM to 6 PM
    const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Generate random notes
function getRandomNotes() {
    const notes = [
        'Regular checkup',
        'Annual vaccination',
        'Follow-up appointment',
        'Emergency visit',
        'Dental cleaning',
        'Surgery consultation',
        'Lab work required',
        'Behavioral consultation',
        'Nutrition advice',
        'Vaccination booster',
        'Post-surgery check',
        'Senior pet care',
        'Puppy/kitten visit',
        'Chronic condition monitoring',
        'Preventive care'
    ];
    return notes[Math.floor(Math.random() * notes.length)];
}

// Generate sample appointments
function generateSampleAppointments(count = 100) {
    const appointments = [];

    for (let i = 0; i < count; i++) {
        const appointmentDate = getRandomDate();
        const appointmentTime = getRandomTime();
        const clientIndex = Math.floor(Math.random() * clientNames.length);
        const clientName = clientNames[clientIndex];
        const clientEmail = clientEmails[clientIndex];
        const clientPhone = clientPhones[clientIndex];
        const petName = petNames[Math.floor(Math.random() * petNames.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const notes = getRandomNotes();

        // Generate a realistic price based on service
        let price;
        switch (service) {
            case 'Checkup':
                price = Math.floor(Math.random() * 30) + 50; // $50-$80
                break;
            case 'Vaccination':
                price = Math.floor(Math.random() * 40) + 60; // $60-$100
                break;
            case 'Surgery':
                price = Math.floor(Math.random() * 200) + 300; // $300-$500
                break;
            case 'Dental Care':
                price = Math.floor(Math.random() * 100) + 150; // $150-$250
                break;
            case 'Grooming':
                price = Math.floor(Math.random() * 30) + 40; // $40-$70
                break;
            case 'Emergency':
                price = Math.floor(Math.random() * 150) + 200; // $200-$350
                break;
            case 'Lab Testing':
                price = Math.floor(Math.random() * 80) + 100; // $100-$180
                break;
            default:
                price = Math.floor(Math.random() * 50) + 75; // $75-$125
        }

        appointments.push({
            client_name: clientName,
            client_email: clientEmail,
            client_phone: clientPhone,
            pet_name: petName,
            appointment_date: appointmentDate.toISOString().split('T')[0],
            appointment_time: appointmentTime,
            service_name: service,
            status: status,
            price: price,
            notes: notes
        });
    }

    return appointments;
}

// Add missing columns to appointments table
async function addMissingColumns(connection) {
    try {
        // Check if columns exist and add them if they don't
        const columns = [
            'appointment_date DATE',
            'appointment_time TIME',
            'service_name VARCHAR(255)',
            'status VARCHAR(50) DEFAULT "Scheduled"',
            'price DECIMAL(10,2)',
            'notes TEXT'
        ];

        for (const column of columns) {
            const columnName = column.split(' ')[0];
            try {
                await connection.execute(`ALTER TABLE appointments ADD COLUMN ${columnName} ${column.split(' ').slice(1).join(' ')}`);
                console.log(`✅ Added column: ${columnName}`);
            } catch (error) {
                if (error.message.includes('Duplicate column name')) {
                    console.log(`ℹ️ Column ${columnName} already exists`);
                } else {
                    console.error(`❌ Error adding column ${columnName}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error adding missing columns:', error);
    }
}

// Insert appointments into database
async function insertAppointments(appointments) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Add missing columns first
        console.log('Checking and adding missing columns...');
        await addMissingColumns(connection);

        // Insert appointments
        console.log(`Inserting ${appointments.length} appointments...`);

        for (const appointment of appointments) {
            await connection.execute(`
                INSERT INTO appointments 
                (client_name, client_email, client_phone, pet_name, appointment_date, appointment_time, service_name, status, price, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                appointment.client_name,
                appointment.client_email,
                appointment.client_phone,
                appointment.pet_name,
                appointment.appointment_date,
                appointment.appointment_time,
                appointment.service_name,
                appointment.status,
                appointment.price,
                appointment.notes
            ]);
        }

        console.log('✅ All appointments inserted successfully!');

        // Show summary
        const [totalAppointments] = await connection.execute('SELECT COUNT(*) as total FROM appointments');
        const [todayAppointments] = await connection.execute('SELECT COUNT(*) as today FROM appointments WHERE appointment_date = CURDATE()');
        const [completedAppointments] = await connection.execute('SELECT COUNT(*) as completed FROM appointments WHERE status = "Completed"');

        console.log('\n📊 Appointment Summary:');
        console.log(`Total appointments: ${totalAppointments[0].total}`);
        console.log(`Today's appointments: ${todayAppointments[0].today}`);
        console.log(`Completed appointments: ${completedAppointments[0].completed}`);

    } catch (error) {
        console.error('❌ Error inserting appointments:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting appointment data generation...');

    const appointmentCount = process.argv[2] ? parseInt(process.argv[2]) : 100;
    console.log(`Generating ${appointmentCount} appointments for the last 3 months...`);

    const appointments = generateSampleAppointments(appointmentCount);
    await insertAppointments(appointments);

    console.log('🎉 Appointment data generation completed!');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateSampleAppointments, insertAppointments };