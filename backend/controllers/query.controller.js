const db = require('../config/database');
const emailService = require('../utils/emailService');

// Submit a new query
exports.submitQuery = async(req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Please provide name, email, and message' });
        }

        const result = await db.query(
            'INSERT INTO queries (name, email, message) VALUES (?, ?, ?)', [name, email, message]
        );

        res.status(201).json({
            message: 'Query submitted successfully',
            queryId: result.insertId
        });
    } catch (error) {
        console.error('Error submitting query:', error);
        res.status(500).json({ error: 'Failed to submit query' });
    }
};

// Get all queries with pagination and filtering (for admin)
exports.getAllQueries = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt((page - 1) * limit);
        const status = req.query.status;
        const search = req.query.search;
        const dateRange = req.query.dateRange;

        let whereClause = 'WHERE 1=1';
        let params = [];

        // Status filter
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        // Search filter
        if (search) {
            whereClause += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Date range filter
        if (dateRange) {
            let dateCondition = '';
            switch (dateRange) {
                case 'today':
                    dateCondition = 'AND DATE(created_at) = CURDATE()';
                    break;
                case 'week':
                    dateCondition = 'AND YEARWEEK(created_at) = YEARWEEK(NOW())';
                    break;
                case 'month':
                    dateCondition = 'AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())';
                    break;
            }
            whereClause += ` ${dateCondition}`;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM queries ${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const total = countResult[0].total;

        // Get paginated results
        const dataQuery = `
            SELECT * FROM queries 
            ${whereClause} 
            ORDER BY created_at DESC 
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
        const queries = await db.query(dataQuery, params);

        // Get statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM queries
        `;
        const statsResult = await db.query(statsQuery);
        const stats = statsResult[0];

        res.json({
            queries,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            stats
        });
    } catch (err) {
        console.error('Error fetching queries:', err);
        res.status(500).json({ error: 'Failed to fetch queries' });
    }
};

// Get single query by ID
exports.getQueryById = async(req, res) => {
    try {
        const { id } = req.params;
        const rows = await db.query('SELECT * FROM queries WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Query not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching query:', err);
        res.status(500).json({ error: 'Failed to fetch query' });
    }
};

// Update query status (for admin)
exports.updateQueryStatus = async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (!['new', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const result = await db.query('UPDATE queries SET status = ? WHERE id = ?', [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Query not found' });
        }

        res.json({
            success: true,
            message: `Query status updated to ${status}`
        });
    } catch (err) {
        console.error('Error updating query status:', err);
        res.status(500).json({ error: 'Failed to update query status' });
    }
};

// Reply to a query
exports.replyToQuery = async(req, res) => {
    const { id } = req.params;
    const { replyMessage } = req.body;

    try {
        if (!replyMessage || replyMessage.trim() === '') {
            return res.status(400).json({ error: 'Reply message is required' });
        }

        // Get original query info
        const rows = await db.query('SELECT * FROM queries WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Query not found' });
        }

        const query = rows[0];

        // Send email reply
        try {
            await emailService.sendEmail({
                to: query.email,
                subject: `Re: Your Query - ${query.name}`,
                text: `Dear ${query.name},\n\nThank you for contacting us. Here is our response to your query:\n\n${replyMessage}\n\nIf you have any further questions, please don't hesitate to contact us.\n\nBest regards,\nVetTech Team\n\n---\nContact us:\nEmail: 2pawfectcare@gmail.com\nPhone: 0788400208`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2ecc71;">Response to Your Query</h2>
                        <p>Dear ${query.name},</p>
                        <p>Thank you for contacting us. Here is our response to your query:</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #2ecc71; margin: 20px 0;">
                            ${replyMessage.replace(/\n/g, '<br>')}
                        </div>
                        <p>If you have any further questions, please don't hesitate to contact us.</p>
                        <p>Best regards,<br>VetTech Team</p>
                        <hr>
                        <p style="font-size: 0.95em; color: #555;">
                            <strong>Contact us:</strong><br>
                            Email: <a href="mailto:2pawfectcare@gmail.com">2pawfectcare@gmail.com</a><br>
                            Phone: <a href="tel:0788400208">0788400208</a>
                        </p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with status update even if email fails
        }

        // Update query status to resolved
        await db.query('UPDATE queries SET status = ? WHERE id = ?', ['resolved', id]);

        res.json({
            success: true,
            message: 'Reply sent successfully and query marked as resolved'
        });
    } catch (err) {
        console.error('Error sending reply:', err);
        res.status(500).json({ error: 'Failed to send reply' });
    }
};

// Delete a query
exports.deleteQuery = async(req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM queries WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Query not found' });
        }

        res.json({
            success: true,
            message: 'Query deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting query:', err);
        res.status(500).json({ error: 'Failed to delete query' });
    }
};

// Get query statistics
exports.getQueryStats = async(req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
            FROM queries
        `);

        res.json(stats[0]);
    } catch (err) {
        console.error('Error fetching query stats:', err);
        res.status(500).json({ error: 'Failed to fetch query statistics' });
    }
};