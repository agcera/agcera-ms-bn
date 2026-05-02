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
import Combo from './combo';
import Product from './product';

class ComboItem extends Model<InferAttributes<ComboItem>, InferCreationAttributes<ComboItem>> {
  declare id: CreationOptional<string>;
  declare comboId: ForeignKey<Combo['id']>;
  declare productId: ForeignKey<Product['id']>;
  declare number: number;

  declare combo?: NonAttribute<Combo>;
  declare product?: NonAttribute<Product>;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | null;
}

ComboItem.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    comboId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Combos',
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
    modelName: 'ComboItem',
    tableName: 'ComboItems',
  }
);

ComboItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});
Product.hasMany(ComboItem, {
  foreignKey: 'productId',
  as: 'comboItems',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

export default ComboItem;
