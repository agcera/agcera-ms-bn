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
      required: true,
    });
    const deleted = await Deleted.findAll({ where, include });

    return { Deleted: deleted };
  }
}

export default DeletedServices;

export const recordDeleted = async (userId: string, table: string, description: Model) => {
  console.log(description);

  await Deleted.create({ userId, description: JSON.stringify(`{${description.dataValues}}`), table });
};
