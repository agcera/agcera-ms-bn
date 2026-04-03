import { PaymentMethodsEnum } from '@database/models/paymentMethods';
import Joi from 'joi';

export type CreateSaleProduct = {
  productId: string;
  quantity: number;
};

const paymentSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid(...Object.values(PaymentMethodsEnum))
    .required(),
  amount: Joi.number().positive().required(),
});

export const createSaleSchema = Joi.object({
  variations: Joi.object().pattern(Joi.string().required(), Joi.number().integer().required()).min(1),
  mixtures: Joi.object().pattern(Joi.string().required(), Joi.number().integer().required()).min(1),
  payments: Joi.array().items(paymentSchema).unique('paymentMethod').min(1).required(),
  phone: Joi.string()
    .pattern(/^\+\d{12}$/)
    .message('Please provide a valid phone number that starts with + and have 12 digits for clientId')
    .required(),
  clientName: Joi.string().required(),
  isMember: Joi.boolean().default(false),
  storeId: Joi.string().uuid().required(),
  doneOn: Joi.date(),
}).or('variations', 'mixtures');
createSaleSchema;
