import TransactionServices from '@src/services/transaction.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Response } from 'express';
import { IncludeOptions, WhereOptions } from 'sequelize';
import { BaseController } from '.';

class TransactionController extends BaseController {
  async getAllTransactions(req: ExtendedRequest, res: Response) {
    const { role: userRole, storeId } = req.user!;

    const { search, limit, skip, sort } = req.query;

    const WhereOptions: WhereOptions = {};
    const include: IncludeOptions[] = [];

    switch (userRole) {
      case 'keeper':
        WhereOptions['storeId'] = storeId;
        break;
      case 'admin':
        break;
    }

    const { transactions, total } = await TransactionServices.getAllTransactions(
      { search, limit, skip, sort },
      WhereOptions,
      include
    );

    return res.status(200).json({
      status: 200,
      data: { transactions, total },
    });
  }

  async createTransaction(req: ExtendedRequest, res: Response): Promise<Response | undefined> {
    const { id: userId, storeId } = req.user!;

    const { type, amount, description, paymentMethod } = req.body;

    const transaction = await TransactionServices.createTransaction(
      storeId!,
      userId,
      type,
      amount,
      description,
      paymentMethod
    );

    if (!transaction)
      return res.status(500).json({
        status: 500,
        message: 'Error creating transaction, Please make sure that this store is yours and try again later.',
      });

    return res.status(201).json({
      status: 201,
      data: transaction,
    });
  }

  async getOneTransaction(req: ExtendedRequest, res: Response) {
    const { role: userRole, storeId } = req.user!;
    const { id } = req.params;

    const where: WhereOptions = { id };

    switch (userRole) {
      case 'keeper':
        where['storeId'] = storeId;
        break;
      case 'admin':
        break;
    }

    const transaction = await TransactionServices.getOneTransaction(where);

    if (!transaction)
      return res.status(404).json({
        status: 404,
        message: 'Transaction not found',
      });

    return res.status(200).json({
      status: 200,
      data: transaction,
    });
  }
}

export default TransactionController;
