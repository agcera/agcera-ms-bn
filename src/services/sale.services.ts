import Sale from '@database/models/sale';
import { PaymentMethodsEnum } from '@database/models/paymentMethods';
import SaleMixture from '@database/models/salemixture';
import SalePayment from '@database/models/salepayment';
import SaleProduct from '@database/models/saleproduct';
import sequelize from '@database/connection';
import { CreateSalePayment, CreateSaleRequest, GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, WhereOptions } from 'sequelize';
import { Op } from 'sequelize';

class SaleServices {
  static DEFAULT_STORE_INCLUDE: IncludeOptions = {
    association: 'store',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  };

  static buildProductInclude(isAdmin: boolean): IncludeOptions {
    return {
      association: 'variations',
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      include: [
        {
          association: 'variation',
          attributes: { exclude: !isAdmin ? ['createdAt', 'updatedAt', 'deletedAt', 'costPrice'] : ['createdAt', 'updatedAt', 'deletedAt'] },
          include: [
            {
              association: 'product',
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            },
          ],
        },
      ],
    };
  }

  static buildMixtureInclude(isAdmin: boolean): IncludeOptions {
    return {
      association: 'mixtures',
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      include: [
        {
          association: 'mixture',
          attributes: { exclude: !isAdmin ? ['createdAt', 'updatedAt', 'deletedAt', 'costPrice'] : ['createdAt', 'updatedAt', 'deletedAt'] },
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
                      attributes: { exclude: !isAdmin ? ['createdAt', 'updatedAt', 'deletedAt', 'costPrice'] : ['createdAt', 'updatedAt', 'deletedAt'] },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  static DEFAULT_CLIENT_INCLUDE: IncludeOptions = {
    association: 'client',
    required: true,
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  };

  static DEFAULT_PAYMENTS_INCLUDE: IncludeOptions = {
    association: 'payments',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  };

  static async getAllSales(
    queryData: GetAllRequestQuery,
    where?: WhereOptions<Sale>,
    includes?: IncludeOptions[],
    isAdmin = false
  ) {
    const include: IncludeOptions[] = [
      this.DEFAULT_STORE_INCLUDE,
      this.buildProductInclude(isAdmin),
      this.buildMixtureInclude(isAdmin),
      this.DEFAULT_PAYMENTS_INCLUDE,
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

  static async getOneSale(where: WhereOptions, includes?: IncludeOptions[], isAdmin = false) {
    const include: IncludeOptions[] = [
      this.DEFAULT_STORE_INCLUDE,
      this.buildProductInclude(isAdmin),
      this.buildMixtureInclude(isAdmin),
      this.DEFAULT_PAYMENTS_INCLUDE,
      ...(includes || []),
    ];

    return Sale.findOne({ where, include });
  }

  static async createSale(
    params: Omit<CreateSaleRequest, 'clientName' | 'phone' | 'isMember'> & { clientId: string },
    isAdmin = false
  ) {
    const { variations, mixtures, payments, clientId, storeId, doneOn } = params;
    return sequelize.transaction(async (transaction) => {
      const sale = await Sale.create({ clientId, storeId, createdAt: doneOn || new Date() }, { transaction });

      if (!sale) {
        throw new Error('Error creating sale');
      }

      await Promise.all([
        ...Object.entries(variations || {}).map(([variationId, quantity]) =>
          SaleProduct.create({ saleId: sale.id, variationId, quantity }, { transaction })
        ),
        ...Object.entries(mixtures || {}).map(([mixtureId, quantity]) =>
          SaleMixture.create({ saleId: sale.id, mixtureId, quantity }, { transaction })
        ),
        ...payments.map(({ paymentMethod, amount }) =>
          SalePayment.create({ saleId: sale.id, paymentMethod, amount }, { transaction })
        ),
      ]);

      return await sale.reload({
        transaction,
        include: [this.buildProductInclude(isAdmin), this.buildMixtureInclude(isAdmin), this.DEFAULT_PAYMENTS_INCLUDE],
      });
    });
  }

  static async bulkUpdateSale(where: WhereOptions, updateData: Partial<Sale>) {
    const [count] = await Sale.update(updateData, { where });
    return [count];
  }
}

export default SaleServices;
