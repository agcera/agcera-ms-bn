import Mixture from '@database/models/mixture';
import Sale from '@database/models/sale';
import StoreProduct from '@database/models/storeproduct';
import Variation from '@database/models/variation';
import ClientServices from '@src/services/client.services';
import SaleServices from '@src/services/sale.services';
import StoreServices from '@src/services/store.services';
import { ExtendedRequest } from '@src/types/common.types';
import { ClientTypesEnum, UserRolesEnum } from '@src/types/user.types';
import { type Response } from 'express';
import { IncludeOptions, Op, WhereOptions } from 'sequelize';
import { BaseController } from '.';
// import { recordDeleted } from '@src/services/deleted.services';

const getNeighborSale = async (storeId: string, createdAt: Date, direction: 'prev' | 'next', excludeId?: string) => {
  return Sale.findOne({
    where: {
      storeId,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      createdAt: direction === 'prev' ? { [Op.lt]: createdAt } : { [Op.gt]: createdAt },
    },
    order: [['createdAt', direction === 'prev' ? 'DESC' : 'ASC']],
  });
};

const isInCollectedRange = async (storeId: string, createdAt: Date, excludeId?: string) => {
  const [prev, next] = await Promise.all([
    getNeighborSale(storeId, createdAt, 'prev', excludeId),
    getNeighborSale(storeId, createdAt, 'next', excludeId),
  ]);

  return Boolean(prev?.checkedAt && next?.checkedAt);
};

class SalesController extends BaseController {
  async getAllSales(req: ExtendedRequest, res: Response): Promise<Response> {
    const { role: userRole, id: userId } = req.user!;
    const { storeId } = req.query;

    const where: WhereOptions = storeId ? { storeId } : {};
    const include: IncludeOptions[] = [];

    switch (userRole) {
      case 'user':
        where['clientId'] = userId;
        where['clientType'] = ClientTypesEnum.USER;
        break;
      case 'keeper':
        include.push({
          association: 'store',
          required: true,
          include: [
            {
              association: 'users',
              where: { id: userId },
              required: true,
              attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
            },
          ],
        });
        break;
      case 'admin':
        break;
    }

    const { sales, total } = await SaleServices.getAllSales(req.query, where, include);

    return res.status(200).json({
      status: 200,
      data: { sales, total },
    });
  }

  async getOneSale(req: ExtendedRequest, res: Response): Promise<Response> {
    const { role: userRole, id: userId, storeId } = req.user!;
    const { id } = req.params;

    const include: IncludeOptions[] = [
      {
        association: 'store',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
      {
        association: 'client',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    ];
    const sale = await SaleServices.getOneSale({ id }, [...include]);

    if ((userRole === 'user' && sale?.clientId !== userId) || (userRole === 'keeper' && sale?.store.id !== storeId)) {
      return res.status(403).json({
        status: 403,
        message: 'You are not allowed to view this sale or sale does not exist',
      });
    }
    if (!sale) {
      return res.status(404).json({
        status: 404,
        message: 'Sale not found',
      });
    }

    return res.status(200).json({
      status: 200,
      data: sale,
    });
  }

  async createSale(req: ExtendedRequest, res: Response): Promise<Response | undefined> {
    const user = req.user!;
    const { variations = {}, mixtures = {}, paymentMethod, storeId, clientName, phone, isMember, doneOn } = req.body;

    if (!Object.keys(variations).length && !Object.keys(mixtures).length) {
      return res.status(400).json({
        status: 400,
        message: 'Please select at least one product or mixture',
      });
    }

    if (user.role === UserRolesEnum.KEEPER && user.storeId !== storeId) {
      return res.status(403).json({
        status: 403,
        message: 'You are not allowed to create a sale in this store',
      });
    }

    const store = await StoreServices.getStoreById(storeId, [
      { association: 'products', include: [{ association: 'product', attributes: ['id', 'name'] }] },
    ]);
    if (!store) {
      return res.status(404).json({
        status: 404,
        message: 'Store with the provided storeId not found',
      });
    }

    const saleDate = doneOn ? new Date(doneOn) : new Date();
    const collectedRange = await isInCollectedRange(storeId, saleDate);
    if (collectedRange) {
      return res.status(400).json({
        status: 400,
        message: 'Cannot create a sale in a collected time range for this payment method',
      });
    }

    let client = await ClientServices.getClientsByPhone(phone);
    if (!client) {
      client = await ClientServices.createClient(clientName, phone, isMember);
    }

    const variationIds = Object.keys(variations || {});
    const mixtureIds = Object.keys(mixtures || {});

    const chosenVariations = await Variation.findAll({ where: { id: variationIds } });
    if (chosenVariations.length !== variationIds.length) {
      return res.status(404).json({
        status: 404,
        message: 'some variations chosen are not available',
      });
    }

    const chosenMixtures = await Mixture.findAll({
      where: { id: mixtureIds },
      include: [{ association: 'items' }],
    });
    if (chosenMixtures.length !== mixtureIds.length) {
      return res.status(404).json({
        status: 404,
        message: 'some mixtures chosen are not available',
      });
    }

    const storeProducts = store.products;
    const productRemoved: { [key: string]: number } = {};

    for (let i = 0; i < chosenVariations.length; i++) {
      const product = storeProducts?.find((storeProduct) => storeProduct.productId === chosenVariations[i].productId);
      if (!product) {
        return res.status(404).json({
          status: 404,
          message: `Product with id ${chosenVariations[i].productId} related to variation ${chosenVariations[i].id} not found in the store with id ${storeId}`,
        });
      }

      productRemoved[product.productId] =
        (productRemoved[product.productId] || 0) + variations[chosenVariations[i].id] * chosenVariations[i].number;

      if (product.quantity < productRemoved[product.productId]) {
        return res.status(400).json({
          status: 400,
          message: `Requested quantity of ${product.product.name} related to ${chosenVariations[i].name} is not available`,
        });
      }
    }

    if (chosenMixtures.length) {
      for (let i = 0; i < chosenMixtures.length; i++) {
        const mixture = chosenMixtures[i];
        const mixtureQuantity = mixtures[mixture.id] || 0;
        const items = mixture.items || [];

        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          const product = storeProducts?.find((storeProduct) => storeProduct.productId === item.productId);
          if (!product) {
            return res.status(404).json({
              status: 404,
              message: `Product with id ${item.productId} related to mixture ${mixture.id} not found in the store with id ${storeId}`,
            });
          }

          const removed = mixtureQuantity * item.number;
          productRemoved[product.productId] = (productRemoved[product.productId] || 0) + removed;

          if (product.quantity < productRemoved[product.productId]) {
            return res.status(400).json({
              status: 400,
              message: `Requested quantity of ${product.product?.name || item.productId} related to mixture ${mixture.name} is not available`,
            });
          }
        }
      }
    }

    const sale = await SaleServices.createSale(variations, mixtures, paymentMethod, client.id, storeId, doneOn);

    const productsIds = Object.keys(productRemoved);
    for (let i = 0; i < productsIds.length; i++) {
      await StoreProduct.increment(
        { quantity: -productRemoved[productsIds[i]] },
        { where: { storeId, productId: productsIds[i] } }
      );
    }

    return res.status(200).json({
      status: 200,
      data: sale,
    });
  }

  async refundSale(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;
    const { id } = req.params;
    const sale = await SaleServices.getOneSale({ id });
    if (!sale) {
      return res.status(404).json({
        status: 404,
        message: 'Sale not found',
      });
    }

    if (user.role !== UserRolesEnum.ADMIN && user.storeId !== sale.storeId) {
      return res.status(403).json({
        status: 403,
        message: 'You can only delete sales of your store',
      });
    }

    // Keep track of the products to be added back to the store after refunding the sale
    const productsNumbers: { [key: string]: number } = {};

    (sale.variations || []).forEach((variation) => {
      const product = variation.variation.productId;
      productsNumbers[product] = (productsNumbers[product] || 0) + variation.quantity! * variation.variation.number;
    });

    const saleMixtures = sale.mixtures || [];
    if (saleMixtures.length) {
      const mixtureIds = saleMixtures.map((mixture) => mixture.mixtureId);
      const mixtures = await Mixture.findAll({ where: { id: mixtureIds }, include: [{ association: 'items' }] });
      const mixturesById = new Map(mixtures.map((mixture) => [mixture.id, mixture]));

      saleMixtures.forEach((saleMixture) => {
        const mixture = mixturesById.get(saleMixture.mixtureId);
        if (!mixture?.items?.length) return;
        mixture.items.forEach((item) => {
          productsNumbers[item.productId] = (productsNumbers[item.productId] || 0) + saleMixture.quantity * item.number;
        });
      });
    }

    const productsIds = Object.keys(productsNumbers);
    for (let i = 0; i < productsIds.length; i++) {
      await StoreProduct.increment(
        { quantity: productsNumbers[productsIds[i]] },
        { where: { storeId: sale.storeId, productId: productsIds[i] } }
      );
    }

    sale.refundedAt = new Date();
    await sale.save();

    // record the deleted sale
    // await recordDeleted({name: user.name, phone: user.phone}, 'sale', sale);

    return res.status(200).json({
      status: 200,
      message: {
        sale,
        productsNumbers,
      },
    });
  }
}

export default SalesController;
