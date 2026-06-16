const { body, validationResult } = require('express-validator');

exports.validateAppointment = [
    body('client_name')
    .trim()
    .notEmpty().withMessage('Client name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Client name must be between 2 and 100 characters'),

    body('client_email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

    body('client_phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$|^[+]?[0-9]{10,15}$/)
    .withMessage('Please enter a valid phone number (e.g., +1234567890, 123-456-7890, or 1234567890)'),

    body('service_id')
    .notEmpty().withMessage('Service is required')
    .isInt().withMessage('Invalid service ID'),

    body('appointment_date')
    .notEmpty().withMessage('Appointment date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        if (date < now) {
            throw new Error('Appointment date must be in the future');
        }
        return true;
    }),

    body('appointment_time')
    .notEmpty().withMessage('Appointment time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),

    body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateService = [
    body('name')
    .trim()
    .notEmpty().withMessage('Service name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Service name must be between 2 and 100 characters'),

    body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),

    body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 15, max: 240 }).withMessage('Duration must be between 15 and 240 minutes'),

    body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];