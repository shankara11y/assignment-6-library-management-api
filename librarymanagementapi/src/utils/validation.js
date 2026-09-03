const { body } = require('express-validator');

// Registration validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'librarian'])
    .withMessage('Role must be either student or librarian'),
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Profile update validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Book creation validation rules
const createBookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Book title is required'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author name is required'),
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
];

// Book update validation rules
const updateBookValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Book title cannot be empty'),
  body('author')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Author name cannot be empty'),
  body('isbn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('ISBN cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
];

// Role update validation rules
const updateRoleValidation = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['student', 'librarian'])
    .withMessage('Role must be either student or librarian'),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  createBookValidation,
  updateBookValidation,
  updateRoleValidation,
};
