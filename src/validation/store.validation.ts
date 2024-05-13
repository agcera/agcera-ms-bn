import Joi from 'joi';

export const storeRegisterSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name should be a string',
    'string.empty': 'Name should not be empty',
    'any.required': 'Name is required',
  }),
  location: Joi.string().required(),
  phone: Joi.string()
    .pattern(/^\+\d{12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number that starts with + and have 12 digits',
      'string.empty': 'Phone number cannot be empty',
      'any.required': 'Phone number is a required field',
    }),
  keepers: Joi.array().items(Joi.string()).unique().min(1).required(),
  isActive: Joi.bool(),
});

export const storeUpdateSchema = Joi.object({
  name: Joi.string().messages({
    'string.base': 'Name should be a string',
    'string.empty': 'Name should not be empty',
    'any.required': 'Name is required',
  }),
  location: Joi.string(),
  phone: Joi.string()
    .pattern(/^\+\d{12}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number that starts with + and have 12 digits',
      'string.empty': 'Phone number cannot be empty',
      'any.required': 'Phone number is a required field',
    }),
  keepers: Joi.array().items(Joi.string()).unique().min(1),
  isActive: Joi.bool(),
});

export const addProductToStoreSchema = Joi.object({
  from: Joi.alternatives()
    .try(
      Joi.string().uuid().messages({
        'string.base': 'Store id should be a uuid',
        'string.empty': 'Store id should not be empty',
        'any.required': 'Store id is required',
      }),
      Joi.string().valid('main')
    )
    .required(),
  to: Joi.alternatives()
    .try(
      Joi.string().uuid().messages({
        'string.base': 'Store id should be a uuid',
        'string.empty': 'Store id should not be empty',
        'any.required': 'Store id is required',
      }),
      Joi.string().valid('main')
    )
    .required(),
  productId: Joi.string().required().messages({
    'string.base': 'Product id should be a uuid',
    'string.empty': 'Product id should not be empty',
    'any.required': 'Product id is required',
  }),

  quantity: Joi.number().required().min(1).messages({
    'number.base': 'Quantity should be a number',
    'number.empty': 'Quantity should not be empty',
    'number.min': 'Quantity should be at least 1',
    'any.required': 'Quantity is required',
  }),
});
