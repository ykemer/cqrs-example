export type HealthService = {
  checkDatabase(): Promise<boolean>;
};
