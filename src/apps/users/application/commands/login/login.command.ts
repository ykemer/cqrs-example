import {RequestData} from 'mediatr-ts';

import {LoginUserResponse} from '@/apps/users/application/commands/login/login-response';

export class LoginCommand extends RequestData<LoginUserResponse> {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {
    super();
  }
}
