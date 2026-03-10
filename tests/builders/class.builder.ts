import {ClassModel} from '@/shared';

export class ClassBuilder {
  private registrationDeadline = new Date(Date.now() + 1000 * 60 * 60 * 24); // Tomorrow
  private startDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2); // In 2 days
  private endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // In 30 days
  private maxUsers = 10;
  private enrolledUsers = 0;
  private courseId: string;

  constructor(courseId: string) {
    this.courseId = courseId;
  }

  withMaxUsers(maxUsers: number) {
    this.maxUsers = maxUsers;
    return this;
  }

  withEnrolledUsers(enrolledUsers: number) {
    this.enrolledUsers = enrolledUsers;
    return this;
  }

  withRegistrationDeadline(date: Date) {
    this.registrationDeadline = date;
    return this;
  }

  async build() {
    return await ClassModel.create({
      courseId: this.courseId,
      registrationDeadline: this.registrationDeadline,
      startDate: this.startDate,
      endDate: this.endDate,
      maxUsers: this.maxUsers,
      enrolledUsers: this.enrolledUsers,
    });
  }
}
