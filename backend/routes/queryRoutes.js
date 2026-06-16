const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const queryController = require('../controllers/query.controller');

// Public route for submitting queries (no authentication required)
router.post('/submit', queryController.submitQuery);

// Admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get all queries with pagination and filtering
router.get('/', queryController.getAllQueries);

// Get single query by ID
router.get('/:id', queryController.getQueryById);

// Update query status
router.patch('/:id', queryController.updateQueryStatus);

// Reply to a query
router.post('/:id/reply', queryController.replyToQuery);

// Delete a query
router.delete('/:id', queryController.deleteQuery);

// Get query statistics
router.get('/stats/summary', queryController.getQueryStats);

module.exports = router;