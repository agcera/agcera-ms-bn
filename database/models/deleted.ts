import sequelize from '@database/connection';

import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

class Deleted extends Model<InferAttributes<Deleted>, InferCreationAttributes<Deleted>> {
  declare id: CreationOptional<string>;
  declare table: string;
  declare description: string;
  declare deletedBy: string;

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | null;
  declare deletedAt: Date | null;
}

Deleted.init(
  {
    id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    table: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    deletedBy: {
      type: DataTypes.STRING,
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
    sequelize: sequelize,
    modelName: 'Deleted',
    tableName: 'Deleteds',
  }
);

export default Deleted;
