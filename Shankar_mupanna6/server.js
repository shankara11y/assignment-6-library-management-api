const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const logger = require('./src/middleware/logger');
const apiLimiter = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');
const setupSwagger = require('./src/config/swagger');

// Import Route Handlers
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Initialize Express Application
const app = express();
const PORT = process.env.PORT || 3000;

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Request Logger Middleware
app.use(logger);

// Global Rate Limiting Middleware
app.use('/api', apiLimiter);

// Setup Swagger API Documentation
setupSwagger(app);

// Root Welcome / Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Library Management REST API is running successfully',
    documentation: `http://localhost:${PORT}/api-docs`,
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// 404 Not Found Middleware for unhandled endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
  });
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
