import Sale, { PaymentMethodsEnum } from '@database/models/sale';
import SaleProduct from '@database/models/saleproduct';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, WhereOptions } from 'sequelize';
// import { Op } from 'sequelize'

class SaleServices {
  static DEFAULT_STORE_INCLUDE: IncludeOptions = {
    association: 'store',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  };

  static DEFAULT_PRODUCT_INCLUDE: IncludeOptions = {
    association: 'variations',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
    include: [
      {
        association: 'variation',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }, // Include the 'name'
        include: [
          {
            association: 'product',
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
          },
        ],
      },
    ],
  };

  static async getAllSales(queryData: GetAllRequestQuery, where?: WhereOptions<Sale>, includes?: IncludeOptions[]) {
    const include: IncludeOptions[] = [this.DEFAULT_STORE_INCLUDE, this.DEFAULT_PRODUCT_INCLUDE, ...(includes || [])];

    const { count, rows } = await Sale.findAndCountAll(
      findQueryGenerators(Sale.getAttributes(), queryData, { where, include })
    );
    return { total: count, sales: rows };
  }

  static async getOneSale(where: WhereOptions, includes?: IncludeOptions[]) {
    const include: IncludeOptions[] = [this.DEFAULT_STORE_INCLUDE, this.DEFAULT_PRODUCT_INCLUDE, ...(includes || [])];

    return Sale.findOne({ where, include });
  }

  static async createSale(
    variations: { [key: string]: number },
    paymentMethod: PaymentMethodsEnum,
    clientId: string,
    storeId: string,
    doneOne?: Date
  ) {
    const sale = await Sale.create({ paymentMethod, clientId, storeId, createdAt: doneOne ? doneOne : new Date() });

    if (!sale) {
      throw new Error('Error creating sale');
    }
    const variationIds = Object.keys(variations);
    for (let i = 0; i < variationIds.length; i++) {
      const variationId = variationIds[i];
      const quantity = variations[variationId];
      await SaleProduct.create({ saleId: sale.id, variationId, quantity });
    }
    // Reload the sale with the products
    return await sale.reload({ include: this.DEFAULT_PRODUCT_INCLUDE });
  }

  static async bulkUpdateSale(where: WhereOptions, updateData: Partial<Sale>) {
    const [count] = await Sale.update(updateData, { where });
    return [count];
  }
}

export default SaleServices;
