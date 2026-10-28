function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  console.error('[ERROR]', err);
  res.status(err.status || err.statusCode || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'Внутренняя ошибка сервера',
  });
}

function notFound(req, res) {
  res.status(404).json({
    error: 'NotFound',
    message: `Маршрут ${req.method} ${req.originalUrl} не найден`,
  });
}

module.exports = { errorHandler, notFound };
