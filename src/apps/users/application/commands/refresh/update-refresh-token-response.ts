import {JwtTokenResponse} from '@/libs/tools/domain';

export type UpdateRefreshTokenResponse = JwtTokenResponse & {
  refreshToken: string;
};
