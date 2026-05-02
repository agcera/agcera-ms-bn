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
import Sale from './sale';

class SaleCombo extends Model<InferAttributes<SaleCombo>, InferCreationAttributes<SaleCombo>> {
  declare readonly id: CreationOptional<string>;

  declare saleId: ForeignKey<Sale['id']>;
  declare comboId: ForeignKey<Combo['id']>;
  declare quantity: number;

  declare sale: NonAttribute<Sale>;
  declare combo: NonAttribute<Combo>;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | undefined;
  declare deletedAt: Date | undefined;
}

SaleCombo.init(
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
    comboId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Combos',
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
    modelName: 'SaleCombo',
    tableName: 'SaleCombos',
  }
);

export default SaleCombo;
