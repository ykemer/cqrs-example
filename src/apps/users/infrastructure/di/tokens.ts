export const USER_TOKENS = {
  UserRepository: Symbol('UserRepository'),
  RefreshTokenRepository: Symbol('RefreshTokenRepository'),
  PasswordService: Symbol('PasswordService'),
  JwtService: Symbol('JwtService'),
  RefreshTokenService: Symbol('RefreshTokenService'),
} as const;
