const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, requireVet } = require('../middlewares/authMiddleware');
const { validateAppointment } = require('../middlewares/validationMiddleware');

// Public routes
router.post('/', validateAppointment, appointmentController.createAppointment);
router.get('/available-slots', appointmentController.getAvailableSlots);
router.post('/verify-slot', appointmentController.verifySlotAvailability);
router.post('/confirm-payment', appointmentController.confirmPayment);
router.get('/:id/receipt', appointmentController.downloadReceipt);

// Protected routes
router.use(authenticate);

// Vet and admin routes
router.get('/', requireVet, appointmentController.getAppointments);
router.get('/today', requireVet, appointmentController.getTodayAppointments);
router.get('/upcoming', requireVet, appointmentController.getUpcomingAppointments);
router.get('/:id', requireVet, appointmentController.getAppointmentById);
router.put('/:id/status', requireVet, appointmentController.updateAppointmentStatus);
router.put('/:id/notes', requireVet, appointmentController.updateAppointmentNotes);
router.delete('/:id', requireVet, appointmentController.cancelAppointment);

// Payment webhook (no auth required, validated by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), appointmentController.handlePaymentWebhook);

module.exports = router;