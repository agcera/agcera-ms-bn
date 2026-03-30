import Mixture from '@database/models/mixture';
import MixtureItem from '@database/models/mixtureitem';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, WhereOptions } from 'sequelize';

export default class MixtureServices {
  static DEFAULT_ITEMS_INCLUDE: IncludeOptions = {
    association: 'items',
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    include: [{ association: 'product', attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] } }],
  };

  static DEFAULT_INCLUDES: IncludeOptions[] = [this.DEFAULT_ITEMS_INCLUDE];

  static async getAllMixtures(queryData?: GetAllRequestQuery, where?: WhereOptions, includes?: IncludeOptions[]) {
    const include: IncludeOptions[] = [...this.DEFAULT_INCLUDES, ...(includes ?? [])];
    const { count, rows } = await Mixture.findAndCountAll(
      findQueryGenerators(Mixture.getAttributes(), queryData, { where, include })
    );

    return { total: count, mixtures: rows };
  }

  static async getMixtureByPk(id: string, includes?: IncludeOptions[]) {
    return Mixture.findByPk(id, { include: [...this.DEFAULT_INCLUDES, ...(includes || [])] });
  }

  static async getOneMixture(where?: WhereOptions, includes?: IncludeOptions[]) {
    const include: IncludeOptions[] = [...this.DEFAULT_INCLUDES, ...(includes ?? [])];
    return Mixture.findOne({ where, include });
  }

  static async createMixture(data: any) {
    const { name, items, costPrice, sellingPrice, description, image } = data;

    const mixture = await Mixture.create({ name, costPrice, sellingPrice, description, image: image || undefined });

    if (items?.length) {
      const records = items.map((item: any) => ({ ...item, mixtureId: mixture.id }));
      await MixtureItem.bulkCreate(records);
    }

    await mixture.reload({ include: [this.DEFAULT_ITEMS_INCLUDE] });

    return mixture;
  }

  static async updateMixture(id: string, data: any) {
    const mixture = await Mixture.findByPk(id, { include: [this.DEFAULT_ITEMS_INCLUDE, { association: 'sales' }] });
    if (!mixture) throw new Error('Mixture not found');

    const { name, image, description, costPrice, sellingPrice, items } = data;

    name && (mixture.name = name);
    image && (mixture.image = image);
    description !== undefined && (mixture.description = description ?? mixture.description);
    costPrice !== undefined && (mixture.costPrice = costPrice);
    sellingPrice !== undefined && (mixture.sellingPrice = sellingPrice);

    await mixture.save();

    if (items?.length) {
      await this.replaceItems(id, items);
    }

    await mixture.reload({ include: [this.DEFAULT_ITEMS_INCLUDE] });

    return mixture;
  }

  static async deleteMixture(id: string) {
    const mixture = await Mixture.findByPk(id, {
      include: [this.DEFAULT_ITEMS_INCLUDE, { association: 'sales', attributes: ['id'] }],
    });
    if (!mixture) throw new Error('Mixture not found');
    await mixture.destroy();
    return mixture;
  }

  static async replaceItems(mixtureId: string, items: { productId: string; number: number }[]) {
    await MixtureItem.destroy({ where: { mixtureId } });
    if (!items?.length) return [];
    const records = items.map((item) => ({ ...item, mixtureId }));
    return MixtureItem.bulkCreate(records);
  }
}
