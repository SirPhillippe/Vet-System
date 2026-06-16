const { query } = require('../config/database');

async function addSampleMedicalRecords() {
    try {
        console.log('Adding sample medical records...');

        // Check if medical_records table exists and has data
        const existingRecords = await query('SELECT COUNT(*) as count FROM medical_records');
        
        if (existingRecords[0].count > 0) {
            console.log('Medical records already exist. Skipping sample data creation.');
            return;
        }

        // Sample medical records data
        const sampleRecords = [
            {
                patient_name: 'Max',
                owner_name: 'John Smith',
                owner_phone: '555-0101',
                pet_species: 'Dog',
                pet_breed: 'Golden Retriever',
                pet_age: 5,
                diagnosis: 'Annual checkup - healthy',
                treatment: 'Vaccination booster, flea treatment',
                prescription: 'Heartgard Plus monthly',
                notes: 'Patient is in good health. Recommend annual dental cleaning.',
                vet_id: 1,
                record_date: '2024-01-15'
            },
            {
                patient_name: 'Luna',
                owner_name: 'Sarah Johnson',
                owner_phone: '555-0102',
                pet_species: 'Cat',
                pet_breed: 'Persian',
                pet_age: 3,
                diagnosis: 'Upper respiratory infection',
                treatment: 'Antibiotics, rest, increased hydration',
                prescription: 'Amoxicillin 250mg twice daily for 10 days',
                notes: 'Monitor appetite and energy levels. Follow up in 1 week.',
                vet_id: 1,
                record_date: '2024-01-20'
            },
            {
                patient_name: 'Buddy',
                owner_name: 'Mike Davis',
                owner_phone: '555-0103',
                pet_species: 'Dog',
                pet_breed: 'Labrador Retriever',
                pet_age: 7,
                diagnosis: 'Hip dysplasia',
                treatment: 'Anti-inflammatory medication, physical therapy',
                prescription: 'Rimadyl 100mg daily, glucosamine supplement',
                notes: 'Patient showing improvement with medication. Continue physical therapy.',
                vet_id: 1,
                record_date: '2024-01-25'
            },
            {
                patient_name: 'Whiskers',
                owner_name: 'Emily Wilson',
                owner_phone: '555-0104',
                pet_species: 'Cat',
                pet_breed: 'Domestic Shorthair',
                pet_age: 2,
                diagnosis: 'Dental cleaning and extraction',
                treatment: 'Professional dental cleaning, extracted 2 decayed teeth',
                prescription: 'Pain medication for 3 days',
                notes: 'Dental health improved significantly. Recommend dental diet.',
                vet_id: 1,
                record_date: '2024-01-30'
            },
            {
                patient_name: 'Rocky',
                owner_name: 'David Brown',
                owner_phone: '555-0105',
                pet_species: 'Dog',
                pet_breed: 'German Shepherd',
                pet_age: 4,
                diagnosis: 'Ear infection',
                treatment: 'Ear cleaning, topical medication',
                prescription: 'Ear drops twice daily for 7 days',
                notes: 'Ear canal was inflamed. Monitor for scratching behavior.',
                vet_id: 1,
                record_date: '2024-02-05'
            }
        ];

        // Insert sample records
        for (const record of sampleRecords) {
            await query(`
                INSERT INTO medical_records (
                    patient_name, owner_name, owner_phone, pet_species, pet_breed, pet_age,
                    diagnosis, treatment, prescription, notes, vet_id, record_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                record.patient_name,
                record.owner_name,
                record.owner_phone,
                record.pet_species,
                record.pet_breed,
                record.pet_age,
                record.diagnosis,
                record.treatment,
                record.prescription,
                record.notes,
                record.vet_id,
                record.record_date
            ]);
        }

        console.log('Sample medical records added successfully!');
        
        // Verify the records were added
        const count = await query('SELECT COUNT(*) as count FROM medical_records');
        console.log(`Total medical records in database: ${count[0].count}`);

    } catch (error) {
        console.error('Error adding sample medical records:', error);
    } finally {
        process.exit(0);
    }
}

// Run the function
addSampleMedicalRecords();