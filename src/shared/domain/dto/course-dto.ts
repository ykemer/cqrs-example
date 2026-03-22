export class CourseDto {
  id: string;
  name: string;
  description: string;
  enrolledUsers: number;
}

export type UpsertClassPayload = {
  maxUsers: number;
  registrationDeadline: Date;
  startDate: Date;
  endDate: Date;
};
