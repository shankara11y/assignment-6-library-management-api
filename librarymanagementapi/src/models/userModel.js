const { db } = require('../config/firebase');

class UserModel {
  /**
   * Create a new user in Firestore 'users' collection
   */
  static async create(userData) {
    const timestamp = new Date().toISOString();
    const userDoc = {
      userId: userData.userId,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || 'student',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.collection('users').doc(userData.userId).set(userDoc);
    return userDoc;
  }

  /**
   * Find a user by email address in Firestore
   */
  static async findByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    const snapshot = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }

  /**
   * Find a user by userId in Firestore
   */
  static async findById(userId) {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  /**
   * Get all registered users from Firestore (passwords stripped)
   */
  static async findAll() {
    const snapshot = await db.collection('users').get();
    const users = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      delete data.password; // Exclude password hash from response
      users.push(data);
    });

    return users;
  }

  /**
   * Update user details in Firestore
   */
  static async update(userId, updateData) {
    const timestamp = new Date().toISOString();
    const dataToUpdate = {
      ...updateData,
      updatedAt: timestamp,
    };

    await db.collection('users').doc(userId).update(dataToUpdate);
    return this.findById(userId);
  }

  /**
   * Delete a user document from Firestore
   */
  static async delete(userId) {
    await db.collection('users').doc(userId).delete();
    return true;
  }
}

module.exports = UserModel;
