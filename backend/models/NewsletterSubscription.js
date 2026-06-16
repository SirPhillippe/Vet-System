const db = require('../config/database');

const NewsletterSubscription = {
    create: async(email) => {
        try {
            // First check if email exists
            const [existing] = await db.query(
                'SELECT email FROM newsletter_subscriptions WHERE email = ?', [email]
            );

            if (existing.length > 0) {
                throw new Error('Already subscribed');
            }

            // If email doesn't exist, insert it
            const [result] = await db.query(
                'INSERT INTO newsletter_subscriptions (email) VALUES (?)', [email]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    findAll: async() => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM newsletter_subscriptions ORDER BY created_at DESC'
            );
            return rows;
        } catch (error) {
            throw new Error(`Error fetching subscribers: ${error.message}`);
        }
    },

    findByEmail: async(email) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM newsletter_subscriptions WHERE email = ?', [email]
            );
            return rows[0];
        } catch (error) {
            throw new Error(`Error finding subscriber: ${error.message}`);
        }
    },

    delete: async(email) => {
        try {
            const [result] = await db.query(
                'DELETE FROM newsletter_subscriptions WHERE email = ?', [email]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error unsubscribing: ${error.message}`);
        }
    }
};

module.exports = NewsletterSubscription;