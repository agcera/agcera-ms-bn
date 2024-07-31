import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import User from './user';
import Store from './store';
import sequelize from '@database/connection';
import { TransactionTypesEnum } from '@src/types/transaction.types';
import { PaymentMethodsEnum } from './sale';

class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
  declare readonly id: CreationOptional<string>;
  declare amount: number;
  declare description: string;
  declare userId: ForeignKey<User['id'] | null> | null;
  declare storeId: ForeignKey<Store['id']>;
  declare type: TransactionTypesEnum;
  declare checked: boolean;

  declare store: NonAttribute<Store>;
  declare user: NonAttribute<User | null> | null;
  declare paymentMethod: PaymentMethodsEnum;

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
    paymentMethod: {
      allowNull: false,
      type: DataTypes.ENUM(...Object.values(PaymentMethodsEnum)),
    },
    checked: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      allowNull: true,
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
  }
);

Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
User.hasMany(Transaction, {
  foreignKey: { name: 'userId', allowNull: false },
  as: 'transactions',
  onDelete: 'CASCADE',
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
