import {ClassModel} from './class';
import {CourseModel} from './course';
import {EnrollmentsModel} from './enrollments';
import {RefreshTokenModel} from './refresh-token';
import {UserModel, UserRole} from './user';

// Wire up associations once
UserModel.hasMany(RefreshTokenModel, {foreignKey: 'user_id', as: 'refreshTokens'});
RefreshTokenModel.belongsTo(UserModel, {foreignKey: 'user_id', as: 'user'});

UserModel.hasMany(EnrollmentsModel, {foreignKey: 'user_id', as: 'enrollments'});
EnrollmentsModel.belongsTo(UserModel, {foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE'});

ClassModel.hasMany(EnrollmentsModel, {foreignKey: 'class_id', as: 'enrollments'});
EnrollmentsModel.belongsTo(ClassModel, {foreignKey: 'class_id', as: 'class', onDelete: 'CASCADE'});

CourseModel.hasMany(ClassModel, {foreignKey: 'course_id', as: 'classes'});
ClassModel.belongsTo(CourseModel, {foreignKey: 'course_id', as: 'course', onDelete: 'CASCADE'});

export {ClassModel, CourseModel, EnrollmentsModel, RefreshTokenModel, UserModel, UserRole};
