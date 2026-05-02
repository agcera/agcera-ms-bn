import Combo from '@database/models/combo';
import ComboItem from '@database/models/comboitem';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, WhereOptions } from 'sequelize';

export default class ComboServices {
  static DEFAULT_ITEMS_INCLUDE: IncludeOptions = {
    association: 'items',
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    include: [{ association: 'product', attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] } }],
  };

  static DEFAULT_INCLUDES: IncludeOptions[] = [this.DEFAULT_ITEMS_INCLUDE];

  static async getAllCombos(
    queryData?: GetAllRequestQuery,
    where?: WhereOptions,
    includes?: IncludeOptions[],
    isAdmin?: boolean
  ) {
    const include: IncludeOptions[] = [...this.DEFAULT_INCLUDES, ...(includes ?? [])];
    const { count, rows } = await Combo.findAndCountAll(
      findQueryGenerators(Combo.getAttributes(), queryData, {
        where,
        include,
        attributes: { exclude: !isAdmin ? ['costPrice'] : [] },
      })
    );

    return { total: count, combos: rows };
  }

  static async getComboByPk(id: string, includes?: IncludeOptions[], isAdmin?: boolean) {
    return Combo.findByPk(id, {
      include: [...this.DEFAULT_INCLUDES, ...(includes || [])],
      attributes: { exclude: !isAdmin ? ['costPrice'] : [] },
    });
  }

  static async getOneCombo(where?: WhereOptions, includes?: IncludeOptions[], isAdmin?: boolean) {
    const include: IncludeOptions[] = [...this.DEFAULT_INCLUDES, ...(includes ?? [])];
    return Combo.findOne({ where, include, attributes: { exclude: !isAdmin ? ['costPrice'] : [] } });
  }

  static async createCombo(data: any) {
    const { name, items, costPrice, sellingPrice, description, image } = data;

    const combo = await Combo.create({ name, costPrice, sellingPrice, description, image: image || undefined });

    if (items?.length) {
      const records = items.map((item: any) => ({ ...item, comboId: combo.id }));
      await ComboItem.bulkCreate(records);
    }

    await combo.reload({ include: [this.DEFAULT_ITEMS_INCLUDE] });

    return combo;
  }

  static async updateCombo(id: string, data: any) {
    const combo = await Combo.findByPk(id, { include: [this.DEFAULT_ITEMS_INCLUDE, { association: 'sales' }] });
    if (!combo) throw new Error('Combo not found');

    const { name, image, description, costPrice, sellingPrice, items } = data;

    name && (combo.name = name);
    image && (combo.image = image);
    description !== undefined && (combo.description = description ?? combo.description);
    costPrice !== undefined && (combo.costPrice = costPrice);
    sellingPrice !== undefined && (combo.sellingPrice = sellingPrice);

    await combo.save();

    if (items?.length) {
      await this.replaceItems(id, items);
    }

    await combo.reload({ include: [this.DEFAULT_ITEMS_INCLUDE] });

    return combo;
  }

  static async deleteCombo(id: string) {
    const combo = await Combo.findByPk(id, {
      include: [this.DEFAULT_ITEMS_INCLUDE, { association: 'sales', attributes: ['id'] }],
    });
    if (!combo) throw new Error('Combo not found');
    await combo.destroy();
    return combo;
  }

  static async replaceItems(comboId: string, items: { productId: string; number: number }[]) {
    await ComboItem.destroy({ where: { comboId } });
    if (!items?.length) return [];
    const records = items.map((item) => ({ ...item, comboId }));
    return ComboItem.bulkCreate(records);
  }
}
