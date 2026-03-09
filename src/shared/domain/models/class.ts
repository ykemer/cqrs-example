import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';

import {sequelize} from '@/shared/persistence/database';

export class ClassModel extends Model<InferAttributes<ClassModel>, InferCreationAttributes<ClassModel>> {
  declare id: CreationOptional<string>;
  declare registrationDeadline: Date;
  declare startDate: Date;
  declare endDate: Date;
  declare enrolledUsers: CreationOptional<number>;
  declare maxUsers: number;
  declare courseId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  toClassDto(courseName: string) {
    return {
      id: this.id,
      courseId: this.courseId,
      name: courseName,
      maxUsers: this.maxUsers,
      enrolledUsers: this.enrolledUsers,
      registrationDeadline: this.registrationDeadline,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }
}

ClassModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    registrationDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'registration_deadline',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date',
    },
    enrolledUsers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'enrolled_users',
    },
    maxUsers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'max_users',
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'course_id',
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
    tableName: 'classes',
    timestamps: false,
  }
);
