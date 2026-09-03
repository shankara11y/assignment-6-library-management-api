const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const transactionController = require('../controllers/transactionController');
const authenticateJWT = require('../middleware/auth');
const requireRole = require('../middleware/role');
const validate = require('../middleware/validator');
const { createBookValidation, updateBookValidation } = require('../utils/validation');

// Public catalog routes
router.get('/', bookController.getBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Student only borrowing & return routes
router.post('/:id/borrow', authenticateJWT, requireRole('student'), transactionController.borrowBook);
router.post('/:id/return', authenticateJWT, requireRole('student'), transactionController.returnBook);

// Librarian only book management routes
router.post('/', authenticateJWT, requireRole('librarian'), createBookValidation, validate, bookController.createBook);
router.put('/:id', authenticateJWT, requireRole('librarian'), updateBookValidation, validate, bookController.updateBook);
router.delete('/:id', authenticateJWT, requireRole('librarian'), bookController.deleteBook);

module.exports = router;
