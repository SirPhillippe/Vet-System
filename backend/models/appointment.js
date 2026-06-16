const db = require('../config/database');

class Appointment {
    constructor(data) {
        this.id = data.id;
        this.client_name = data.client_name;
        this.client_email = data.client_email;
        this.client_phone = data.client_phone;
        this.pet_name = data.pet_name;
        this.pet_type = data.pet_type;
        this.pet_breed = data.pet_breed;
        this.pet_age = data.pet_age;
        this.service_id = data.service_id;
        this.appointment_date = data.appointment_date;
        this.appointment_time = data.appointment_time;
        this.status = data.status || 'scheduled';
        this.payment_status = data.payment_status || 'pending';
        this.notes = data.notes;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(appointmentData) {
        try {
            const [result] = await db.query(
                'INSERT INTO appointments SET ?', [appointmentData]
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creating appointment: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM appointments WHERE id = ?', [id]
            );
            return rows[0] ? new Appointment(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding appointment: ${error.message}`);
        }
    }

    static async findAll(filters = {}) {
        try {
            let query = 'SELECT * FROM appointments';
            const params = [];

            if (filters.status) {
                query += ' WHERE status = ?';
                params.push(filters.status);
            }

            if (filters.date) {
                query += params.length ? ' AND' : ' WHERE';
                query += ' DATE(appointment_date) = ?';
                params.push(filters.date);
            }

            query += ` ORDER BY 
                CASE 
                    WHEN DATE(appointment_date) = CURDATE() THEN 1
                    WHEN appointment_date > CURDATE() THEN 2
                    ELSE 3
                END,
                appointment_date ASC,
                appointment_time ASC`;

            const [rows] = await db.query(query, params);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            throw new Error(`Error fetching appointments: ${error.message}`);
        }
    }

    async update() {
        try {
            const [result] = await db.query(
                'UPDATE appointments SET ? WHERE id = ?', [this, this.id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating appointment: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.query(
                'DELETE FROM appointments WHERE id = ?', [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting appointment: ${error.message}`);
        }
    }

    static async getUpcoming(limit = 5) {
        try {
            const [rows] = await db.query(
                `SELECT * FROM appointments 
                WHERE appointment_date >= CURDATE() 
                AND status = 'scheduled' 
                ORDER BY appointment_date ASC, appointment_time ASC 
                LIMIT ?`, [limit]
            );
            return rows.map(row => new Appointment(row));
        } catch (error) {
            throw new Error(`Error fetching upcoming appointments: ${error.message}`);
        }
    }
}

module.exports = Appointment;