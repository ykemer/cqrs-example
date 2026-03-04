import {JwtTokenResponse} from '@/libs/tools/domain';

export type LoginUserResponse = JwtTokenResponse & {
  refreshToken: string;
};
