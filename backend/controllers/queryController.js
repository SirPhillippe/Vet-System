const db = require('../config/database');

exports.submitQuery = async(req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: "Name, email, and message are required" });
        }

        // Insert query into database
        await db.query(
            'INSERT INTO queries (name, email, message) VALUES (?, ?, ?)', [name, email, message]
        );

        res.status(201).json({ message: "Query submitted successfully" });
    } catch (err) {
        console.error('Error submitting query:', err);
        res.status(500).json({ error: "An error occurred while submitting query" });
    }
};

exports.getQueries = async(req, res) => {
    try {
        const queries = await db.query(
            'SELECT * FROM queries ORDER BY created_at DESC'
        );
        res.status(200).json(queries);
    } catch (err) {
        console.error('Error fetching queries:', err);
        res.status(500).json({ error: "An error occurred while fetching queries" });
    }
};

exports.updateQueryStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['new', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const result = await db.query(
            'UPDATE queries SET status = ? WHERE id = ?', [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Query not found" });
        }

        res.status(200).json({ message: "Query status updated successfully" });
    } catch (err) {
        console.error('Error updating query status:', err);
        res.status(500).json({ error: "An error occurred while updating query status" });
    }
};