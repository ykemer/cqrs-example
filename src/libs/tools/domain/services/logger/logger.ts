type LoggerServiceInterface = {
  info: (payload: unknown, ...meta: unknown[]) => void;
  debug: (payload: unknown, ...meta: unknown[]) => void;
  alert: (payload: unknown, ...meta: unknown[]) => void;
  error: (payload: unknown, ...meta: unknown[]) => void;
  warn: (payload: unknown, ...meta: unknown[]) => void;
};

export type {LoggerServiceInterface};
