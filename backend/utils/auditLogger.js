const { query } = require('../config/database');

async function logAudit(req, action, entity, recordId, description) {
    try {
        await query(
            'INSERT INTO audit_logs (user_id, user_role, action, entity, record_id, description, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                req.user?.userId || null,
                req.user?.role || null,
                action,
                entity,
                recordId || null,
                description,
                req.ip || null
            ]
        );
    } catch (err) {
        // Never let audit logging failure break the main operation
        console.error('Audit log write failed:', err.message);
    }
}

module.exports = logAudit;
