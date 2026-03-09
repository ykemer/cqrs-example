import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';

import {UserDto, UserWithPasswordDto} from '@/shared/domain/dto';
import {sequelize} from '@/shared/persistence/database';

export enum UserRole {
  user = 'user',
  admin = 'admin',
}

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare name: string;
  declare password: string;
  declare role: CreationOptional<UserRole>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  toUserWithPasswordDto(): UserWithPasswordDto {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
    };
  }

  toUserDto(): UserDto {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
    };
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {type: DataTypes.STRING, allowNull: false, unique: true},
    name: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.user,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);
