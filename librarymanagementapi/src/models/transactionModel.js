const { db } = require('../config/firebase');

class TransactionModel {
  /**
   * Helper function to check and compute overdue status dynamically
   */
  static formatTransaction(tx) {
    if (!tx) return null;
    const now = new Date();
    const dueDate = new Date(tx.dueDate);

    // If transaction is active but past due date, compute runtime overdue status
    const isOverdue = tx.status === 'active' && now > dueDate;
    const currentStatus = isOverdue ? 'overdue' : tx.status;

    return {
      ...tx,
      currentStatus,
      isOverdue,
    };
  }

  /**
   * Create a new transaction document in Firestore 'transactions' collection
   */
  static async create(data) {
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14); // 14 days lending period default

    const transactionDoc = {
      transactionId: data.transactionId,
      userId: data.userId,
      bookId: data.bookId,
      type: 'borrow',
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: 'active',
    };

    await db.collection('transactions').doc(data.transactionId).set(transactionDoc);
    return this.formatTransaction(transactionDoc);
  }

  /**
   * Find active borrow transaction for a specific user and book in Firestore
   */
  static async findActiveTransaction(userId, bookId) {
    const snapshot = await db
      .collection('transactions')
      .where('userId', '==', userId)
      .where('bookId', '==', bookId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return this.formatTransaction(snapshot.docs[0].data());
  }

  /**
   * Get all transactions for a specific user from Firestore
   */
  static async findUserTransactions(userId) {
    const snapshot = await db.collection('transactions').where('userId', '==', userId).get();
    const transactions = [];
    snapshot.forEach((doc) => transactions.push(this.formatTransaction(doc.data())));
    return transactions;
  }

  /**
   * Get all transactions in the system from Firestore (Librarian)
   */
  static async findAll() {
    const snapshot = await db.collection('transactions').get();
    const transactions = [];
    snapshot.forEach((doc) => transactions.push(this.formatTransaction(doc.data())));
    return transactions;
  }

  /**
   * Update a transaction in Firestore (e.g., when returning a book)
   */
  static async update(transactionId, updateData) {
    await db.collection('transactions').doc(transactionId).update(updateData);
    const doc = await db.collection('transactions').doc(transactionId).get();
    return this.formatTransaction(doc.data());
  }
}

module.exports = TransactionModel;
