const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/admin.controller');
const employeeController = require('../controllers/employeeController');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management
router.get('/users', require('../controllers/userController').getAllUsers);
router.post('/users', require('../controllers/userController').createUser);
router.get('/users/:id', require('../controllers/userController').getUserById);
router.put('/users/:id', require('../controllers/userController').updateUser);
router.delete('/users/:id', require('../controllers/userController').deleteUser);

// Service management
router.get('/services', require('../controllers/serviceController').getAllServices);
router.get('/services/:id', require('../controllers/serviceController').getServiceById);
router.post('/services', require('../controllers/serviceController').createService);
router.put('/services/:id', require('../controllers/serviceController').updateService);
router.delete('/services/:id', require('../controllers/serviceController').deleteService);

// Dashboard statistics
router.get('/stats/appointments', require('../controllers/statsController').getAppointmentStats);
router.get('/stats/revenue', require('../controllers/statsController').getRevenueStats);
router.get('/stats/services', require('../controllers/statsController').getServiceStats);
router.get('/dashboard-stats', require('../controllers/admin.controller').getDashboardStats);

// Appointments management
router.get('/appointments', require('../controllers/admin.controller').getAllAppointments);
router.post('/appointments', adminController.createAppointment);
router.delete('/appointments/:id', adminController.deleteAppointment);
router.patch('/appointments/:id', adminController.rescheduleAppointment);

// Medical records management
router.get('/medical-records', adminController.getAllMedicalRecords);
router.get('/medical-records/:id', adminController.getMedicalRecord);
router.post('/medical-records', adminController.createMedicalRecord);
router.put('/medical-records/:id', adminController.updateMedicalRecord);
router.delete('/medical-records/:id', adminController.deleteMedicalRecord);

// Patients for medical records
router.get('/patients', adminController.getPatients);

// Employee management
router.get('/employees', employeeController.getAllEmployees);
router.post('/employees', employeeController.createEmployee);
router.get('/employees/:id', employeeController.getEmployeeById);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

// Inventory management
router.get('/inventory', adminController.getAllInventory);
router.post('/inventory', adminController.addInventoryItem);
router.put('/inventory/:id', adminController.updateInventoryItem);
router.delete('/inventory/:id', adminController.deleteInventoryItem);
router.post('/inventory/:id/reorder', adminController.reorderInventoryItem);
router.post('/inventory/:id/use', adminController.useInventoryItem);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Reports
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/appointments', adminController.getAppointmentsReport);
router.get('/reports/services', adminController.getServicesReport);
router.get('/reports/clients', adminController.getClientsReport);
router.get('/reports/stats', adminController.getAppointmentStats);

module.exports = router;