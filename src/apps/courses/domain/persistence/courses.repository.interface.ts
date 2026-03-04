import {CourseDto} from '@/apps/courses/domain/models/course.dto';

export type UpsertCoursePayload = {
  name: string;
  description: string;
};

export type CoursesRepositoryInterface = {
  getCoursesWithCount: (take: number, skip: number) => Promise<{data: CourseDto[]; total: number}>;
  getCoursesForUser: (userId: string, take: number, skip: number) => Promise<{data: CourseDto[]; total: number}>;
  getCourse: (id: string) => Promise<CourseDto | null>;
  createCourse: (payload: UpsertCoursePayload) => Promise<CourseDto>;
  updateCourse: (id: string, payload: UpsertCoursePayload) => Promise<CourseDto | null>;
  deleteCourse: (id: string) => Promise<void>;
};
