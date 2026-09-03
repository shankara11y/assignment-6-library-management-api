const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load Open API documentation from YAML file
const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/swagger.yaml'));

// Function to attach Swagger UI middleware to Express app
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Library Management API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  }));
  console.log('📖 Swagger documentation available at /api-docs');
};

module.exports = setupSwagger;
