import {NotificationHandler, notificationHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {ClassModel} from '@/shared';
import {UserEnrolledEvent, UserUnenrolledEvent} from '@/shared/domain/events';

@injectable()
@notificationHandler(UserEnrolledEvent)
export class IncreaseEnrolledCount implements NotificationHandler<UserEnrolledEvent> {
  async handle(notification: UserEnrolledEvent): Promise<void> {
    const classToUpdate = await ClassModel.findByPk(notification.classId);
    if (!classToUpdate) {
      throw new Error(`Class ${notification.classId} not found`);
    }

    await classToUpdate.increment('enrolledUsers', {by: 1});
  }
}

@injectable()
@notificationHandler(UserUnenrolledEvent)
export class DecreaseEnrolledCount implements NotificationHandler<UserUnenrolledEvent> {
  async handle(notification: UserUnenrolledEvent): Promise<void> {
    const classToUpdate = await ClassModel.findByPk(notification.classId);
    if (!classToUpdate) {
      throw new Error(`Class ${notification.classId} not found`);
    }

    if (classToUpdate.enrolledUsers === 0) {
      throw new Error(
        `Can not decrease number of enrolled users for class ${notification.classId} since it's already 0`
      );
    }

    await classToUpdate.decrement('enrolledUsers', {by: 1});
  }
}
