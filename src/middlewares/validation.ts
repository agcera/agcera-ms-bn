import ProductServices from '@src/services/product.services';
import { ExtendedRequest } from '@src/types/common.types';
import { formatRoleQuery, formatSortQuery } from '@src/utils/formatters';
import { getAllRequestQuerySchema, uuidSchema } from '@src/validation/common.validation';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BaseMiddleware } from '.';

export class ValidationMiddleware extends BaseMiddleware {
  idFields?: string[];
  schema?: Joi.Schema;

  constructor({ idFields, schema }: { idFields?: string[]; schema?: Joi.Schema } = {}) {
    super();
    this.idFields = idFields;
    this.schema = schema;
  }

  validate = (req: Request, res: Response, next: NextFunction) => {
    if (!this.schema) return next('validation schema required');
    const { error, value } = this.schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
    req.body = value;
    return next();
  };

  validateProductExist = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const product = await ProductServices.getProductByPk(productId);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: `Product with id ${productId}, not found`,
      });
    }

    (req as ExtendedRequest).product = product;
    return next();
  };

  validateQueries = (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/report')) return next();
    if (req.path.startsWith('/analytics')) return next();
    const { sort, role } = req.query;

    // Run below code if atleast one of the query parameters is present
    if (Object.keys(req.query).length > 0) {
      try {
        if (sort && typeof sort === 'string') req.query.sort = formatSortQuery(sort);
        if (role && typeof role === 'string') req.query.role = formatRoleQuery(role);
      } catch (error: any) {
        return res.status(400).json({
          status: 'fail',
          message: error.message,
        });
      }

      const { error, value } = getAllRequestQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          status: 'fail',
          message: error.message,
        });
      }
      req.query = value;
    }

    return next();
  };

  validateParams = (req: Request, res: Response, next: NextFunction) => {
    if (!this.idFields) return next('Id fields required for validateParams method');
    for (let i = 0; i <= this.idFields.length; i++) {
      const idField = this.idFields[i];
      const id = req.params[idField];

      if (id) {
        // validate the id parameter
        const { error, value } = uuidSchema.validate({ id });
        if (error) {
          return res.status(400).json({
            status: 'fail',
            message: error.message,
          });
        }
        req.params[idField] = value.id;
      }
    }

    // Other parameters validation

    return next();
  };
}

const validationMiddleware = new ValidationMiddleware();

export const validate = (schema: Joi.Schema) => new ValidationMiddleware({ schema }).validate;
export const validateProductExist = validationMiddleware.validateProductExist;
export const validateQueries = validationMiddleware.validateQueries;
export const validateParams = (idFields: string[] = ['id']) => new ValidationMiddleware({ idFields }).validateParams;
