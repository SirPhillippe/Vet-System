const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getCurrentUser);
router.put('/change-password', authController.changePassword);
router.put('/profile', authController.updateProfile);

module.exports = router;