import sequelize from '@database/connection';
import {
  Association,
  CreationOptional,
  DataTypes,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import Client from './client';
import SaleCombo from './salecombo';
import SalePayment from './salepayment';
import SaleProduct from './saleproduct';
import Store from './store';

class Sale extends Model<InferAttributes<Sale>, InferCreationAttributes<Sale>> {
  declare readonly id: CreationOptional<string>;

  // The client who made the sale, if he is not registered in the system use a phone number.
  declare clientId: ForeignKey<Client['id']>;
  declare storeId: ForeignKey<Store['id']>;
  declare checkedAt: Date | null;

  declare store: NonAttribute<Store>;
  declare variations: NonAttribute<SaleProduct[]>;
  declare combos: NonAttribute<SaleCombo[]>;
  declare payments: NonAttribute<SalePayment[]>;
  declare client: NonAttribute<Client>;

  declare static associations: {
    variations: Association<SaleProduct, Sale>;
    combos: Association<SaleCombo, Sale>;
    payments: Association<SalePayment, Sale>;
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
    clientId: {
      allowNull: true,
      type: DataTypes.UUID,
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
    checkedAt: DataTypes.DATE,
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

SaleCombo.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale',
});
Sale.hasMany(SaleCombo, {
  foreignKey: 'saleId',
  as: 'combos',
});

SalePayment.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale',
});
Sale.hasMany(SalePayment, {
  foreignKey: 'saleId',
  as: 'payments',
});

export default Sale;
