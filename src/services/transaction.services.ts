import Transaction from '@database/models/transaction';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { TransactionTypesEnum } from '@src/types/transaction.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, WhereOptions } from 'sequelize';

class TransactionServices {
  static DEFAULT_USER_INCLUDE: IncludeOptions = {
    association: 'user',
    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
  };

  static STORE_INCLUDE: IncludeOptions = {
    association: 'store',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  };

  static async createTransaction(
    storeId: string,
    userId: string,
    type: TransactionTypesEnum,
    amount: number,
    description: string
  ) {
    // create transaction
    const transaction = await Transaction.create({ storeId, userId, type, amount, description });

    return transaction.reload({ include: [this.DEFAULT_USER_INCLUDE, this.STORE_INCLUDE] });
  }

  static async getOneTransaction(where: WhereOptions, includes?: IncludeOptions[]) {
    // get transaction
    const include: IncludeOptions[] = [this.DEFAULT_USER_INCLUDE, this.STORE_INCLUDE, ...(includes || [])];

    return Transaction.findOne({ where, include });
  }

  static async getAllTransactions(
    queryData: GetAllRequestQuery,
    where?: WhereOptions<Transaction>,
    includes?: IncludeOptions[]
  ) {
    // get all transactions
    const include: IncludeOptions[] = [this.DEFAULT_USER_INCLUDE, this.STORE_INCLUDE, ...(includes || [])];

    const { count, rows } = await Transaction.findAndCountAll(
      findQueryGenerators(Transaction.getAttributes(), queryData, { where, include })
    );

    return { total: count, transactions: rows };
  }
}

export default TransactionServices;
