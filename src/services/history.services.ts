import Deleted from '@database/models/deleted';
import ProductsMovement from '@database/models/productsmovement';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, Model, WhereOptions } from 'sequelize';

class HistoryServices {
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
  static async getAllMovemets(
    queryData: GetAllRequestQuery,
    where?: WhereOptions<Deleted>,
    includes?: IncludeOptions[]
  ) {
    // get all transactions
    const include: IncludeOptions[] = [...(includes || [])];

    const { count, rows } = await ProductsMovement.findAndCountAll(
      findQueryGenerators(ProductsMovement.getAttributes(), queryData, { where, include })
    );

    return { total: count, movements: rows };
  }
}

export default HistoryServices;

// RECORD DELETED ITEM

export const recordDeleted = async (deletedBy: { name: string; phone: string }, table: string, description: Model) => {
  console.log(description);

  await Deleted.create({
    deletedBy: JSON.stringify(deletedBy),
    description: `{ "${table}" : ${JSON.stringify(description.dataValues)}}`,
    table,
  });
};
