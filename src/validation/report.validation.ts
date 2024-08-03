import Joi from 'joi';

export const reportSchema = Joi.object({
  from: Joi.date().required(),
  to: Joi.date().min(Joi.ref('from')).required(),
  storeId: Joi.string().guid(),
  includeChecked: Joi.boolean(),
}).required();
