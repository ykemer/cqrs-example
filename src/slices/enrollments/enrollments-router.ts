import {Express} from 'express';

import {enrollToClassRouter} from '@/slices/enrollments/enroll-to-class/enroll-to-class';
import {unenrollFromClassRouter} from '@/slices/enrollments/unenroll-from-class/unenroll-from-class';

export const registerEnrollmentsRoutes = (app: Express) => {
  app.use(enrollToClassRouter);
  app.use(unenrollFromClassRouter);
};
