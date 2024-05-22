import Deleted from '@database/models/deleted';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { IncludeOptions, Model, WhereOptions } from 'sequelize';

class DeletedServices {
  static async getAllDeleted(
    queryData: GetAllRequestQuery,
    where?: WhereOptions<Deleted>,
    includes?: IncludeOptions[]
  ) {
    // get all transactions
    const include: IncludeOptions[] = [...(includes || [])];

    include.push({
      association: 'user',
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt, password'] },
    });
    const deleted = await Deleted.findAll({ where, include });

    return { Deleted: deleted };
  }
}

export default DeletedServices;

export const recordDeleted = async (deletedBy: { name: string; phone: string }, table: string, description: Model) => {
  console.log(description);

  await Deleted.create({
    deletedBy: JSON.stringify(deletedBy),
    description: `{ "${table}" : ${JSON.stringify(description.dataValues)}}`,
    table,
  });
};
