const express = require("express");
const router = express.Router();
const db = require("../config/database"); // Ensure DB connection is set up

// Save a query
router.post("/query", async(req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const sql = "INSERT INTO queries (name, email, message) VALUES (?, ?, ?)";
        await db.query(sql, [name, email, message]);
        res.status(201).json({ message: "Query submitted successfully" });
    } catch (err) {
        console.error('Query submission error:', err);
        res.status(500).json({ error: "Database error" });
    }
});

// Save a newsletter subscription
router.post("/subscribe", async(req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // First check if email exists
        const checkSql = "SELECT email FROM newsletter_subscribers WHERE email = ?";
        const [existing] = await db.query(checkSql, [email]);

        if (existing.length > 0) {
            return res.status(409).json({
                error: "Already subscribed",
                message: "This email is already subscribed to our newsletter."
            });
        }

        // If email doesn't exist, insert it
        const insertSql = "INSERT INTO newsletter_subscribers (email) VALUES (?)";
        await db.query(insertSql, [email]);
        res.status(201).json({ message: "Subscribed successfully!" });
    } catch (err) {
        console.error('Newsletter subscription error:', err);
        res.status(500).json({ error: "An error occurred while processing your subscription" });
    }
});

module.exports = router;