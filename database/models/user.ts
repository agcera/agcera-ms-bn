// import { sequelize } from '@database/models/index';
import sequelize from '@database/connection';
import { UserGendersEnum, UserRolesEnum } from '@src/types/user.types';
import {
  // Association,
  DataTypes,
  ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
  CreationOptional,
  NonAttribute,
  Association,
} from 'sequelize';
import Store from './store';
import Sale from './sale';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare password: string;
  declare phone: string;
  declare location: string;
  declare role: UserRolesEnum;
  declare email: string | null;
  declare gender: string | null;
  declare isActive: boolean | null;
  declare image: CreationOptional<string>;

  declare storeId?: CreationOptional<ForeignKey<Store['id'] | null>>;

  declare sales?: NonAttribute<Sale[]>;

  declare static associations: {
    sales: Association<Sale, User>;
  };

  declare readonly createdAt: CreationOptional<Date>;
  declare updatedAt: Date | null;
  declare deletedAt: Date | null;
}

User.init(
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 4,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gender: {
      type: DataTypes.ENUM(...Object.values(UserGendersEnum)),
      allowNull: false,
      defaultValue: UserGendersEnum.UNSPECIFIED,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Maputo Center',
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRolesEnum)),
      allowNull: false,
      defaultValue: UserRolesEnum.USER,
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Stores',
        key: 'id',
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'https://via.placeholder.com/150?text=No%20User%20Image',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'User',
    tableName: 'Users',
  }
);

export default User;
