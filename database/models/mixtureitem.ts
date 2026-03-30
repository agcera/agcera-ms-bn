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
import Mixture from './mixture';
import Product from './product';

class MixtureItem extends Model<InferAttributes<MixtureItem>, InferCreationAttributes<MixtureItem>> {
  declare id: CreationOptional<string>;
  declare mixtureId: ForeignKey<Mixture['id']>;
  declare productId: ForeignKey<Product['id']>;
  declare number: number;

  declare mixture?: NonAttribute<Mixture>;
  declare product?: NonAttribute<Product>;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | null;
}

MixtureItem.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    mixtureId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Mixtures',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'MixtureItem',
    tableName: 'MixtureItems',
  }
);

MixtureItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});
Product.hasMany(MixtureItem, {
  foreignKey: 'productId',
  as: 'mixtureItems',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

export default MixtureItem;
