import {NotificationHandler, notificationHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {ClassModel, CourseModel, sequelize} from '@/shared';
import {UserEnrolledEvent, UserUnenrolledEvent} from '@/shared/domain/events';

@injectable()
@notificationHandler(UserEnrolledEvent)
export class IncreaseEnrolledCount implements NotificationHandler<UserEnrolledEvent> {
  async handle(notification: UserEnrolledEvent): Promise<void> {
    return await sequelize.transaction(async t => {
      const existingClass = await ClassModel.findByPk(notification.classId, {transaction: t, useMaster: true});
      if (!existingClass) {
        throw new Error(`Class ${notification.classId} not found`);
      }

      const courseToUpdate = await CourseModel.findByPk(existingClass.courseId, {transaction: t, useMaster: true});
      if (!courseToUpdate) {
        throw new Error(`Course ${existingClass.courseId} not found`);
      }
      await courseToUpdate.increment('enrolledUsers', {by: 1, transaction: t});
    });
  }
}

@injectable()
@notificationHandler(UserUnenrolledEvent)
export class DecreaseEnrolledCount implements NotificationHandler<UserUnenrolledEvent> {
  async handle(notification: UserUnenrolledEvent): Promise<void> {
    return await sequelize.transaction(async t => {
      const existingClass = await ClassModel.findByPk(notification.classId, {transaction: t, useMaster: true});
      if (!existingClass) {
        throw new Error(`Class ${notification.classId} not found`);
      }

      const courseToUpdate = await CourseModel.findByPk(existingClass.courseId, {transaction: t, useMaster: true});
      if (!courseToUpdate) {
        throw new Error(`Course ${existingClass.courseId} not found`);
      }
      await courseToUpdate.decrement('enrolledUsers', {by: 1, transaction: t});
    });
  }
}
