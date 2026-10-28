require('dotenv').config();
const path = require('path');

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  uploadDir: path.resolve(process.env.UPLOAD_DIR || 'uploads/products'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 2 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  categories: ['electronics', 'clothing', 'food', 'other'],
  pagination: { defaultPage: 1, defaultLimit: 10, maxLimit: 100 },
};
