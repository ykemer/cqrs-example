type HealthServiceInterface = {
  checkDatabase(): Promise<boolean>;
};

export type {HealthServiceInterface};
