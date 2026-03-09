import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';

import {CourseDto} from '@/shared';
import {sequelize} from '@/shared/persistence/database';

export class CourseModel extends Model<InferAttributes<CourseModel>, InferCreationAttributes<CourseModel>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: string;
  declare enrolledUsers: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  toCourseDto(): CourseDto {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      enrolledUsers: this.enrolledUsers ?? 0,
    };
  }
}

CourseModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: false},
    enrolledUsers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'enrolled_users',
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
    tableName: 'courses',
    timestamps: false,
  }
);
