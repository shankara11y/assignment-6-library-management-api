const crypto = require('crypto');
const BookModel = require('../models/bookModel');
const TransactionModel = require('../models/transactionModel');
const { db } = require('../config/firebase');

/**
 * Borrow a book (Student only)
 * POST /api/books/:id/borrow
 */
const borrowBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.userId;

    // Check if book exists
    const book = await BookModel.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${bookId}' not found.`,
      });
    }

    // Check if book quantity is available
    if (book.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `Book '${book.title}' is currently unavailable/out of stock.`,
      });
    }

    // Check if student already has an active transaction for the exact same book
    const existingActiveTx = await TransactionModel.findActiveTransaction(userId, bookId);
    if (existingActiveTx) {
      return res.status(400).json({
        success: false,
        message: `You currently have an active borrow transaction for '${book.title}'. Please return it before borrowing again.`,
      });
    }

    const transactionId = `tx_${crypto.randomBytes(6).toString('hex')}`;

    // Perform Firestore atomic transaction for book quantity & transaction consistency
    const bookRef = db.collection('books').doc(bookId);
    const txRef = db.collection('transactions').doc(transactionId);

    await db.runTransaction(async (t) => {
      const bookDoc = await t.get(bookRef);
      if (!bookDoc.exists) throw new Error('Book not found');

      const currentQty = bookDoc.data().quantity;
      if (currentQty <= 0) throw new Error('Book out of stock');

      const newQty = currentQty - 1;
      const newStatus = newQty > 0 ? 'available' : 'borrowed';

      const borrowDate = new Date();
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + 14); // Default 14 days loan period

      // 1. Decrement book quantity and update status in Firestore
      t.update(bookRef, {
        quantity: newQty,
        status: newStatus,
      });

      // 2. Create borrow transaction document in Firestore
      t.set(txRef, {
        transactionId,
        userId,
        bookId,
        type: 'borrow',
        borrowDate: borrowDate.toISOString(),
        dueDate: dueDate.toISOString(),
        returnDate: null,
        status: 'active',
      });
    });

    const createdTxDoc = await db.collection('transactions').doc(transactionId).get();
    const formattedTx = TransactionModel.formatTransaction(createdTxDoc.data());

    return res.status(201).json({
      success: true,
      message: `Successfully borrowed '${book.title}'. Due date: ${new Date(formattedTx.dueDate).toLocaleDateString()}`,
      data: formattedTx,
    });
  } catch (error) {
    if (error.message === 'Book out of stock') {
      return res.status(400).json({
        success: false,
        message: 'Book is out of stock.',
      });
    }
    next(error);
  }
};

/**
 * Return a borrowed book (Student only)
 * POST /api/books/:id/return
 */
const returnBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.userId;

    // Check if book exists
    const book = await BookModel.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${bookId}' not found.`,
      });
    }

    // Find active transaction for this student & book
    const activeTx = await TransactionModel.findActiveTransaction(userId, bookId);
    if (!activeTx) {
      return res.status(400).json({
        success: false,
        message: `No active borrow transaction found for book '${book.title}' by this user.`,
      });
    }

    const wasOverdue = activeTx.isOverdue || activeTx.currentStatus === 'overdue';
    const returnDate = new Date().toISOString();

    // Perform Firestore atomic transaction for book return & quantity increment
    const bookRef = db.collection('books').doc(bookId);
    const txRef = db.collection('transactions').doc(activeTx.transactionId);

    await db.runTransaction(async (t) => {
      const bookDoc = await t.get(bookRef);
      const currentQty = bookDoc.data().quantity;
      const newQty = currentQty + 1;

      // 1. Increment book quantity & set status to available in Firestore
      t.update(bookRef, {
        quantity: newQty,
        status: 'available',
      });

      // 2. Mark transaction returned in Firestore
      t.update(txRef, {
        status: 'returned',
        returnDate: returnDate,
        wasOverdue: wasOverdue,
      });
    });

    const updatedTxDoc = await db.collection('transactions').doc(activeTx.transactionId).get();

    return res.status(200).json({
      success: true,
      message: wasOverdue
        ? `Book '${book.title}' returned successfully. Note: This return was OVERDUE!`
        : `Book '${book.title}' returned successfully on time.`,
      data: {
        ...updatedTxDoc.data(),
        wasOverdue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged-in user's transaction history from Firestore
 * GET /api/transactions/my
 */
const getMyTransactions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const transactions = await TransactionModel.findUserTransactions(userId);

    return res.status(200).json({
      success: true,
      message: 'User transaction history fetched successfully.',
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions across system from Firestore (Librarian only)
 * GET /api/transactions
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await TransactionModel.findAll();

    return res.status(200).json({
      success: true,
      message: 'All system transactions fetched successfully.',
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getMyTransactions,
  getAllTransactions,
};
