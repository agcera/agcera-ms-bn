/* eslint-disable @typescript-eslint/naming-convention */
import { UserGendersEnum, UserRolesEnum } from '@src/types/user.types';
import joi from 'joi';

export const phoneSchema = joi.object({
  phone: joi
    .string()
    .pattern(/^\+\d{12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number that starts with + and have 12 digits',
      'string.empty': 'Phone number cannot be empty',
      'any.required': 'Phone number is a required field',
    }),
});

export const passwordSchema = joi.object({
  password: joi.string().min(4).required(),
});

// The schema for registering a user
export const userRegisterSchema = joi.object({
  name: joi.string().required().messages({
    'string.pattern.base': 'Provide at least two names',
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is a required field',
  }),
  password: joi.string().min(4).required(),
  email: joi.string().pattern(new RegExp('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$')).messages({
    'string.pattern.base': 'Please provide a valid Email',
    'string.empty': 'Email cannot be empty',
  }),
  phone: joi
    .string()
    .pattern(/^\+\d{12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number that starts with + and have 12 digits',
      'string.empty': 'Phone number cannot be empty',
      'any.required': 'Phone number is a required field',
    }),
  storeId: joi.string().required(),
  role: joi.string().valid(...Object.values(UserRolesEnum)),
  gender: joi.string().valid(...Object.values(UserGendersEnum)),
  location: joi.string(),
});

// make the same sehcma for updating a user but the fields are not required
export const userUpdateSchema = joi
  .object({
    name: joi.string().messages({
      'string.pattern.base': 'Provide at least two names',
      'string.empty': 'Name cannot be empty',
      'any.required': 'Name is a required field',
    }),
    email: joi.string().pattern(new RegExp('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$')).messages({
      'string.pattern.base': 'Please provide a valid Email',
      'string.empty': 'Email cannot be empty',
    }),
    phone: joi
      .string()
      .pattern(/^\+\d{12}$/)
      .messages({
        'string.pattern.base': 'Please provide a valid phone number that starts with + and have 12 digits',
        'string.empty': 'Phone number cannot be empty',
        'any.required': 'Phone number is a required field',
      }),
    storeId: joi.string(),
    gender: joi.string().valid(...Object.values(UserGendersEnum)),
    location: joi.string(),
  })
  .unknown();

// The schema for login
export const userLoginSchema = joi
  .object({
    phone: joi.string().required().messages({
      'any.required': 'Please Enter a valid phone number',
    }),
    password: joi.string().required().messages({
      'any.required': 'Please Enter password',
    }),
  })
  .unknown();
