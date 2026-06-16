const { query } = require('../config/database');
const logAudit = require('../utils/auditLogger');

// Get all medical records for a vet
const getAllMedicalRecords = async(req, res) => {
    try {
        const vetId = req.user.userId;
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;



        let sql = `
            SELECT mr.*, u.name as vet_name 
            FROM medical_records mr 
            LEFT JOIN users u ON mr.vet_id = u.id 
            WHERE mr.vet_id = ? AND mr.status = 'active'
        `;
        let params = [vetId];

        if (search) {
            sql += ` AND (mr.patient_name LIKE ? OR mr.owner_name LIKE ? OR mr.diagnosis LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY mr.record_date DESC, mr.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        const records = await query(sql, params);

        // Get total count for pagination
        let countSql = `SELECT COUNT(*) as total FROM medical_records WHERE vet_id = ? AND status = 'active'`;
        let countParams = [vetId];

        if (search) {
            countSql += ` AND (patient_name LIKE ? OR owner_name LIKE ? OR diagnosis LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [{ total }] = await query(countSql, countParams);

        res.json({
            data: records,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_records: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error getting medical records:', error);
        res.status(500).json({ error: 'Failed to get medical records' });
    }
};

// Get a single medical record
const getMedicalRecord = async(req, res) => {
    try {
        const { id } = req.params;
        const vetId = req.user.userId;

        const sql = `
            SELECT mr.*, u.name as vet_name 
            FROM medical_records mr 
            LEFT JOIN users u ON mr.vet_id = u.id 
            WHERE mr.id = ? AND mr.vet_id = ? AND mr.status = 'active'
        `;

        const records = await query(sql, [id, vetId]);

        if (records.length === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        res.json({ data: records[0] });
    } catch (error) {
        console.error('Error getting medical record:', error);
        res.status(500).json({ error: 'Failed to get medical record' });
    }
};

// Create a new medical record
const createMedicalRecord = async(req, res) => {
    try {
        const vetId = req.user.userId;
        const {
            appointment_id,
            patient_name,
            owner_name,
            owner_phone,
            pet_species,
            pet_breed,
            pet_age,
            diagnosis,
            treatment,
            prescription,
            notes,
            record_date,
            next_visit_date
        } = req.body;

        const sql = `
            INSERT INTO medical_records (
                appointment_id, patient_name, owner_name, owner_phone, 
                pet_species, pet_breed, pet_age, diagnosis, treatment, 
                prescription, notes, vet_id, record_date, next_visit_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            appointment_id || null,
            patient_name,
            owner_name,
            owner_phone || null,
            pet_species,
            pet_breed || null,
            pet_age || null,
            diagnosis,
            treatment,
            prescription || null,
            notes || null,
            vetId,
            record_date,
            next_visit_date || null
        ];

        const result = await query(sql, params);

        logAudit(req, 'CREATE', 'medical_record', result.insertId, `Vet created medical record for patient ${patient_name}`);
        res.status(201).json({
            message: 'Medical record created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating medical record:', error);
        res.status(500).json({ error: 'Failed to create medical record' });
    }
};

// Update a medical record
const updateMedicalRecord = async(req, res) => {
    try {
        const { id } = req.params;
        const vetId = req.user.userId;
        const {
            patient_name,
            owner_name,
            owner_phone,
            pet_species,
            pet_breed,
            pet_age,
            diagnosis,
            treatment,
            prescription,
            notes,
            record_date,
            next_visit_date
        } = req.body;

        // Check if record exists and belongs to the vet
        const checkSql = `SELECT id FROM medical_records WHERE id = ? AND vet_id = ? AND status = 'active'`;
        const existingRecord = await query(checkSql, [id, vetId]);

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        const sql = `
            UPDATE medical_records SET 
                patient_name = ?, owner_name = ?, owner_phone = ?, 
                pet_species = ?, pet_breed = ?, pet_age = ?, 
                diagnosis = ?, treatment = ?, prescription = ?, 
                notes = ?, record_date = ?, next_visit_date = ?
            WHERE id = ? AND vet_id = ?
        `;

        const params = [
            patient_name,
            owner_name,
            owner_phone || null,
            pet_species,
            pet_breed || null,
            pet_age || null,
            diagnosis,
            treatment,
            prescription || null,
            notes || null,
            record_date,
            next_visit_date || null,
            id,
            vetId
        ];

        await query(sql, params);

        logAudit(req, 'UPDATE', 'medical_record', parseInt(id), `Vet updated medical record #${id}`);
        res.json({ message: 'Medical record updated successfully' });
    } catch (error) {
        console.error('Error updating medical record:', error);
        res.status(500).json({ error: 'Failed to update medical record' });
    }
};

// Delete a medical record (soft delete)
const deleteMedicalRecord = async(req, res) => {
    try {
        const { id } = req.params;
        const vetId = req.user.userId;

        const sql = `UPDATE medical_records SET status = 'archived' WHERE id = ? AND vet_id = ?`;
        const result = await query(sql, [id, vetId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        logAudit(req, 'DELETE', 'medical_record', parseInt(id), `Vet archived medical record #${id}`);
        res.json({ message: 'Medical record deleted successfully' });
    } catch (error) {
        console.error('Error deleting medical record:', error);
        res.status(500).json({ error: 'Failed to delete medical record' });
    }
};

// Get medical records statistics
const getMedicalRecordsStats = async(req, res) => {
    try {
        const vetId = req.user.userId;

        // Total records
        const [{ total_records }] = await query(
            'SELECT COUNT(*) as total_records FROM medical_records WHERE vet_id = ? AND status = "active"', [vetId]
        );

        // Records this month
        const [{ this_month }] = await query(
            'SELECT COUNT(*) as this_month FROM medical_records WHERE vet_id = ? AND status = "active" AND MONTH(record_date) = MONTH(CURRENT_DATE()) AND YEAR(record_date) = YEAR(CURRENT_DATE())', [vetId]
        );

        // Records this week
        const [{ this_week }] = await query(
            'SELECT COUNT(*) as this_week FROM medical_records WHERE vet_id = ? AND status = "active" AND YEARWEEK(record_date) = YEARWEEK(CURRENT_DATE())', [vetId]
        );

        // Most common diagnoses
        const commonDiagnoses = await query(
            'SELECT diagnosis, COUNT(*) as count FROM medical_records WHERE vet_id = ? AND status = "active" GROUP BY diagnosis ORDER BY count DESC LIMIT 5', [vetId]
        );

        res.json({
            total_records,
            this_month,
            this_week,
            common_diagnoses: commonDiagnoses
        });
    } catch (error) {
        console.error('Error getting medical records stats:', error);
        res.status(500).json({ error: 'Failed to get medical records statistics' });
    }
};

// Get all patients for medical records dropdown
const getAllPatients = async(req, res) => {
    try {
        const { search = '' } = req.query;
        
        let sql = `
            SELECT DISTINCT 
                pet_name,
                client_name,
                client_email,
                client_phone,
                pet_type,
                pet_breed,
                pet_age
            FROM appointments 
            WHERE pet_name IS NOT NULL 
            AND pet_name != '' 
            AND client_name IS NOT NULL
        `;
        
        let params = [];
        
        if (search) {
            sql += ` AND (pet_name LIKE ? OR client_name LIKE ? OR client_email LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        
        sql += ` ORDER BY client_name, pet_name`;
        
        const patients = await query(sql, params);
        
        res.json(patients);
    } catch (error) {
        console.error('Error getting patients:', error);
        res.status(500).json({ error: 'Failed to get patients' });
    }
};

module.exports = {
    getAllMedicalRecords,
    getMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getMedicalRecordsStats,
    getAllPatients
};