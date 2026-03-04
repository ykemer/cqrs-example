type PasswordServiceInterface = {
  encode: (password: string) => Promise<string>;
  compare: (suppliedPassword: string, storedPassword: string) => Promise<boolean>;
};

export type {PasswordServiceInterface};
