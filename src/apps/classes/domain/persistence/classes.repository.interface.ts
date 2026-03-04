import {ClassDto} from '@/apps/classes/domain/models/class.dto';

export type UpsertClassPayload = {
  maxUsers: number;
  registrationDeadline: Date;
  startDate: Date;
  endDate: Date;
};

export type ClassesRepositoryInterface = {
  getClassesWithCount: (courseId: string, take: number, skip: number) => Promise<{data: ClassDto[]; total: number}>;
  getClassesForUser: (
    courseId: string,
    userId: string,
    take: number,
    skip: number
  ) => Promise<{data: ClassDto[]; total: number}>;
  getClass: (courseId: string, id: string) => Promise<ClassDto | null>;
  createClass: (courseId: string, payload: UpsertClassPayload) => Promise<ClassDto>;
  updateClass: (courseId: string, id: string, payload: UpsertClassPayload) => Promise<ClassDto | null>;
  deleteClass: (courseId: string, id: string) => Promise<void>;
};
