import Store from '@database/models/store';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, Op, WhereOptions } from 'sequelize';

class StoreServices {
  static DEFAULT_USER_INCLUDES: IncludeOptions = {
    association: 'users',
    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'storeId'] },
  };
  static DEFAULT_PRODUCTS_INCLUDES: IncludeOptions = {
    association: 'products',
    include: [
      {
        association: 'store',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
      {
        association: 'product',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    ],
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  };

  // create store
  static async create(data: any) {
    return await Store.create(data);
  }

  // get all stores
  static async getAllStores(queryData?: GetAllRequestQuery, where?: WhereOptions, include?: IncludeOptions[]) {
    const { count, rows } = await Store.findAndCountAll(
      findQueryGenerators(Store.getAttributes(), queryData, {
        where,
        include,
      })
    );

    return { total: count, stores: rows };
  }

  // get one store
  static async getOneStore(where: WhereOptions, include?: IncludeOptions[]) {
    return await Store.findOne({ where: { name: { [Op.not]: 'expired' }, ...where }, include });
  }

  // get one store
  static async getOneStoreWithExpired(where: WhereOptions, include?: IncludeOptions[]) {
    return await Store.findOne({ where, include });
  }

  // get store by id
  static async getStoreById(
    id: string,
    include: IncludeOptions[] = [
      { ...this.DEFAULT_USER_INCLUDES },
      { ...this.DEFAULT_PRODUCTS_INCLUDES },
      {
        association: 'fromThis',
      },
      { association: 'toThis' },
    ]
  ) {
    return await Store.findByPk(id, { include });
  }

  // update store
  static async updateStore(id: string, data: any) {
    const store = await Store.findByPk(id);

    if (!store) {
      return null;
    }

    store.name = data.name;
  }

  // get all stores by and exclude all relations to return only name and location
  static async getAllStoresNameAndLocation() {
    return await Store.findAll({ where: { name: { [Op.not]: 'expired' } }, attributes: ['id', 'name', 'location'] });
  }

  static async bulkUpdateStores(where: WhereOptions, updateData: Partial<Store>) {
    const [count] = await Store.update(updateData, { where });
    return [count];
  }
}

export default StoreServices;
