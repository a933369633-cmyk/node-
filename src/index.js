const express = require('express');
const config = require('./config');
const logger = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const productsRouter = require('./routes/products');

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads/products', express.static(config.uploadDir));

app.use('/api/products', productsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Сервер запущен: http://localhost:${config.port}`);
});
