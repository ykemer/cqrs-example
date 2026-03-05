import {Express} from 'express';

import {createClassRouter} from '@/apps/classes/infrastructure/routers/create-class.router';
import {deleteClassRouter} from '@/apps/classes/infrastructure/routers/delete-class.router';
import {getClassRouter} from '@/apps/classes/infrastructure/routers/get-class.router';
import {listClassesRouter} from '@/apps/classes/infrastructure/routers/list-classes.router';
import {updateClassRouter} from '@/apps/classes/infrastructure/routers/update-class.router';
import {createCourseRouter} from '@/apps/courses/infrastructure/routers/create-course.router';
import {deleteCourseRouter} from '@/apps/courses/infrastructure/routers/delete-course.router';
import {getCourseRouter} from '@/apps/courses/infrastructure/routers/get-course.router';
import {listCoursesRouter} from '@/apps/courses/infrastructure/routers/list-courses.router';
import {updateCourseRouter} from '@/apps/courses/infrastructure/routers/update-course.router';
import {deleteUserRouter} from '@/apps/users/infrastructure/routers/delete-user.router';
import {getUserRouter} from '@/apps/users/infrastructure/routers/get-user.router';
import {listUsersRouter} from '@/apps/users/infrastructure/routers/get-users-list.router';
import {loginRouter} from '@/apps/users/infrastructure/routers/login.router';
import {profileRouter} from '@/apps/users/infrastructure/routers/profile.router';
import {refreshRouter} from '@/apps/users/infrastructure/routers/refresh.router';
import {registerRouter} from '@/apps/users/infrastructure/routers/register.router';
import {updateUserRouter} from '@/apps/users/infrastructure/routers/update-user.router';

const configureRouters = (app: Express) => {
  // Users
  app.use(registerRouter);
  app.use(loginRouter);
  app.use(refreshRouter);
  app.use(profileRouter);
  app.use(listUsersRouter);
  app.use(getUserRouter);
  app.use(deleteUserRouter);
  app.use(updateUserRouter);

  // Courses
  app.use(createCourseRouter);
  app.use(updateCourseRouter);
  app.use(deleteCourseRouter);
  app.use(listCoursesRouter);
  app.use(getCourseRouter);

  // Classes
  app.use(createClassRouter);
  app.use(updateClassRouter);
  app.use(deleteClassRouter);
  app.use(listClassesRouter);
  app.use(getClassRouter);
};

export {configureRouters};
