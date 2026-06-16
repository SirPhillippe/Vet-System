const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', serviceController.getAllServices);

// Protected routes (admin only)
router.use(authenticate);
router.use(requireAdmin);

router.get('/:id', serviceController.getServiceById);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;