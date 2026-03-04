import {Sequelize} from 'sequelize';

import {getEnvironmentVariables} from '@/libs/tools/infrastructure/utils';

let sequelize: Sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
  });
} else {
  const [DB_HOST, DB_PORT, DB_READ_HOST, DB_READ_PORT, DB_NAME, DB_USER, DB_PASS] = getEnvironmentVariables([
    'DB_HOST',
    'DB_PORT',
    'DB_READ_HOST',
    'DB_READ_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASS',
  ]);

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    dialect: 'postgres',
    logging: false,
    replication: {
      write: {
        host: DB_HOST,
        port: Number(DB_PORT),
        username: DB_USER,
        password: DB_PASS,
      },
      read: [
        {
          host: DB_READ_HOST,
          port: Number(DB_READ_PORT),
          username: DB_USER,
          password: DB_PASS,
        },
      ],
    },
    pool: {
      // reasonable defaults for dev; adjust in production
      max: 10,
      idle: 30000,
    },
  });
}

export {sequelize};
