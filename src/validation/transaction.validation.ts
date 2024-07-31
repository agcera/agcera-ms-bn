import { PaymentMethodsEnum } from '@database/models/sale';
import { TransactionTypesEnum } from '@src/types/transaction.types';
import joi from 'joi';

export const createTransactionSchema = joi.object({
  amount: joi.number().required(),
  description: joi.string().max(255).required(),
  paymentMethod: joi.string().valid(...Object.values(PaymentMethodsEnum)),
  type: joi
    .string()
    .valid(...Object.values(TransactionTypesEnum))
    .required()
    .messages({
      'any.only': 'Invalid transaction type',
      'any.required': 'Transaction type is required',
    }),
});
