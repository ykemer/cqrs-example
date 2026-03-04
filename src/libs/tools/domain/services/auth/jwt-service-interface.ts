import {UserDto} from '@/libs/dto/domain';

import {JwtTokenResponse} from './jwt-token-response';

type JwtServiceInterface = {
  getSignedJwtTokenResponse: (payload: UserDto) => JwtTokenResponse;
  getPayload: (token: string) => UserDto | null;
};

export type {JwtServiceInterface};
