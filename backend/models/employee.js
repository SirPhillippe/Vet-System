const db = require('../config/database');

const Employee = {
    create: async(employeeData) => {
        const fields = Object.keys(employeeData);
        const values = Object.values(employeeData);
        const fieldList = fields.map(field => `\`${field}\``).join(', ');
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO employees (${fieldList}) VALUES (${placeholders})`;
        const result = await db.query(sql, values);
        return result.insertId;
    },

    findAll: async() => {
        const rows = await db.query('SELECT * FROM employees ORDER BY first_name, last_name');
        return rows;
    },

    findById: async(id) => {
        const rows = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
        return rows[0];
    },

    update: async(id, data) => {
        // Build SET clause dynamically
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const sql = `UPDATE employees SET ${setClause} WHERE id = ?`;
        const result = await db.query(sql, [...values, id]);
        return result.affectedRows > 0;
    },

    delete: async(id) => {
        const result = await db.query('DELETE FROM employees WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Employee;