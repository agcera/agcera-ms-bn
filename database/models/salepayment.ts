import sequelize from '@database/connection';
import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import Sale from './sale';
import { PaymentMethodsEnum } from './paymentMethods';

class SalePayment extends Model<InferAttributes<SalePayment>, InferCreationAttributes<SalePayment>> {
  declare readonly id: CreationOptional<string>;

  declare saleId: ForeignKey<Sale['id']>;
  declare paymentMethod: PaymentMethodsEnum;
  declare amount: number;

  declare sale: NonAttribute<Sale>;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | undefined;
  declare deletedAt: Date | undefined;
}

SalePayment.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    saleId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Sales',
        key: 'id',
      },
    },
    paymentMethod: {
      allowNull: false,
      type: DataTypes.ENUM(...Object.values(PaymentMethodsEnum)),
      defaultValue: PaymentMethodsEnum.CASH,
    },
    amount: {
      allowNull: false,
      type: DataTypes.DECIMAL,
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
    modelName: 'SalePayment',
    tableName: 'SalePayments',
  }
);

export default SalePayment;
