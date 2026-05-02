import sequelize from '@database/connection';
import {
  Association,
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelValidateOptions,
  NonAttribute,
} from 'sequelize';
import ComboItem from './comboitem';
import SaleCombo from './salecombo';

class Combo extends Model<InferAttributes<Combo>, InferCreationAttributes<Combo>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare image: CreationOptional<string>;
  declare description: string;
  declare costPrice: number;
  declare sellingPrice: number;

  declare items?: NonAttribute<ComboItem[]>;
  declare sales?: NonAttribute<SaleCombo[]>;

  declare static associations: {
    items: Association<ComboItem, Combo>;
    sales: Association<SaleCombo, Combo>;
  };

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | null;
  declare deletedAt: Date | null;
}

Combo.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'https://placehold.co/150x100?text=image%20not%20found',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Combo description',
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
    modelName: 'Combo',
    tableName: 'Combos',
  }
);

Combo.hasMany(ComboItem, {
  foreignKey: 'comboId',
  as: 'items',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
ComboItem.belongsTo(Combo, {
  foreignKey: 'comboId',
  as: 'combo',
});

Combo.hasMany(SaleCombo, {
  foreignKey: 'comboId',
  as: 'sales',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
SaleCombo.belongsTo(Combo, {
  foreignKey: 'comboId',
  as: 'combo',
});

export default Combo;
