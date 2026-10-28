const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      const err = new Error('Разрешены только файлы JPEG и PNG');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
  limits: { fileSize: config.maxFileSize },
});

function uploadSingle(field = 'image') {
  const mw = upload.single(field);
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Размер файла превышает 2 МБ',
          details: [{ field, message: 'Файл слишком большой', type: 'file.size' }],
        });
      }
      return res.status(err.status || 400).json({
        error: 'UploadError',
        message: err.message,
        details: [{ field, message: err.message, type: err.code || 'upload.error' }],
      });
    });
  };
}

module.exports = { uploadSingle };
