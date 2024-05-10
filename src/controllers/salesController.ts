import SaleServices from '@src/services/sale.services';
import StoreServices from '@src/services/store.services';
import UserService from '@src/services/user.services';
import { ExtendedRequest } from '@src/types/common.types';
import { ClientTypesEnum, UserRolesEnum } from '@src/types/user.types';
import { type Response } from 'express';
import { IncludeOptions, Op, WhereOptions } from 'sequelize';
import { BaseController } from '.';
import Variation from '@database/models/variation';

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
      message: { sales, total },
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

    if (
      (userRole === 'user' && sale?.clientId !== userId) ||
      (userRole === 'keeper' && !sale?.store.users?.find((user) => user.id === userId))
    ) {
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
    const client = await UserService.getOneUser({
      [Op.or]: [{ id: clientId }, { phone: clientId }],
      role: UserRolesEnum.USER,
    });
    if (clientType === ClientTypesEnum.USER && !client) {
      return res.status(404).json({
        status: 404,
        message: 'User with the provided clientId not found',
      });
    }
    if (clientType === ClientTypesEnum.CLIENT && client) {
      return res.status(400).json({
        status: 400,
        message:
          'There exist already a user with the provided phone number as clientId, please use his clientId instead',
      });
    }

    // Check if the products exist and are available in the store
    // here we will find the products related to the variations provided
    const chosen_variations = await Variation.findAll({ where: { id: Object.keys(variations) } });

    // check if all variations were found
    if (chosen_variations.length !== Object.keys(variations).length) {
      return res.status(404).json({
        status: 404,
        message: 'Some of the variations were not found',
      });
    }

    const productId_and_variation: any = {};

    for (let i = 0; i < chosen_variations.length; i++) {
      productId_and_variation[chosen_variations[i].productId] = chosen_variations[i].id;
    }

    // console.log(productId_and_variation['123e4567-e89b-12d3-a456-426614174001'])

    // return res.send({message: 'we are here', productId_and_variation})
    // check if the products exists in the stores

    const storeProducts = store.products;
    const productsIds = Object.keys(productId_and_variation);
    console.log(productsIds);
    for (let i = 0; i < productsIds.length; i++) {
      const product = storeProducts?.find((storeProduct) => storeProduct.productId === productsIds[i]);

      if (!product) {
        return res.status(404).json({
          status: 404,
          message: `Product with id ${productsIds[i]} related to variation ${productId_and_variation[productsIds[i]]} not found in the store with id ${storeId}`,
        });
      }
      console.log(product.quantity < variations[productId_and_variation[productsIds[i]]]);
      if (product.quantity < variations[productId_and_variation[productsIds[i]]]) {
        return res.status(400).json({
          status: 400,
          message: `Requested quantity of product with id ${productsIds[i]} related to ${productId_and_variation[productsIds[i]]} is not available`,
        });
      }

      console.log('round ', i);
    }

    // Create the sale
    const sale = await SaleServices.createSale(variations, paymentMethod, clientId, clientType, storeId);

    // Update the quantity of the products in the store
    for (let i = 0; i < productsIds.length; i++) {
      const product = storeProducts?.find((storeProduct) => storeProduct.productId === productsIds[i]);
      product!.quantity -= variations[productId_and_variation[productsIds[i]]];
      await product!.save();
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
