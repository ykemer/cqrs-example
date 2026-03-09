import {Express} from 'express';

import {loginRouter} from '@/slices/auth/login/login';
import {refreshRouter} from '@/slices/auth/refresh/refresh';
import {registerRouter} from '@/slices/auth/register/register';

export const registerAuthRoutes = (app: Express) => {
  app.use(loginRouter);
  app.use(refreshRouter);
  app.use(registerRouter);
};
