import sequelize from '@database/connection';
import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelValidateOptions,
  NonAttribute,
} from 'sequelize';
import Product from './product';

class Variation extends Model<InferAttributes<Variation>, InferCreationAttributes<Variation>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare costPrice: number;
  declare sellingPrice: number;
  declare number: number;

  declare productId: ForeignKey<Product['id']>;
  declare product: NonAttribute<Product>;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | null;
  declare deletedAt: Date | null;
}

Variation.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    costPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    sellingPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isGreaterThanCostPrice(value: number) {
          if (((this as ModelValidateOptions).costPrice as number) > value) {
            throw new Error('Selling price must be greater than cost price');
          }
        },
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    modelName: 'Variation',
    tableName: 'Variations',
  }
);

export default Variation;
