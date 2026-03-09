import {Express} from 'express';

import {createCourseRouter} from '@/slices/courses/create-course/create-course';
import {deleteCourseRouter} from '@/slices/courses/delete-course/delete-course';
import {getCourseRouter} from '@/slices/courses/get-course/get-course';
import {listCoursesRouter} from '@/slices/courses/list-courses/list-courses';
import {updateCourseRouter} from '@/slices/courses/update-course/update-course';

export const registerCourseRoutes = (app: Express) => {
  app.use(listCoursesRouter);
  app.use(createCourseRouter);
  app.use(getCourseRouter);
  app.use(updateCourseRouter);
  app.use(deleteCourseRouter);
};
