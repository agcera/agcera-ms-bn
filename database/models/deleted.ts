import sequelize from '@database/connection';

import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import User from './user';

class Deleted extends Model<InferAttributes<Deleted>, InferCreationAttributes<Deleted>> {
  declare id: CreationOptional<string>;
  declare table: string;
  declare description: string;
  declare userId: ForeignKey<User['id']>;

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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
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
    sequelize: sequelize,
    modelName: 'Deleted',
    tableName: 'Deleteds',
  }
);
Deleted.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Deleted, {
  foreignKey: 'userId',
  as: 'deleteds',
});

// Variation.belongsTo(Product, {
//   foreignKey: 'productId',
//   as: 'product',
// });

export default Deleted;
