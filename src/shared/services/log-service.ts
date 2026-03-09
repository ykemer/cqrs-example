import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';

type LoggerServiceInterface = {
  info: (payload: unknown, ...meta: unknown[]) => void;
  debug: (payload: unknown, ...meta: unknown[]) => void;
  alert: (payload: unknown, ...meta: unknown[]) => void;
  error: (payload: unknown, ...meta: unknown[]) => void;
  warn: (payload: unknown, ...meta: unknown[]) => void;
};

let loggerInstance: LoggerServiceInterface | null = null;

export const getLoggerService = (): LoggerServiceInterface => {
  if (loggerInstance) {
    return loggerInstance;
  }

  const logDirectory = path.join(process.cwd(), 'logs');

  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, {recursive: true});
  }

  loggerInstance = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({stack: true}),
      winston.format.splat(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(logDirectory, 'info', `${new Date().toISOString().slice(0, 10)}-info.log`),
        level: 'info',
      }),
      new winston.transports.File({
        filename: path.join(logDirectory, 'error', `${new Date().toISOString().slice(0, 10)}-error.log`),
        level: 'error',
      }),
      new winston.transports.File({
        filename: path.join(logDirectory, 'warn', `${new Date().toISOString().slice(0, 10)}-warning.log`),
        level: 'warn',
      }),
    ],
  });

  return loggerInstance;
};
