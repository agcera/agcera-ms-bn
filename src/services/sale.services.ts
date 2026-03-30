import Sale, { PaymentMethodsEnum } from '@database/models/sale';
import SaleMixture from '@database/models/salemixture';
import SaleProduct from '@database/models/saleproduct';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, WhereOptions } from 'sequelize';
import { Op } from 'sequelize';

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

  static DEFAULT_MIXTURE_INCLUDE: IncludeOptions = {
    association: 'mixtures',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
    include: [
      {
        association: 'mixture',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        include: [
          {
            association: 'items',
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
              {
                association: 'product',
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                include: [
                  {
                    association: 'variations',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  static DEFAULT_CLIENT_INCLUDE: IncludeOptions = {
    association: 'client',
    required: true,
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  };

  static async getAllSales(queryData: GetAllRequestQuery, where?: WhereOptions<Sale>, includes?: IncludeOptions[]) {
    const include: IncludeOptions[] = [
      this.DEFAULT_STORE_INCLUDE,
      this.DEFAULT_PRODUCT_INCLUDE,
      this.DEFAULT_MIXTURE_INCLUDE,
      ...(includes || []),
      ...(queryData.clientPhone
        ? [
            {
              association: 'client',
              required: true,
              where: { phone: { [Op.like]: `%${queryData.clientPhone}%` } },
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            },
          ]
        : []),
    ].filter(Boolean);

    const { count, rows } = await Sale.findAndCountAll(
      findQueryGenerators(Sale.getAttributes(), queryData, { where, include })
    );

    return { total: count, sales: rows };
  }

  static async getOneSale(where: WhereOptions, includes?: IncludeOptions[]) {
    const include: IncludeOptions[] = [
      this.DEFAULT_STORE_INCLUDE,
      this.DEFAULT_PRODUCT_INCLUDE,
      this.DEFAULT_MIXTURE_INCLUDE,
      ...(includes || []),
    ];

    return Sale.findOne({ where, include });
  }

  static async createSale(
    variations: { [key: string]: number },
    mixtures: { [key: string]: number },
    paymentMethod: PaymentMethodsEnum,
    clientId: string,
    storeId: string,
    doneOne?: Date
  ) {
    const sale = await Sale.create({ paymentMethod, clientId, storeId, createdAt: doneOne ? doneOne : new Date() });

    if (!sale) {
      throw new Error('Error creating sale');
    }
    await Promise.all([
      ...Object.entries(variations || {}).map(([variationId, quantity]) =>
        SaleProduct.create({ saleId: sale.id, variationId, quantity })
      ),
      ...Object.entries(mixtures || {}).map(([mixtureId, quantity]) =>
        SaleMixture.create({ saleId: sale.id, mixtureId, quantity })
      ),
    ]);
    // const variationIds = Object.keys(variations || {});
    // for (let i = 0; i < variationIds.length; i++) {
    //   const variationId = variationIds[i];
    //   const quantity = variations[variationId];
    //   await SaleProduct.create({ saleId: sale.id, variationId, quantity });
    // }
    // const mixtureIds = Object.keys(mixtures || {});
    // for (let i = 0; i < mixtureIds.length; i++) {
    //   const mixtureId = mixtureIds[i];
    //   const quantity = mixtures[mixtureId];
    //   await SaleMixture.create({ saleId: sale.id, mixtureId, quantity });
    // }
    // Reload the sale with the products
    return await sale.reload({ include: [this.DEFAULT_PRODUCT_INCLUDE, this.DEFAULT_MIXTURE_INCLUDE] });
  }

  static async bulkUpdateSale(where: WhereOptions, updateData: Partial<Sale>) {
    const [count] = await Sale.update(updateData, { where });
    return [count];
  }
}

export default SaleServices;
