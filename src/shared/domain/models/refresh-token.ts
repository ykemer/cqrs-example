import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';

import {sequelize} from '@/shared/persistence/database';

export class RefreshTokenModel extends Model<
  InferAttributes<RefreshTokenModel>,
  InferCreationAttributes<RefreshTokenModel>
> {
  declare id: CreationOptional<string>;
  declare token: string;
  declare userId: string;
  declare expiresAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  isValid(): boolean {
    return this.expiresAt && new Date(this.expiresAt).getTime() > Date.now();
  }
}

RefreshTokenModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    token: {type: DataTypes.STRING, allowNull: false, unique: true},
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
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
    tableName: 'refresh_tokens',
    timestamps: false,
    indexes: [{fields: ['user_id']}],
  }
);
