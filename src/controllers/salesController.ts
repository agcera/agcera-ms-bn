import SaleServices from '@src/services/sale.services';
import StoreServices from '@src/services/store.services';
import UserService from '@src/services/user.services';
import { ExtendedRequest } from '@src/types/common.types';
import { ClientTypesEnum } from '@src/types/user.types';
import { type Response } from 'express';
import { IncludeOptions, WhereOptions } from 'sequelize';
import { BaseController } from '.';
import Variation from '@database/models/variation';
import StoreProduct from '@database/models/storeproduct';

class SalesController extends BaseController {
  async getAllSales(req: ExtendedRequest, res: Response): Promise<Response> {
    const { role: userRole, id: userId } = req.user!;
    const { search, limit, skip, sort } = req.query;

    const where: WhereOptions = {};
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

    const { sales, total } = await SaleServices.getAllSales({ search, limit, skip, sort }, where, include);

    return res.status(200).json({
      status: 200,
      data: { sales, total },
    });
  }

  async getOneSale(req: ExtendedRequest, res: Response): Promise<Response> {
    const { role: userRole, id: userId } = req.user!;
    const { id } = req.params;

    const include: IncludeOptions = {
      association: 'store',
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      include: [
        {
          association: 'users',
          required: false,
          where: { id: userId },
          attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
        },
      ],
    };
    const sale = await SaleServices.getOneSale({ id }, [include]);

    if ((userRole === 'user' && sale?.clientId !== userId) || (userRole === 'keeper' && sale?.store?.id !== userId)) {
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
      message: sale,
    });
  }

  async createSale(req: ExtendedRequest, res: Response): Promise<Response | undefined> {
    const user = req.user!;
    const { variations, paymentMethod, clientId, clientType, storeId } = req.body;

    // Check if the user is allowed to create a sale in the store
    if (user.role === 'keeper' && user.storeId !== storeId) {
      return res.status(403).json({
        status: 403,
        message: 'You are not allowed to create a sale in this store',
      });
    }

    // Check if the store and client exist and can be used
    const include: IncludeOptions[] = [{ association: 'products' }];
    const store = await StoreServices.getStoreById(storeId, include);
    if (!store) {
      return res.status(404).json({
        status: 404,
        message: 'Store with the provided storeId not found',
      });
    }

    //get the client type
    if (clientType === ClientTypesEnum.USER) {
      const client = await UserService.getOneUser({ id: clientId });
      if (!client) {
        return res.status(404).json({
          status: 404,
          message: 'User with the provided clientId not found',
        });
      }
    }

    // if client type a client, check if there is no client with that phone number
    if (clientType === ClientTypesEnum.CLIENT) {
      const client = await UserService.getOneUser({ phone: clientId });
      if (client) {
        return res.status(400).json({
          status: 400,
          message: 'A client with the provided phone number already exists please provide his useId instead',
        });
      }
    }

    // Check if the products exist and are available in the store
    // here we will find the products related to the variations provided
    const chosen_variations = await Variation.findAll({ where: { id: Object.keys(variations) } });

    // check if all variations were found
    if (chosen_variations.length !== Object.keys(variations).length) {
      return res.status(404).json({
        status: 404,
        message: 'some variations chosen are not available',
      });
    }

    const productId_and_variation: any = {};

    for (let i = 0; i < chosen_variations.length; i++) {
      productId_and_variation[chosen_variations[i].id] = chosen_variations[i].productId;
    }

    // return res.send({message: 'we are here', productId_and_variation})
    // check if the products exists in the stores
    const storeProducts = store.products;

    const product_removed: { [key: string]: number } = {};

    for (let i = 0; i < chosen_variations.length; i++) {
      const product = storeProducts?.find((storeProduct) => storeProduct.productId === chosen_variations[i].productId);
      if (!product) {
        return res.status(404).json({
          status: 404,
          message: `Product with id ${chosen_variations[i].productId} related to variation ${chosen_variations[i].id} not found in the store with id ${storeId}`,
        });
      }

      product_removed[product.productId] =
        (product_removed[product.productId] || 0) + variations[chosen_variations[i].id] * chosen_variations[i].number;

      if (product.quantity < product_removed[product.productId]) {
        return res.status(400).json({
          status: 400,
          message: `Requested quantity of product with id ${product.productId} related to ${chosen_variations[i].id} is not available`,
        });
      }
    }

    // Create the sale
    const sale = await SaleServices.createSale(variations, paymentMethod, clientId, clientType, storeId);

    // Update the quantity of the products in the store
    const productsIds = Object.keys(product_removed);

    for (let i = 0; i < productsIds.length; i++) {
      // find the variation related to the product from the chosen variations found before. we can get the variation id from the productId_and_variation object

      await StoreProduct.increment(
        { quantity: -product_removed[productsIds[i]] },
        { where: { storeId, productId: productsIds[i] } }
      );
    }

    return res.status(200).json({
      status: 200,
      message: sale,
    });
  }

  async deleteSale(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;
    const { id } = req.params;

    // Check if the user is allowed to create a sale in the store
    if (user.role === 'keeper' && user.storeId !== id) {
      return res.status(403).json({
        status: 403,
        message: 'You are not allowed to delete this sale',
      });
    }

    const sale = await SaleServices.getOneSale({ id });
    if (!sale) {
      return res.status(404).json({
        status: 404,
        message: 'Sale not found',
      });
    }

    await sale.destroy();

    return res.status(200).json({
      status: 200,
      message: 'Sale deleted successfully',
    });
  }
}

export default SalesController;
