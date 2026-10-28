const Joi = require('joi');
const config = require('../config');

const body = {
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().greater(0).required(),
  category: Joi.string().valid(...config.categories).required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).allow('', null),
};

const createSchema = Joi.object(body);
const putSchema = Joi.object(body);

const patchSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  price: Joi.number().greater(0),
  category: Joi.string().valid(...config.categories),
  stock: Joi.number().integer().min(0),
  description: Joi.string().max(500).allow('', null),
}).min(1);

const idSchema = Joi.object({ id: Joi.number().integer().positive().required() });

const querySchema = Joi.object({
  category: Joi.string().valid(...config.categories),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  page: Joi.number().integer().min(1).default(config.pagination.defaultPage),
  limit: Joi.number().integer().min(1).max(config.pagination.maxLimit).default(config.pagination.defaultLimit),
}).custom((v, helpers) => {
  if (v.minPrice !== undefined && v.maxPrice !== undefined && v.minPrice > v.maxPrice) {
    return helpers.error('any.custom');
  }
  return v;
});

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Ошибка валидации входных данных',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
          type: d.type,
        })),
      });
    }
    req[source] = value;
    next();
  };
}

module.exports = {
  validate,
  schemas: { createSchema, putSchema, patchSchema, idSchema, querySchema },
};
