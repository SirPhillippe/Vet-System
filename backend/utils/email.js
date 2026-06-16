const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        console.warn('Email configuration not found. Email notifications will be disabled.');
    }
} catch (error) {
    console.error('Failed to initialize email transport:', error);
}

exports.sendEmail = async(to, subject, text) => {
    if (!transporter) {
        console.log('Email notification skipped (not configured):', { to, subject });
        return null;
    }

    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@vettech.com',
            to,
            subject,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw the error, just log it
        return null;
    }
};