import Deleted from '@database/models/deleted';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, Model, WhereOptions } from 'sequelize';

class DeletedServices {
  static async getAllDeleted(
    queryData: GetAllRequestQuery,
    where?: WhereOptions<Deleted>,
    includes?: IncludeOptions[]
  ) {
    // get all transactions
    const include: IncludeOptions[] = [...(includes || [])];

    const { count, rows } = await Deleted.findAndCountAll(
      findQueryGenerators(Deleted.getAttributes(), queryData, { where, include })
    );

    return { total: count, Deleted: rows };
  }
}

export default DeletedServices;

export const recordDeleted = async (userId: string, table: string, description: Model) => {
  await Deleted.create({ userId, description: JSON.stringify(description.dataValues), table });
};
