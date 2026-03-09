import {Express} from 'express';

import {createClassRouter} from '@/slices/classes/create-class/create-class';
import {deleteClassRouter} from '@/slices/classes/delete-class/delete-class';
import {getClassRouter} from '@/slices/classes/get-class/get-class';
import {listClassesRouter} from '@/slices/classes/list-classes/list-classes';
import {updateClassRouter} from '@/slices/classes/update-class/update-class';

export const registerClassRoutes = (app: Express) => {
  app.use(listClassesRouter);
  app.use(createClassRouter);
  app.use(getClassRouter);
  app.use(updateClassRouter);
  app.use(deleteClassRouter);
};
