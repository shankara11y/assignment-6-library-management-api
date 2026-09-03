const { db } = require('../config/firebase');

class BookModel {
  /**
   * Create a new book document in Firestore 'books' collection
   */
  static async create(bookData) {
    const timestamp = new Date().toISOString();
    const quantity = parseInt(bookData.quantity, 10) || 0;
    const status = quantity > 0 ? 'available' : 'borrowed';

    const bookDoc = {
      bookId: bookData.bookId,
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      category: bookData.category,
      quantity: quantity,
      status: status,
      createdAt: timestamp,
    };

    await db.collection('books').doc(bookData.bookId).set(bookDoc);
    return bookDoc;
  }

  /**
   * Find a book by bookId in Firestore
   */
  static async findById(bookId) {
    const doc = await db.collection('books').doc(bookId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  /**
   * Get all books with optional Firestore filtering (category, author, status)
   */
  static async findAll(filters = {}) {
    let query = db.collection('books');

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.author) {
      query = query.where('author', '==', filters.author);
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    const books = [];
    snapshot.forEach((doc) => books.push(doc.data()));
    return books;
  }

  /**
   * Search books by title, author, category, or ISBN from Firestore
   */
  static async search(searchQuery) {
    const term = searchQuery.toLowerCase();
    const allBooks = await this.findAll();

    return allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.category.toLowerCase().includes(term) ||
        book.isbn.toLowerCase().includes(term)
    );
  }

  /**
   * Update book document in Firestore
   */
  static async update(bookId, updateData) {
    const existing = await this.findById(bookId);
    if (!existing) return null;

    let newQuantity = existing.quantity;
    if (updateData.quantity !== undefined) {
      newQuantity = parseInt(updateData.quantity, 10);
    }

    // Automatically recalculate status based on quantity
    const newStatus = newQuantity > 0 ? 'available' : 'borrowed';

    const dataToUpdate = {
      ...updateData,
      quantity: newQuantity,
      status: newStatus,
    };

    await db.collection('books').doc(bookId).update(dataToUpdate);
    return this.findById(bookId);
  }

  /**
   * Delete a book document from Firestore
   */
  static async delete(bookId) {
    await db.collection('books').doc(bookId).delete();
    return true;
  }
}

module.exports = BookModel;
