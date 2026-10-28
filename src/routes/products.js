const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validate');
const { uploadSingle } = require('../middleware/upload');

let products = [];
let nextId = 1;

router.get('/', validate(schemas.querySchema, 'query'), (req, res) => {
  const { category, minPrice, maxPrice, page, limit } = req.query;
  let list = [...products];

  if (category) list = list.filter((p) => p.category === category);
  if (minPrice !== undefined) list = list.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) list = list.filter((p) => p.price <= maxPrice);

  const total = list.length;
  const data = list.slice((page - 1) * limit, page * limit);

  res.status(200).json({ data, total, page, limit });
});

router.get('/:id', validate(schemas.idSchema, 'params'), (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'NotFound', message: `Товар с id=${req.params.id} не найден` });
  }
  res.status(200).json(product);
});

router.post('/', validate(schemas.createSchema, 'body'), (req, res) => {
  const { name, price, category, stock, description } = req.body;
  const product = {
    id: nextId++,
    name,
    price,
    category,
    stock: stock ?? 0,
    description: description ?? '',
    imageUrl: null,
    createdAt: new Date().toISOString(),
  };
  products.push(product);
  res.status(201).json(product);
});

router.put(
  '/:id',
  validate(schemas.idSchema, 'params'),
  validate(schemas.putSchema, 'body'),
  (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'NotFound', message: `Товар с id=${req.params.id} не найден` });
    }
    const { name, price, category, stock, description } = req.body;
    Object.assign(product, { name, price, category, stock: stock ?? 0, description: description ?? '' });
    res.status(200).json(product);
  }
);

router.patch(
  '/:id',
  validate(schemas.idSchema, 'params'),
  validate(schemas.patchSchema, 'body'),
  (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'NotFound', message: `Товар с id=${req.params.id} не найден` });
    }
    Object.assign(product, req.body);
    res.status(200).json(product);
  }
);

router.delete('/:id', validate(schemas.idSchema, 'params'), (req, res) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'NotFound', message: `Товар с id=${req.params.id} не найден` });
  }
  products.splice(index, 1);
  res.status(204).send();
});

router.post(
  '/:id/image',
  validate(schemas.idSchema, 'params'),
  uploadSingle('image'),
  (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'NotFound', message: `Товар с id=${req.params.id} не найден` });
    }
    if (!req.file) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Файл изображения не передан',
        details: [{ field: 'image', message: 'Файл обязателен', type: 'any.required' }],
      });
    }
    product.imageUrl = `/uploads/products/${req.file.filename}`;
    res.status(200).json(product);
  }
);

module.exports = router;
