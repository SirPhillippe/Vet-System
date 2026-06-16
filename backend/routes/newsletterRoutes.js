const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Subscribe to newsletter
router.post('/subscribe', async(req, res) => {
    try {
        const { email } = req.body;

        // Check if email already exists
        const [existing] = await db.query(
            'SELECT * FROM newsletter_subscriptions WHERE email = ?', [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        // Add new subscription
        await db.query(
            'INSERT INTO newsletter_subscriptions (email, status) VALUES (?, "active")', [email]
        );

        res.status(201).json({ message: 'Successfully subscribed to newsletter' });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ message: 'Error subscribing to newsletter' });
    }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async(req, res) => {
    try {
        const { email } = req.body;

        await db.query(
            'UPDATE newsletter_subscriptions SET status = "inactive" WHERE email = ?', [email]
        );

        res.json({ message: 'Successfully unsubscribed from newsletter' });
    } catch (error) {
        console.error('Newsletter unsubscription error:', error);
        res.status(500).json({ message: 'Error unsubscribing from newsletter' });
    }
});

// Get all active subscribers
router.get('/subscribers', async(req, res) => {
    try {
        const [subscribers] = await db.query(
            'SELECT email FROM newsletter_subscriptions WHERE status = "active"'
        );

        res.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ message: 'Error fetching subscribers' });
    }
});

module.exports = router;