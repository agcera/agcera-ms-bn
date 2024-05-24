import { ExtendedRequest } from '@src/types/common.types';
import { BaseController } from '.';
import { Response } from 'express';
import { Op } from 'sequelize';
import SaleServices from '@src/services/sale.services';
import { reportSchema } from '@src/validation/report.validation';
import { generateFirstDate, generateLastDate } from '@src/utils/generators';
import { UserRolesEnum } from '@src/types/user.types';
import User from '@database/models/user';
import Product from '@database/models/product';
import Store from '@database/models/store';

// now let us get started

class AnalyticsController extends BaseController {
  async getAnalytics(req: ExtendedRequest<any, any, any, any>, res: Response): Promise<Response> {
    const user = req.user!;

    const { error, value } = reportSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
    req.query = value;
    const { from: unformattedFrom, to: unformattedTo, storeId: queryStoreId } = req.query;

    const from = generateFirstDate(new Date(unformattedFrom));
    const to = generateLastDate(new Date(unformattedTo));
    const storeId = user.role === UserRolesEnum.KEEPER ? user.storeId : queryStoreId;

    // get the sales for the given dates
    const { sales } = await SaleServices.getAllSales(
      {},
      {
        ...(storeId && { storeId }),
        createdAt: {
          [Op.gte]: from.toISOString(),
          [Op.lte]: to.toISOString(),
        },
      }
    );

    const { sales: unfilteredSales } = await SaleServices.getAllSales(
      {},
      {
        createdAt: {
          [Op.gte]: from.toISOString(),
          [Op.lte]: to.toISOString(),
        },
      }
    );

    // now for each saleDate in the array we are going to associatite it to total amount in that sale

    // count all users in the users table with the shop id as the one loggedin

    const usersCount = await User.count({ ...(storeId && { storeId }) });
    const productsCount = await Product.count();
    const storeCount = await Store.count();

    const salesByDate = sales.reduce(
      (acc, sale) => {
        const date = sale.createdAt.toISOString();
        acc[date] =
          (acc[date] || 0) +
          sale.variations.reduce((acc, variation) => acc + variation.quantity! * variation.variation.sellingPrice, 0);
        console.log(date, ' and ', acc[date]);
        return acc;
      },
      {} as { [key: string]: number }
    );

    // number of time each product as mentioned in the saleProducts relation (means was sold)
    const productsSold = sales.reduce(
      (acc, sale) => {
        sale.variations.forEach((variation) => {
          acc[variation.variation.product.name] =
            (acc[variation.variation.product.name] || 0) + variation.variation.number * variation.quantity!;
        });
        return acc;
      },
      {} as { [key: string]: number }
    );

    // compute the number of products sold by each shop
    const productsSoldByShops = unfilteredSales.reduce(
      (acc, sale) => {
        const name = sale.store?.name || 'Deleted Store';
        acc[name] =
          (acc[name] || 0) +
          sale.variations.reduce((acc, variation) => acc + variation.quantity! * variation.variation.number, 0);
        return acc;
      },
      {} as { [key: string]: number }
    );

    // calculate the percentage
    const stores = Object.keys(productsSoldByShops);
    const productsSoldByShopsValues = Object.values(productsSoldByShops);
    const sum = productsSoldByShopsValues.reduce((acc, value) => acc + value, 0);
    for (let i = 0; i < stores.length; i++) {
      productsSoldByShops[stores[i]] = (productsSoldByShops[stores[i]] / sum) * 100;
    }

    // get the total sales for the given dates
    return res.status(200).json({
      status: 200,
      data: {
        salesByDate,
        productsSold,
        productsSoldByShops,
        usersCount,
        productsCount,
        storeCount,
      },
    });
  }
}

export default AnalyticsController;
