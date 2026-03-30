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
import Sale from './sale';

class SaleMixture extends Model<InferAttributes<SaleMixture>, InferCreationAttributes<SaleMixture>> {
  declare readonly id: CreationOptional<string>;

  declare saleId: ForeignKey<Sale['id']>;
  declare mixtureId: ForeignKey<Mixture['id']>;
  declare quantity: number;

  declare sale: NonAttribute<Sale>;
  declare mixture: NonAttribute<Mixture>;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | undefined;
  declare deletedAt: Date | undefined;
}

SaleMixture.init(
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
    mixtureId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: 'Mixtures',
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
    modelName: 'SaleMixture',
    tableName: 'SaleMixtures',
  }
);

export default SaleMixture;
