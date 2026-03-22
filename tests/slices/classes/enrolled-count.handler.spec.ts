import {
  IncreaseEnrolledCount,
  DecreaseEnrolledCount,
} from '@/slices/classes/change-enrolled-count/changed-enrolled-count';
import {UserEnrolledEvent, UserUnenrolledEvent} from '@/shared/domain/events';
import {createCourse, createClass} from '../../utils/db';

describe('IncreaseEnrolledCount', () => {
  it('should increment enrolled users count', async () => {
    const course = await createCourse();
    const klass = await createClass(course.id, {enrolledUsers: 5});
    const handler = new IncreaseEnrolledCount();
    const event = new UserEnrolledEvent('user-id', klass.id);

    const result = await handler.handle(event);

    expect(result).toBeUndefined();
    const updated = await klass.reload();
    expect(updated.enrolledUsers).toBe(6);
  });
});

describe('DecreaseEnrolledCount', () => {
  it('should throw error when enrolled users is already zero', async () => {
    const course = await createCourse();
    const klass = await createClass(course.id, {enrolledUsers: 0});
    const handler = new DecreaseEnrolledCount();
    const event = new UserUnenrolledEvent('user-id', klass.id);

    await expect(handler.handle(event)).rejects.toThrow();
  });

  it('should decrement enrolled users count', async () => {
    const course = await createCourse();
    const klass = await createClass(course.id, {enrolledUsers: 5});
    const handler = new DecreaseEnrolledCount();
    const event = new UserUnenrolledEvent('user-id', klass.id);

    const result = await handler.handle(event);

    expect(result).toBeUndefined();
    const updated = await klass.reload();
    expect(updated.enrolledUsers).toBe(4);
  });
});
