const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateJWT = require('../middleware/auth');
const requireRole = require('../middleware/role');

// Authenticated user transaction history
router.get('/my', authenticateJWT, transactionController.getMyTransactions);

// Librarian view all transactions
router.get('/', authenticateJWT, requireRole('librarian'), transactionController.getAllTransactions);

module.exports = router;
