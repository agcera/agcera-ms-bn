import ProductServices from '@src/services/product.services';
import SaleServices from '@src/services/sale.services';
import StoreServices from '@src/services/store.services';
import TransactionServices from '@src/services/transaction.services';
import { ExtendedRequest } from '@src/types/common.types';
import { generateReport } from '@src/utils/generators';
import { reportSchema } from '@src/validation/report.validation';
import { Response } from 'express';
import puppeteer from 'puppeteer';
import { IncludeOptions, Op } from 'sequelize';
import { BaseController } from '.';
import { UserRolesEnum } from '@src/types/user.types';

class GenerateReportController extends BaseController {
  async generate(req: ExtendedRequest<any, any, any, any>, res: Response) {
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

    const from = new Date(unformattedFrom);
    // const from = generateFirstDate(new Date(unformattedFrom));
    const to = new Date(unformattedTo);
    // const to = generateLastDate(new Date(unformattedTo));
    const storeId = user.role === UserRolesEnum.KEEPER ? user.storeId : queryStoreId;

    let store = null;
    if (storeId) {
      store = await StoreServices.getStoreById(storeId);
    }

    // get remaining products
    const include: IncludeOptions = {
      association: 'stores',
      where: { ...(storeId && { storeId: storeId }) },
      required: true,
    };
    const { products } = await ProductServices.getAllProducts({}, {}, [include]);
    const remainingProducts = products.reduce(
      (acc, product) => {
        const { stores } = product;
        stores?.forEach((storeProduct) => {
          if (storeProduct.quantity > 0) {
            acc[product.name] = {
              count: (acc[product.name]?.count || 0) + Number(storeProduct.quantity),
              price: (acc[product.name]?.price || 0) + Number(product.variations[0].sellingPrice),
            };
          }
        });
        return acc;
      },
      {} as { [key: string]: { count: number; price: number } }
    );

    const { sales } = await SaleServices.getAllSales(
      {},
      {
        ...(storeId && { storeId }),
        refundedAt: null,
        createdAt: {
          [Op.gte]: from.toISOString(),
          [Op.lte]: to.toISOString(),
        },
      }
    );

    const { transactions } = await TransactionServices.getAllTransactions(
      {},
      {
        ...(storeId && { storeId }),
        createdAt: {
          [Op.gte]: from.toISOString(),
          [Op.lte]: to.toISOString(),
        },
      }
    );

    // Open a new page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content
    const htmlContent = generateReport({
      from,
      to,
      store,
      remainingProducts,
      sales,
      transactions,
    });
    await page.setContent(htmlContent);

    // Generate PDF
    const pdfBuffer = await page.pdf({ printBackground: true });
    await browser.close();

    res.setHeader('Content-Disposition', 'filename="report.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  }
}

export default GenerateReportController;
