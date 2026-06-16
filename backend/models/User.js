const db = require('../config/database');
const bcrypt = require('bcryptjs');

const VALID_ROLES = ['admin', 'vet'];

const User = {
    create: async(userData) => {
        if (!VALID_ROLES.includes(userData.role)) {
            throw new Error('Invalid role. Must be either admin or vet');
        }

        const fields = Object.keys(userData);
        const values = Object.values(userData);
        const fieldList = fields.map(field => `\`${field}\``).join(', ');
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO users (${fieldList}) VALUES (${placeholders})`;
        const result = await db.query(sql, values);
        return result.insertId;
    },

    findAll: async() => {
        const rows = await db.query(
            'SELECT * FROM users ORDER BY name'
        );
        return rows;
    },

    findByEmail: async(email) => {
        const rows = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        return rows[0] || null;
    },

    findById: async(id) => {
        const rows = await db.query(
            'SELECT * FROM users WHERE id = ?', [id]
        );
        return rows[0];
    },

    update: async(id, data) => {
        if (data.role && !VALID_ROLES.includes(data.role)) {
            throw new Error('Invalid role. Must be either admin or vet');
        }
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
        const result = await db.query(sql, [...values, id]);
        return result.affectedRows > 0;
    },

    delete: async(id) => {
        const result = await db.query(
            'DELETE FROM users WHERE id = ?', [id]
        );
        return result.affectedRows > 0;
    },

    getAllVets: async() => {
        const rows = await db.query(
            `SELECT id, name, email, phone, specialization, working_hours, status 
             FROM users 
             WHERE role = 'vet'
             ORDER BY name`,
        );
        return rows;
    },

    getActiveVets: async() => {
        const rows = await db.query(
            `SELECT id, name, email, phone, specialization, working_hours 
             FROM users 
             WHERE role = 'vet' AND status = 'active'
             ORDER BY name`,
        );
        return rows;
    },

    validateCredentials: async(email, password) => {
        const user = await User.findByEmail(email);
        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch ? user : null;
    }
};

module.exports = User;