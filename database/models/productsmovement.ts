import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import User from './user';
import Store from './store';
import Product from './product';
import sequelize from '@database/connection';

class ProductsMovement extends Model<InferAttributes<ProductsMovement>, InferCreationAttributes<ProductsMovement>> {
  declare readonly id: CreationOptional<string>;
  declare quantity: number;
  declare productId: ForeignKey<Product['id']>;
  declare userId: ForeignKey<User['id']>;
  declare from: ForeignKey<Store['id']> | null;
  declare to: ForeignKey<Store['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | undefined;
  declare deletedAt: Date | undefined;
}

ProductsMovement.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    productId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Products',
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
    from: {
      allowNull: true,
      type: DataTypes.UUID,
      references: {
        model: 'Stores',
        key: 'id',
      },
    },
    to: {
      allowNull: true,
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
  },
  {
    sequelize,
    modelName: 'productsMovement',
    tableName: 'ProductsMovements',
  }
);

Product.hasMany(ProductsMovement, { foreignKey: 'productId', as: 'productMovements' });
ProductsMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(ProductsMovement, { foreignKey: 'userId', as: 'productMovements' });
ProductsMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Store.hasMany(ProductsMovement, { foreignKey: 'from', as: 'fromThis' });
ProductsMovement.belongsTo(Store, { foreignKey: 'from', as: 'storeFrom' });

Store.hasMany(ProductsMovement, { foreignKey: 'to', as: 'toThis' });
ProductsMovement.belongsTo(Store, { foreignKey: 'to', as: 'storeTo' });

export default ProductsMovement;
