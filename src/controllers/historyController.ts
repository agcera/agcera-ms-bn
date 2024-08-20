import HistoryServices from '@src/services/history.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Response } from 'express';
import { IncludeOptions, Op, WhereOptions } from 'sequelize';
import { BaseController } from '.';
import Deleted from '@database/models/deleted';

class HistoryController extends BaseController {
  async getAllDeleted(req: ExtendedRequest, res: Response) {
    const { role: userRole } = req.user!;

    const { search, limit, skip, sort } = req.query;

    // only the admin is allowed to view all deleted items
    if (userRole !== 'admin') {
      return res.status(403).json({
        status: 403,
        error: 'You are not authorized to view deleted items',
      });
    }

    const { Deleted: deletedItems, total } = await HistoryServices.getAllDeleted({ search, skip, sort, limit }, {});

    return res.status(200).json({
      status: 200,
      data: {
        deletedItems,
        total,
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

  // MOVEMENTS
  // get all movements
  async getProductsMovements(req: ExtendedRequest, res: Response) {
    const { role: userRole } = req.user!;

    const { storeId } = req.query;
    const { search, limit, skip, sort } = req.query;

    // add the where option in all the stores where from or to is contains the storeId
    const WhereOptions: WhereOptions = storeId ? { [Op.or]: [{ to: storeId }, { from: storeId }] } : {};

    const include: IncludeOptions[] = [];

    if (userRole != 'admin') {
      return res.status(400).json({
        status: 400,
        message: 'you are not authorized to view this',
      });
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
      { search, limit, skip, sort, storeId },
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
