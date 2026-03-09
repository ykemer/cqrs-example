import {container} from 'tsyringe';

import {jwtServiceCreator, passwordServiceCreator} from '@/shared/services';
import {refreshTokenServiceCreator} from '@/shared/services/refresh-rokens-service';

import {DI_TOKENS} from './tokens';

container.register(DI_TOKENS.PasswordService, {useValue: passwordServiceCreator()});
container.register(DI_TOKENS.JwtService, {useValue: jwtServiceCreator()});
container.register(DI_TOKENS.RefreshTokenService, {useValue: refreshTokenServiceCreator()});

export {container};
