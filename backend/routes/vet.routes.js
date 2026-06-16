const express = require('express');
const router = express.Router();
const { authenticate, requireVet } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/admin.controller');
const medicalRecordsController = require('../controllers/medicalRecordsController');

// All vet routes require authentication and vet role
router.use(authenticate);
router.use(requireVet);

// Inventory management (same functionality as admin)
router.get('/inventory', adminController.getAllInventory);
router.post('/inventory', adminController.addInventoryItem);
router.put('/inventory/:id', adminController.updateInventoryItem);
router.delete('/inventory/:id', adminController.deleteInventoryItem);
router.post('/inventory/:id/reorder', adminController.reorderInventoryItem);
router.post('/inventory/:id/use', adminController.useInventoryItem);

// Appointments management
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments/today', require('../controllers/appointmentController').getTodayAppointments);
router.post('/appointments', adminController.createAppointment);
router.delete('/appointments/:id', adminController.deleteAppointment);
router.patch('/appointments/:id', adminController.rescheduleAppointment);

// Medical Records management
router.get('/medical-records', medicalRecordsController.getAllMedicalRecords);
router.get('/medical-records/:id', medicalRecordsController.getMedicalRecord);
router.post('/medical-records', medicalRecordsController.createMedicalRecord);
router.put('/medical-records/:id', medicalRecordsController.updateMedicalRecord);
router.delete('/medical-records/:id', medicalRecordsController.deleteMedicalRecord);
router.get('/medical-records-stats', medicalRecordsController.getMedicalRecordsStats);

// Get all patients for medical records
router.get('/patients', medicalRecordsController.getAllPatients);

// Services management (same functionality as admin)
router.get('/services', adminController.getAllServices);

// Dashboard statistics
router.get('/stats/appointments', require('../controllers/statsController').getAppointmentStats);
router.get('/stats/revenue', require('../controllers/statsController').getRevenueStats);
router.get('/stats/services', require('../controllers/statsController').getServiceStats);
router.get('/dashboard-stats', require('../controllers/admin.controller').getDashboardStats);

module.exports = router;