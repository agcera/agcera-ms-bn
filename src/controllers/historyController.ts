import HistoryServices from '@src/services/history.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Response } from 'express';
import { IncludeOptions, WhereOptions } from 'sequelize';
import { BaseController } from '.';

class HistoryController extends BaseController {
  async getAllDeleted(req: ExtendedRequest, res: Response) {
    const { role: userRole, storeId } = req.user!;

    const { search, limit, skip, sort } = req.query;

    const WhereOptions: WhereOptions = {};
    const include: IncludeOptions[] = [];

    switch (userRole) {
      case 'keeper':
        WhereOptions['storeId'] = storeId;
        break;
      case 'admin':
        break;
    }

    const { total, Deleted: deletedItems } = await HistoryServices.getAllDeleted(
      { search, limit, skip, sort },
      WhereOptions,
      include
    );

    return res.status(200).json({
      status: 200,
      data: {
        deletedItems,
        total,
      },
    });
  }

  // get all movements
  async getProductsMovements(req: ExtendedRequest, res: Response) {
    const { role: userRole, storeId } = req.user!;

    const { search, limit, skip, sort } = req.query;

    const WhereOptions: WhereOptions = {};
    const include: IncludeOptions[] = [];

    switch (userRole) {
      case 'keeper':
        WhereOptions['to'] = storeId;
        WhereOptions['from'] = storeId;
        break;
      case 'admin':
        break;
    }

    include.push(
      {
        association: 'product',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
      {
        association: 'storeFrom',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
      {
        association: 'storeTo',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
      {
        association: 'user',
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
      }
    );

    const { total, movements } = await HistoryServices.getAllMovemets(
      { search, limit, skip, sort },
      WhereOptions,
      include
    );

    return res.status(200).json({
      status: 200,
      data: {
        movements,
        total,
      },
    });
  }
}

export default new HistoryController();
