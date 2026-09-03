const bcrypt = require('bcrypt');
const crypto = require('crypto');
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user (Student or Librarian)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique userId
    const userId = `usr_${crypto.randomBytes(6).toString('hex')}`;

    // Create user in database
    const newUser = await UserModel.create({
      userId,
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
    });

    // Omit password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in existing user and issue JWT token
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT Token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    // Return response without password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, email, password } = req.body;

    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const updateData = {};

    if (name) updateData.name = name;

    if (email && email.toLowerCase() !== existingUser.email) {
      // Check if new email is taken by another user
      const emailTaken = await UserModel.findByEmail(email);
      if (emailTaken && emailTaken.userId !== userId) {
        return res.status(409).json({
          success: false,
          message: 'The requested email address is already in use.',
        });
      }
      updateData.email = email.toLowerCase();
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await UserModel.update(userId, updateData);
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
