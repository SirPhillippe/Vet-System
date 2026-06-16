const db = require('../config/database');

// Subscribe to newsletter
exports.subscribe = async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Please provide an email address' });
        }

        // Check if email already exists
        const [rows] = await db.query(
            'SELECT * FROM newsletter_subscriptions WHERE email = ?', [email]
        );

        if (rows && rows.length > 0) {
            // If unsubscribed, reactivate subscription
            if (!rows[0].is_active) {
                await db.query(
                    'UPDATE newsletter_subscriptions SET is_active = TRUE, unsubscribed_at = NULL WHERE email = ?', [email]
                );
                return res.json({ message: 'Subscription reactivated successfully' });
            }
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        // Add new subscription
        await db.query(
            'INSERT INTO newsletter_subscriptions (email) VALUES (?)', [email]
        );

        res.status(201).json({ message: 'Subscribed to newsletter successfully' });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }
};

// Unsubscribe from newsletter
exports.unsubscribe = async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Please provide an email address' });
        }

        const [result] = await db.query(
            'UPDATE newsletter_subscriptions SET is_active = FALSE, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?', [email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Email not found in subscription list' });
        }

        res.json({ message: 'Unsubscribed from newsletter successfully' });
    } catch (error) {
        console.error('Error unsubscribing from newsletter:', error);
        res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
    }
};

// Get all subscribers (for admin)
exports.getAllSubscribers = async(req, res) => {
    try {
        const [subscribers] = await db.query(
            'SELECT * FROM newsletter_subscriptions WHERE is_active = TRUE ORDER BY subscribed_at DESC'
        );

        res.json({ data: subscribers || [] });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
};