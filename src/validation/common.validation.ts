import { SortDirectionEnum } from '@src/types/common.types';
import { UserRolesEnum } from '@src/types/user.types';
import Joi from 'joi';

export const getAllRequestQuerySchema = Joi.object({
  search: Joi.string(),
  limit: Joi.number().integer().min(1),
  skip: Joi.number().integer().min(0),
  sort: Joi.object().pattern(Joi.string(), Joi.valid(...Object.values(SortDirectionEnum))),
  role: Joi.array()
    .items(Joi.string().valid(...Object.values(UserRolesEnum)))
    .unique()
    .min(1),
});

export const uuidSchema = Joi.object({ id: Joi.string().uuid().required() });
