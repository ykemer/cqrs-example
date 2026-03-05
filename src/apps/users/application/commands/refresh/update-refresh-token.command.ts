import {RequestData} from 'mediatr-ts';

import {UpdateRefreshTokenResponse} from '@/apps/users/application/commands/refresh/update-refresh-token-response';

export class UpdateRefreshTokenCommand extends RequestData<UpdateRefreshTokenResponse> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}
