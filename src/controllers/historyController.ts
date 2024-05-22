import HistoryServices from '@src/services/history.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Response } from 'express';
import { IncludeOptions, WhereOptions } from 'sequelize';
import { BaseController } from '.';
import Deleted from '@database/models/deleted';
import DeletedServices from '@src/services/deleted.services';

class HistoryController extends BaseController {
  async getAllDeleted(req: ExtendedRequest, res: Response) {
    const { role: userRole } = req.user!;

    const { search, limit, skip, sort } = req.query;

    const WhereOptions: WhereOptions = {};
    // const include: IncludeOptions[] = [{association: 'user', attributes: ['name', 'email', 'phone']}];

    switch (userRole) {
      case 'keeper' || 'user':
        WhereOptions['userId'] = req.user!.id;
        break;
      case 'admin':
        break;
    }

    const { Deleted: deletedItems } = await DeletedServices.getAllDeleted({ search, limit, skip, sort }, WhereOptions);

    console.log(deletedItems[0]);

    return res.status(200).json({
      status: 200,
      data: {
        deletedItems,
      },
    });
  }

  async getDeletedItemById(req: ExtendedRequest, res: Response) {
    const { id } = req.params;
    const { role: userRole } = req.user!;

    const deletedItem = await Deleted.findByPk(id);

    // if the user is not admin, he should only view stuffs related to his user id
    if (!deletedItem) {
      return res.status(404).json({
        status: 404,
        error: 'Deleted item not found',
      });
    }

    if (userRole !== 'admin') {
      return res.status(403).json({
        status: 403,
        error: 'You are not authorized to view this item',
      });
    }

    return res.status(200).json({
      status: 200,
      data: {
        deletedItem,
      },
    });
  }

  async clearDeteteds(req: ExtendedRequest, res: Response) {
    // delete all deleted items
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        error: 'You are not authorized to perform this action',
      });
    }

    await Deleted.destroy({ where: {} });

    return res.status(200).json({
      status: 200,
      message: 'All deleted items have been cleared',
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
