const UserModel = require('../models/userModel');

/**
 * Get list of all registered users (Librarian only)
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();

    return res.status(200).json({
      success: true,
      message: 'All registered users fetched successfully.',
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user by ID (Librarian only)
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID '${userId}' not found.`,
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'User details fetched successfully.',
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user's role (Librarian only)
 * PUT /api/users/:id/role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID '${userId}' not found.`,
      });
    }

    const updatedUser = await UserModel.update(userId, { role });
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      success: true,
      message: `Role for user '${user.email}' updated to '${role}'.`,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user account (Librarian only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID '${userId}' not found.`,
      });
    }

    // Safety guard: Protect the last librarian account from being deleted
    if (user.role === 'librarian') {
      const allUsers = await UserModel.findAll();
      const librarianCount = allUsers.filter((u) => u.role === 'librarian').length;
      if (librarianCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last librarian account in the system.',
        });
      }
    }

    await UserModel.delete(userId);

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' (ID: ${userId}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
