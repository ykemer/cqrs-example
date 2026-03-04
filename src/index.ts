import dotenv from 'dotenv';

dotenv.config();

import 'reflect-metadata';
import {getConfiguredApp} from '@/config';
import {setupPersistence} from '@/libs/tools/infrastructure';

const start = async () => {
  const app = getConfiguredApp();
  await setupPersistence();

  app.listen(3000, () => {
    console.log('Application is running on port 3000. http://localhost:3000');
  });
};

(async () => {
  await start();
})();
