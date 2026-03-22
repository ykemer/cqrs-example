import {CourseBuilder} from '../builders/course.builder';
import {ClassBuilder} from '../builders/class.builder';
import {UserBuilder} from '../builders/user.builder';
import {EnrollmentBuilder} from '../builders/enrollment.builder';
import {UserRole} from '@/shared/domain/models/user';

export async function createCourse(attrs?: {name?: string; description?: string}) {
  const b = CourseBuilder.create();
  if (attrs?.name) b.withName(attrs.name);
  if (attrs?.description) b.withDescription(attrs.description);
  return b.persist();
}

export async function createClass(
  courseId: string,
  opts?: {maxUsers?: number; registrationDeadline?: Date; enrolledUsers?: number}
) {
  const b = new ClassBuilder(courseId);
  if (opts?.maxUsers) b.withMaxUsers(opts.maxUsers);
  if (opts?.registrationDeadline) b.withRegistrationDeadline(opts.registrationDeadline);
  if (opts?.enrolledUsers) b.withEnrolledUsers(opts.enrolledUsers);
  return b.build();
}

export async function createUser(attrs?: {email?: string; name?: string; role?: UserRole}) {
  const b = new UserBuilder();
  if (attrs?.email) b.withEmail(attrs.email);
  if (attrs?.name) b.withName(attrs.name);
  if (attrs?.role) b.withRole(attrs.role);
  return b.build();
}

export async function createEnrollment(classId: string, userId: string) {
  const b = new EnrollmentBuilder(classId, userId);
  return b.persist();
}
