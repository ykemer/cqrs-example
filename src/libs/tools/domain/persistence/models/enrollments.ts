import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';

import {sequelize} from '@/libs/tools/infrastructure/persistence/config/database';

export class EnrollmentsModel extends Model<
  InferAttributes<EnrollmentsModel>,
  InferCreationAttributes<EnrollmentsModel>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare classId: string;
  declare enrolledAt: CreationOptional<Date>;
}

EnrollmentsModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'class_id',
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'enrolled_at',
    },
  },
  {
    sequelize,
    tableName: 'enrollments',
    timestamps: false,
    indexes: [{fields: ['user_id']}, {fields: ['class_id']}, {unique: true, fields: ['user_id', 'class_id']}],
  }
);
