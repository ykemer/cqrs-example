import {Express} from 'express';

import {deleteUserRouter} from '@/slices/users/delete-user/delete-user';
import {listUsersRouter} from '@/slices/users/list-users/list-users';
import {profileRouter} from '@/slices/users/profile/profile';
import {updateUserRouter} from '@/slices/users/update-user/update-user';

export const registerUserRoutes = (app: Express) => {
  app.use(listUsersRouter);
  app.use(profileRouter);
  app.use(updateUserRouter);
  app.use(deleteUserRouter);
};
