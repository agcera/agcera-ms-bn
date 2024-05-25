import sequelize from '@database/connection';
import {
  DataTypes,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
  NonAttribute,
  CreationOptional,
  Association,
} from 'sequelize';
import Store from './store';
import SaleProduct from './saleproduct';
import Client from './client';

export enum PaymentMethodsEnum {
  MPESA = 'M-PESA',
  EMOLA = 'E-MOLA',
  POS = 'P.O.S',
  BIM = 'BANCO BIM',
  BCI = 'BANCO BCI',
  CASH = 'CASH',
}

class Sale extends Model<InferAttributes<Sale>, InferCreationAttributes<Sale>> {
  declare readonly id: CreationOptional<string>;
  declare paymentMethod: PaymentMethodsEnum;

  // The client who made the sale, if he is not registered in the system use a phone number.
  declare clientId: ForeignKey<Client['id']>;
  declare storeId: ForeignKey<Store['id']>;

  declare store: NonAttribute<Store>;
  declare variations: NonAttribute<SaleProduct[]>;
  declare client: NonAttribute<Client>;

  declare static associations: {
    variations: Association<SaleProduct, Sale>;
    store: Association<Sale, Store>;
  };

  declare readonly createdAt: CreationOptional<Date>;
  declare refundedAt: Date | null;
  declare updatedAt: Date | undefined;
  declare deletedAt: Date | undefined;
}

Sale.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    paymentMethod: {
      allowNull: false,
      type: DataTypes.ENUM(
        PaymentMethodsEnum.CASH,
        PaymentMethodsEnum.BCI,
        PaymentMethodsEnum.BIM,
        PaymentMethodsEnum.EMOLA,
        PaymentMethodsEnum.MPESA,
        PaymentMethodsEnum.POS
      ),
      defaultValue: PaymentMethodsEnum.CASH,
    },
    clientId: {
      allowNull: true,
      type: DataTypes.STRING,
      references: {
        model: 'Clients',
        key: 'id',
      },
    },

    storeId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Stores',
        key: 'id',
      },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
    refundedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'sale',
    tableName: 'Sales',
  }
);

Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });

Sale.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Store.hasMany(Sale, { foreignKey: 'storeId', as: 'sales' });

SaleProduct.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale',
});
Sale.hasMany(SaleProduct, {
  foreignKey: 'saleId',
  as: 'variations',
});

export default Sale;
