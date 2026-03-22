import {ClassModel} from '@/shared';
import {CreateClassCommand} from '@/slices/classes/create-class/create-class';
import {UpdateClassCommand} from '@/slices/classes/update-class/update-class';
import {DeleteClassCommand} from '@/slices/classes/delete-class/delete-class';

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

type UpsertClassPayload = {
  maxUsers: number;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
};

export class CreateClassPayloadBuilder {
  private data: UpsertClassPayload;
  constructor() {
    const now = Date.now();
    this.data = {
      maxUsers: 10,
      registrationDeadline: new Date(now + 3600 * 1000).toISOString(),
      startDate: new Date(now + 7200 * 1000).toISOString(),
      endDate: new Date(now + 10800 * 1000).toISOString(),
    };
  }

  withMaxUsers(count: number) {
    this.data.maxUsers = count;
    return this;
  }

  withRegistrationDeadline(date: string | Date) {
    this.data.registrationDeadline = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  withStartDate(date: string | Date) {
    this.data.startDate = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  withEndDate(date: string | Date) {
    this.data.endDate = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  build() {
    return {...this.data};
  }
}

export class CreateClassCommandBuilder {
  private courseId: string;
  private maxUsers = 10;
  private registrationDeadline = new Date(Date.now() + 1000 * 60 * 60 * 24);
  private startDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
  private endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  constructor(courseId: string) {
    this.courseId = courseId;
  }

  withMaxUsers(maxUsers: number) {
    this.maxUsers = maxUsers;
    return this;
  }

  withRegistrationDeadline(date: Date) {
    this.registrationDeadline = date;
    return this;
  }

  withStartDate(date: Date) {
    this.startDate = date;
    return this;
  }

  withEndDate(date: Date) {
    this.endDate = date;
    return this;
  }

  build() {
    const cmd = new CreateClassCommand();
    cmd.courseId = this.courseId;
    cmd.maxUsers = this.maxUsers;
    cmd.registrationDeadline = this.registrationDeadline;
    cmd.startDate = this.startDate;
    cmd.endDate = this.endDate;
    return cmd;
  }
}

export class UpdateClassCommandBuilder {
  private maxUsers = 10;
  private registrationDeadline = new Date(Date.now() + 1000 * 60 * 60 * 24);
  private startDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
  private endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  constructor(
    private courseId: string,
    private classId: string
  ) {}

  withMaxUsers(maxUsers: number) {
    this.maxUsers = maxUsers;
    return this;
  }

  withRegistrationDeadline(date: Date) {
    this.registrationDeadline = date;
    return this;
  }

  withStartDate(date: Date) {
    this.startDate = date;
    return this;
  }

  withEndDate(date: Date) {
    this.endDate = date;
    return this;
  }

  build() {
    const cmd = new UpdateClassCommand();
    cmd.courseId = this.courseId;
    cmd.id = this.classId;
    cmd.maxUsers = this.maxUsers;
    cmd.registrationDeadline = this.registrationDeadline;
    cmd.startDate = this.startDate;
    cmd.endDate = this.endDate;
    return cmd;
  }
}

export class DeleteClassCommandBuilder {
  constructor(
    private courseId: string,
    private classId: string
  ) {}

  build() {
    return new DeleteClassCommand(this.courseId, this.classId);
  }
}
