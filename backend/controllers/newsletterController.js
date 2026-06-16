const db = require('../config/database');

exports.subscribe = async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Check if email already exists
        const existingSubscriber = await db.query(
            'SELECT * FROM newsletter_subscribers WHERE email = ?', [email]
        );

        if (existingSubscriber.length > 0) {
            if (existingSubscriber[0].status === 'unsubscribed') {
                // Reactivate subscription
                await db.query(
                    'UPDATE newsletter_subscribers SET status = "active" WHERE email = ?', [email]
                );
                return res.status(200).json({ message: "Subscription reactivated successfully" });
            }
            return res.status(400).json({ error: "Email already subscribed" });
        }

        // Create new subscription
        await db.query(
            'INSERT INTO newsletter_subscribers (email) VALUES (?)', [email]
        );

        res.status(201).json({ message: "Subscribed to newsletter successfully" });
    } catch (err) {
        console.error('Error subscribing to newsletter:', err);
        res.status(500).json({ error: "An error occurred while subscribing to newsletter" });
    }
};

exports.unsubscribe = async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const result = await db.query(
            'UPDATE newsletter_subscribers SET status = "unsubscribed" WHERE email = ?', [email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Subscription not found" });
        }

        res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (err) {
        console.error('Error unsubscribing from newsletter:', err);
        res.status(500).json({ error: "An error occurred while unsubscribing" });
    }
};