import sequelize from '@database/connection';
import Variation from '@database/models/variation';
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

class SaleProduct extends Model<InferAttributes<SaleProduct>, InferCreationAttributes<SaleProduct>> {
  declare readonly id: string | undefined;

  declare saleId: ForeignKey<Sale['id']>;
  declare variationId: ForeignKey<Variation['id']>;

  declare quantity: number | undefined;

  declare sale: NonAttribute<Sale>;
  declare variation: NonAttribute<Variation>;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | undefined;
  declare deletedAt: Date | undefined;
}
SaleProduct.init(
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
    saleId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Sales',
        key: 'id',
      },
    },
    variationId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Variations',
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
    modelName: 'SaleProduct',
    tableName: 'SaleProducts',
  }
);

SaleProduct.belongsTo(Variation, {
  foreignKey: 'variationId',
  as: 'variation',
});
Variation.hasMany(SaleProduct, {
  foreignKey: 'variationId',
  as: 'sales',
});

export default SaleProduct;
