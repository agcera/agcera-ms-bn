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
import MixtureItem from './mixtureitem';
import SaleMixture from './salemixture';

class Mixture extends Model<InferAttributes<Mixture>, InferCreationAttributes<Mixture>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare image: CreationOptional<string>;
  declare description: string;
  declare costPrice: number;
  declare sellingPrice: number;

  declare items?: NonAttribute<MixtureItem[]>;
  declare sales?: NonAttribute<SaleMixture[]>;

  declare static associations: {
    items: Association<MixtureItem, Mixture>;
    sales: Association<SaleMixture, Mixture>;
  };

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | null;
  declare deletedAt: Date | null;
}

Mixture.init(
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
      defaultValue: 'Mixture description',
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
    modelName: 'Mixture',
    tableName: 'Mixtures',
  }
);

Mixture.hasMany(MixtureItem, {
  foreignKey: 'mixtureId',
  as: 'items',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
MixtureItem.belongsTo(Mixture, {
  foreignKey: 'mixtureId',
  as: 'mixture',
});

Mixture.hasMany(SaleMixture, {
  foreignKey: 'mixtureId',
  as: 'sales',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
SaleMixture.belongsTo(Mixture, {
  foreignKey: 'mixtureId',
  as: 'mixture',
});

export default Mixture;
