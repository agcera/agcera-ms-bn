import DeletedServices from '@src/services/deleted.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Response } from 'express';
import { IncludeOptions, WhereOptions } from 'sequelize';
import { BaseController } from '.';

class DeletedController extends BaseController {
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

    const { total, Deleted: deletedItems } = await DeletedServices.getAllDeleted(
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
}

export default new DeletedController();
