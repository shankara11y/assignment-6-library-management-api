const crypto = require('crypto');
const BookModel = require('../models/bookModel');
const TransactionModel = require('../models/transactionModel');

/**
 * Get list of books with optional filters (category, author, status)
 * GET /api/books
 */
const getBooks = async (req, res, next) => {
  try {
    const { category, author, status } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (author) filters.author = author;
    if (status) filters.status = status;

    const books = await BookModel.findAll(filters);

    return res.status(200).json({
      success: true,
      message: 'Books fetched successfully.',
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single book by ID
 * GET /api/books/:id
 */
const getBookById = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const book = await BookModel.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${bookId}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book details retrieved successfully.',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search books by title, author, category, or ISBN
 * GET /api/books/search?q=query
 */
const searchBooks = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required. Example: /api/books/search?q=alchemist',
      });
    }

    const books = await BookModel.search(query);

    return res.status(200).json({
      success: true,
      message: `Search results for query '${query}'.`,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new book (Librarian only)
 * POST /api/books
 */
const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;
    const bookId = `bk_${crypto.randomBytes(6).toString('hex')}`;

    const newBook = await BookModel.create({
      bookId,
      title,
      author,
      isbn,
      category,
      quantity,
    });

    return res.status(201).json({
      success: true,
      message: 'Book added to catalog successfully.',
      data: newBook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing book (Librarian only)
 * PUT /api/books/:id
 */
const updateBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const existingBook = await BookModel.findById(bookId);

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${bookId}' not found.`,
      });
    }

    const updatedBook = await BookModel.update(bookId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Book information updated successfully.',
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a book (Librarian only)
 * DELETE /api/books/:id
 */
const deleteBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const book = await BookModel.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${bookId}' not found.`,
      });
    }

    // Check if book has active transactions
    const allTransactions = await TransactionModel.findAll();
    const hasActiveBorrow = allTransactions.some(
      (tx) => tx.bookId === bookId && (tx.status === 'active' || tx.status === 'overdue')
    );

    if (hasActiveBorrow) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete book. There are active unreturned borrow transactions for this book.',
      });
    }

    await BookModel.delete(bookId);

    return res.status(200).json({
      success: true,
      message: `Book '${book.title}' (ID: ${bookId}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  searchBooks,
  createBook,
  updateBook,
  deleteBook,
};
