import express from 'express';
import {registerCourseRoutes} from '@/slices/courses/course-router';
import {registerClassRoutes} from '@/slices/classes/class-router';
import {registerEnrollmentsRoutes} from '@/slices/enrollments/enrollments-router';
import {registerUserRoutes} from '@/slices/users/users-router';
import {registerAuthRoutes} from '@/slices/auth/auth-router';
import {errorHandler} from '@/shared/middleware/error-handler';
import {UserRole} from '@/shared/domain/models/user';

export function createTestApp({currentUser}: {currentUser?: {id: string; role: UserRole}} = {}) {
  const app = express();
  app.use(express.json());

  // Test middleware to mock authentication/current user
  app.use((req: any, _res, next) => {
    if (currentUser) req.currentUser = currentUser;
    next();
  });

  // register all slice routes
  registerCourseRoutes(app as any);
  registerClassRoutes(app as any);
  registerEnrollmentsRoutes(app as any);
  registerUserRoutes(app as any);
  registerAuthRoutes(app as any);

  app.use(errorHandler);
  return app;
}
