import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import User from './user';
import Store from './store';
import sequelize from '@database/connection';
import { TransactionTypesEnum } from '@src/types/transaction.types';

class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
  declare readonly id: CreationOptional<string>;
  declare amount: number;
  declare description: string;
  declare userId: ForeignKey<User['id']>;
  declare storeId: ForeignKey<Store['id']>;
  declare type: TransactionTypesEnum;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | undefined;
  declare deletedAt: Date | undefined;
}

Transaction.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM(TransactionTypesEnum.INCOME, TransactionTypesEnum.EXPENSE),
    },
    amount: {
      allowNull: false,
      type: DataTypes.DECIMAL,
    },
    storeId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Stores',
        key: 'id',
      },
    },
    userId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'Transactions',
    paranoid: true,
  }
);

Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions',
});

Transaction.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store',
});

Store.hasMany(Transaction, {
  foreignKey: 'storeId',
  as: 'transactions',
});

export default Transaction;
