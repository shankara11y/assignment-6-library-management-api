const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateJWT = require('../middleware/auth');
const validate = require('../middleware/validator');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require('../utils/validation');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);

// Protected profile routes
router.get('/profile', authenticateJWT, authController.getProfile);
router.put('/profile', authenticateJWT, updateProfileValidation, validate, authController.updateProfile);

module.exports = router;
