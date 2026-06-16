const express = require('express');
const router = express.Router();
const NewsletterSubscription = require('../models/NewsletterSubscription');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.post('/subscribe', async(req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        await NewsletterSubscription.create(email);
        res.status(201).json({ message: "Subscribed successfully!" });
    } catch (error) {
        if (error.message === 'Already subscribed') {
            return res.status(409).json({
                error: "Already subscribed",
                message: "This email is already subscribed to our newsletter."
            });
        }
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ error: "An error occurred while processing your subscription" });
    }
});

router.post('/unsubscribe', async(req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const success = await NewsletterSubscription.delete(email);
        if (success) {
            res.json({ message: "Successfully unsubscribed" });
        } else {
            res.status(404).json({ error: "Subscription not found" });
        }
    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        res.status(500).json({ error: "An error occurred while processing your unsubscription" });
    }
});

// Protected routes (admin only)
router.use(authenticate);
router.use(requireAdmin);

router.get('/subscribers', async(req, res) => {
    try {
        const subscribers = await NewsletterSubscription.findAll();
        res.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ error: "Failed to fetch subscribers" });
    }
});

module.exports = router;