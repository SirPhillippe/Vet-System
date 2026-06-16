const crypto = require('crypto');
const db = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendAppointmentConfirmation, sendAppointmentReminder } = require('../utils/emailService');
const { generateAppointmentReceipt } = require('../utils/reportGenerator');

// Display labels and reference prefixes for each supported payment method
const PAYMENT_METHODS = {
    ecocash: { label: 'EcoCash', prefix: 'ECO' },
    innbucks: { label: 'InnBucks', prefix: 'INN' },
    omari: { label: 'Omari', prefix: 'OMA' },
    visa: { label: 'Visa', prefix: 'VSA' },
    mastercard: { label: 'Mastercard', prefix: 'MC' }
};

// Generate a transaction reference, e.g. "ECO-8F3K9D2A"
function generatePaymentReference(method) {
    const prefix = (PAYMENT_METHODS[method] && PAYMENT_METHODS[method].prefix) || 'TXN';
    const random = crypto.randomBytes(5).toString('hex').toUpperCase().slice(0, 8);
    return `${prefix}-${random}`;
}

// Build a human-friendly receipt number from the appointment id, e.g. "PC-2026-000123"
function buildReceiptNumber(appointmentId) {
    return `PC-${new Date().getFullYear()}-${String(appointmentId).padStart(6, '0')}`;
}

exports.createAppointment = async(req, res) => {
    try {
        const {
            client_name,
            client_email,
            client_phone,
            pet_name,
            pet_type,
            pet_breed,
            pet_age,
            service_id,
            appointment_date,
            appointment_time,
            notes,
            newsletter,
            payment_method
        } = req.body;

        // Resolve payment method to a known label (defaults to EcoCash if unrecognised)
        const methodKey = PAYMENT_METHODS[payment_method] ? payment_method : 'ecocash';
        const paymentMethodLabel = PAYMENT_METHODS[methodKey].label;
        const paymentReference = generatePaymentReference(methodKey);

        console.log('Creating appointment with data:', {...req.body, client_phone: 'REDACTED' });
        console.log('Service ID:', service_id, 'Type:', typeof service_id);

        // Check if service exists and get service details
        const serviceQuery = 'SELECT *, CAST(price AS DECIMAL(10,2)) as price FROM services WHERE id = ?';
        console.log('Executing query:', serviceQuery, 'with params:', [service_id]);

        const services = await db.query(serviceQuery, [service_id]);
        console.log('Database result:', services);

        if (!services || services.length === 0) {
            console.error('Service not found:', service_id);
            return res.status(404).json({ error: "Service not found" });
        }

        const service = services[0];
        console.log('Service data:', JSON.stringify(service, null, 2));

        if (!service || typeof service !== 'object') {
            console.error('Invalid service data:', service);
            return res.status(500).json({ error: "Invalid service data" });
        }

        if (!service.price) {
            console.error('Service price is missing:', service);
            return res.status(400).json({ error: "Service price is missing" });
        }

        // Ensure price is a valid number
        const servicePrice = parseFloat(service.price);
        if (isNaN(servicePrice)) {
            console.error('Invalid service price:', service.price);
            return res.status(400).json({ error: "Invalid service price" });
        }
        console.log('Service price:', servicePrice);

        // Prevent double-booking: check if slot is already taken (robust for all MySQL drivers)
        const existingAppointmentsResult = await db.query(
            'SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != "cancelled"', [appointment_date, appointment_time]
        );
        const existingAppointments = Array.isArray(existingAppointmentsResult[0]) ? existingAppointmentsResult[0] : existingAppointmentsResult;
        if (existingAppointments.length > 0) {
            return res.status(409).json({ error: "This time slot is already booked. Please choose another time." });
        }

        // Create appointment with paid status directly
        const appointmentQuery = `
            INSERT INTO appointments (
                client_name, client_email, client_phone,
                pet_name, pet_type, pet_breed, pet_age,
                service_id, appointment_date, appointment_time,
                notes, status, price, payment_status,
                payment_method, payment_reference
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, 'paid', ?, ?)
        `;

        const normalizedPetAge = Number.isFinite(parseFloat(pet_age)) ? parseFloat(pet_age) : null;
        const appointmentParams = [
            client_name, client_email, client_phone,
            pet_name, pet_type, pet_breed, normalizedPetAge,
            service_id, appointment_date, appointment_time,
            notes, servicePrice, paymentMethodLabel, paymentReference
        ];

        console.log('Creating appointment with query:', appointmentQuery);
        console.log('Appointment parameters:', {...appointmentParams, client_phone: 'REDACTED' });

        const appointmentResult = await db.query(appointmentQuery, appointmentParams);

        if (!appointmentResult || !appointmentResult.insertId) {
            console.error('Failed to create appointment:', appointmentResult);
            throw new Error('Failed to create appointment record');
        }

        console.log('Appointment created with ID:', appointmentResult.insertId);

        // Build the receipt number from the new row id and persist it
        const receiptNumber = buildReceiptNumber(appointmentResult.insertId);
        await db.query(
            'UPDATE appointments SET receipt_number = ? WHERE id = ?', [receiptNumber, appointmentResult.insertId]
        );

        // Handle newsletter subscription if checked
        if (newsletter) {
            try {
                await db.query(
                    'INSERT IGNORE INTO newsletter_subscriptions (email, status) VALUES (?, "active")', [client_email]
                );
                console.log('Newsletter subscription processed for:', client_email);
            } catch (err) {
                console.error('Error processing newsletter subscription:', err);
                // Don't fail the appointment creation if newsletter subscription fails
            }
        }

        // Try to send confirmation email, but don't fail if it doesn't work
        try {
            await sendAppointmentConfirmation({
                to: client_email,
                name: client_name,
                email: client_email,
                phone: client_phone,
                petName: pet_name,
                petType: pet_type,
                petBreed: pet_breed,
                date: appointment_date,
                time: appointment_time,
                service: service.name,
                receiptNumber,
                paymentMethod: paymentMethodLabel,
                paymentReference,
                amount: servicePrice.toFixed(2),
                appointmentId: appointmentResult.insertId
            });
            console.log('Confirmation email sent to:', client_email);
        } catch (err) {
            console.error('Error sending confirmation email:', err);
            // Don't fail the appointment creation if email sending fails
        }

        res.status(201).json({
            message: "Appointment created successfully",
            appointmentId: appointmentResult.insertId,
            receipt_number: receiptNumber,
            payment_method: paymentMethodLabel,
            payment_reference: paymentReference,
            amount_paid: servicePrice.toFixed(2)
        });
    } catch (err) {
        console.error('Error creating appointment:', err);
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({ error: "An error occurred while creating appointment" });
    }
};

exports.getAvailableSlots = async(req, res) => {
    try {
        const { date, service_id } = req.query;
        let serviceDuration;
        try {
            const result = await db.query('SELECT duration FROM services WHERE id = ?', [service_id]);
            let service;
            if (Array.isArray(result)) {
                if (Array.isArray(result[0])) {
                    // MySQL2: [ [ { duration: 20 } ], ... ]
                    service = result[0][0];
                } else {
                    // Some drivers: [ { duration: 20 } ]
                    service = result[0];
                }
            } else if (result && result.duration) {
                // Single object
                service = result;
            }
            console.log('getAvailableSlots: service:', service);
            serviceDuration = service && service.duration;
            console.log('getAvailableSlots: serviceDuration:', serviceDuration);
            if (!serviceDuration) {
                return res.status(404).json({ error: "Service not found" });
            }
        } catch (err) {
            console.error('getAvailableSlots: error fetching service duration:', err);
            return res.status(500).json({ error: "Error fetching service duration" });
        }

        let appointments;
        try {
            const result = await db.query(
                'SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status != "cancelled"', [date]
            );
            appointments = Array.isArray(result[0]) ? result[0] : result;
            console.log('getAvailableSlots: appointments:', appointments);
        } catch (err) {
            console.error('getAvailableSlots: error fetching appointments:', err);
            return res.status(500).json({ error: "Error fetching appointments" });
        }

        // Fetch working hours from settings table (single row)
        let workingHoursStart, workingHoursEnd;
        try {
            const [rows] = await db.query('SELECT working_hours_start, working_hours_end FROM settings LIMIT 1');
            if (!rows || !rows.working_hours_start || !rows.working_hours_end) {
                throw new Error('Working hours not found in settings');
            }
            workingHoursStart = rows.working_hours_start; // e.g., "09:00"
            workingHoursEnd = rows.working_hours_end; // e.g., "17:00"
            console.log('getAvailableSlots: workingHoursStart:', workingHoursStart, 'workingHoursEnd:', workingHoursEnd);
        } catch (err) {
            console.error('getAvailableSlots: error fetching working hours:', err);
            return res.status(500).json({ error: "Error fetching working hours" });
        }

        // Generate available time slots
        const slots = [];
        try {
            const startTime = new Date(`${date}T${workingHoursStart}`);
            const endTime = new Date(`${date}T${workingHoursEnd}`);
            // Ensure booked times are in 'HH:MM:SS' format
            const bookedTimes = appointments.map(a => a.appointment_time); // e.g., ['09:30:00']
            // Last slot starts 1 hour before closing (e.g. 16:00 when clinic closes at 17:00)
            const lastSlotTime = new Date(endTime.getTime() - 60 * 60000);
            let current = new Date(startTime);
            while (current <= lastSlotTime) {
                const slotTime = current.toTimeString().slice(0, 8); // 'HH:MM:SS'
                if (!bookedTimes.includes(slotTime)) {
                    slots.push(slotTime);
                }
                current = new Date(current.getTime() + 30 * 60000);
            }
        } catch (err) {
            console.error('getAvailableSlots: error generating slots:', err);
            return res.status(500).json({ error: "Error generating available slots" });
        }

        res.json(slots);
    } catch (err) {
        console.error('Error getting available slots:', err);
        res.status(500).json({ error: "An error occurred while fetching available slots" });
    }
};

exports.getAppointments = async(req, res) => {
    try {
        const { status, date, vet_id } = req.query;

        let query = `
            SELECT 
                a.*,
                s.name as service_name,
                s.duration,
                s.price
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        if (date) {
            query += ' AND a.appointment_date = ?';
            params.push(date);
        }

        if (vet_id) {
            query += ' AND a.vet_id = ?';
            params.push(vet_id);
        }

        query += ` ORDER BY 
            CASE 
                WHEN DATE(a.appointment_date) = CURDATE() THEN 1
                WHEN a.appointment_date > CURDATE() THEN 2
                ELSE 3
            END,
            a.appointment_date ASC,
            a.appointment_time ASC`;

        const [appointments] = await db.query(query, params);
        res.json(appointments);
    } catch (err) {
        console.error('Error getting appointments:', err);
        res.status(500).json({ error: "An error occurred while fetching appointments" });
    }
};

exports.getAppointmentById = async(req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT 
                a.*,
                s.name as service_name,
                s.duration,
                s.price
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.id = ?`, [req.params.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        res.json(appointments[0]);
    } catch (err) {
        console.error('Error getting appointment:', err);
        res.status(500).json({ error: "An error occurred while fetching appointment" });
    }
};

exports.downloadReceipt = async(req, res) => {
    try {
        const appointments = await db.query(
            `SELECT
                a.*,
                s.name as service_name
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.id = ?`, [req.params.id]
        );

        const appointment = Array.isArray(appointments) ? appointments[0] : null;
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        const pdfBuffer = await generateAppointmentReceipt(appointment);
        const fileName = `receipt-${appointment.receipt_number || appointment.id}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Error generating receipt:', err);
        res.status(500).json({ error: "An error occurred while generating the receipt" });
    }
};

exports.updateAppointmentStatus = async(req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const [appointment] = await db.query(
            'SELECT * FROM appointments WHERE id = ?', [req.params.id]
        );

        if (appointment.length === 0) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        await db.query(
            'UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]
        );

        // Send reminder email if status is confirmed
        if (status === 'confirmed') {
            await sendAppointmentReminder({
                to: appointment[0].client_email,
                name: appointment[0].client_name,
                date: appointment[0].appointment_date,
                time: appointment[0].appointment_time
            });
        }

        res.json({ message: "Appointment status updated successfully" });
    } catch (err) {
        console.error('Error updating appointment status:', err);
        res.status(500).json({ error: "An error occurred while updating appointment status" });
    }
};

exports.updateAppointmentNotes = async(req, res) => {
    try {
        const { notes } = req.body;

        const [appointment] = await db.query(
            'SELECT * FROM appointments WHERE id = ?', [req.params.id]
        );

        if (appointment.length === 0) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        await db.query(
            'UPDATE appointments SET notes = ? WHERE id = ?', [notes, req.params.id]
        );

        res.json({ message: "Appointment notes updated successfully" });
    } catch (err) {
        console.error('Error updating appointment notes:', err);
        res.status(500).json({ error: "An error occurred while updating appointment notes" });
    }
};

exports.cancelAppointment = async(req, res) => {
    try {
        const [appointment] = await db.query(
            'SELECT * FROM appointments WHERE id = ?', [req.params.id]
        );

        if (appointment.length === 0) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        // If payment was made, process refund
        if (appointment[0].payment_status === 'paid' && appointment[0].stripe_payment_intent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(
                appointment[0].stripe_payment_intent
            );

            if (paymentIntent.status === 'succeeded') {
                await stripe.refunds.create({
                    payment_intent: appointment[0].stripe_payment_intent
                });
            }
        }

        await db.query(
            'UPDATE appointments SET status = "cancelled" WHERE id = ?', [req.params.id]
        );

        res.json({ message: "Appointment cancelled successfully" });
    } catch (err) {
        console.error('Error cancelling appointment:', err);
        res.status(500).json({ error: "An error occurred while cancelling appointment" });
    }
};

exports.handlePaymentWebhook = async(req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;

            await db.query(
                'UPDATE appointments SET payment_status = "paid" WHERE stripe_payment_intent = ?', [paymentIntent.id]
            );
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

exports.verifySlotAvailability = async(req, res) => {
    try {
        const { date, time, service_id } = req.body;

        // Get service duration
        const [services] = await db.query(
            'SELECT duration FROM services WHERE id = ?', [service_id]
        );

        if (services.length === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        // Check if slot is available
        const [appointments] = await db.query(
            'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != "cancelled"', [date, time]
        );

        const isAvailable = appointments[0].count === 0;
        res.json({ available: isAvailable });
    } catch (err) {
        console.error('Error verifying slot availability:', err);
        res.status(500).json({ error: "An error occurred while verifying slot availability" });
    }
};

exports.confirmPayment = async(req, res) => {
    try {
        const { appointment_id, payment_intent_id } = req.body;

        // Verify payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: "Payment not successful" });
        }

        // Update appointment payment status
        await db.query(
            'UPDATE appointments SET payment_status = "paid", status = "confirmed" WHERE id = ?', [appointment_id]
        );

        // Get appointment details for confirmation email
        const [appointments] = await db.query(
            `SELECT 
                a.*,
                s.name as service_name
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.id = ?`, [appointment_id]
        );

        if (appointments.length > 0) {
            const appointment = appointments[0];
            await sendAppointmentConfirmation({
                to: appointment.client_email,
                name: appointment.client_name,
                date: appointment.appointment_date,
                time: appointment.appointment_time,
                service: appointment.service_name
            });
        }

        res.json({ message: "Payment confirmed successfully" });
    } catch (err) {
        console.error('Error confirming payment:', err);
        res.status(500).json({ error: "An error occurred while confirming payment" });
    }
};

exports.getTodayAppointments = async(req, res) => {
    try {
        const appointments = await db.pool.query(
            `SELECT 
                a.*,
                s.name as service_name,
                s.duration,
                s.price
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE DATE(a.appointment_date) = CURDATE()
            ORDER BY a.appointment_time`
        );

        const [rows] = appointments;
        res.json(rows);
    } catch (err) {
        console.error('Error getting today\'s appointments:', err);
        res.status(500).json({ error: "An error occurred while fetching today's appointments" });
    }
};

exports.getUpcomingAppointments = async(req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT 
                a.*,
                s.name as service_name,
                s.duration,
                s.price
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.appointment_date >= CURDATE()
            ORDER BY a.appointment_date, a.appointment_time
            LIMIT 10`,
        );
        res.json(appointments);
    } catch (err) {
        console.error('Error getting upcoming appointments:', err);
        res.status(500).json({ error: "An error occurred while fetching upcoming appointments" });
    }
};