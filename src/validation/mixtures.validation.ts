import Joi from 'joi';

export const createMixtureSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().allow('', null),
  costPrice: Joi.number().min(0).required(),
  sellingPrice: Joi.number().min(Joi.ref('costPrice')).required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        number: Joi.number().integer().min(1).required(),
      })
    )
    .unique('productId')
    .min(1)
    .required(),
});

export const updateMixtureSchema = Joi.object({
  name: Joi.string().min(3),
  description: Joi.string().allow('', null),
  costPrice: Joi.number().min(0),
  sellingPrice: Joi.number().min(Joi.ref('costPrice')),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        number: Joi.number().integer().min(1).required(),
      })
    )
    .unique('productId')
    .min(1),
});
