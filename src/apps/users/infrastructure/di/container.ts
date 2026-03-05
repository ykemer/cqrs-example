import {container} from 'tsyringe';

import {refreshTokenRepositoryCreator} from '@/apps/users/infrastructure/persistence/refresh-token-repository';
import {userRepositoryCreator} from '@/apps/users/infrastructure/persistence/user-repository';
import {refreshTokenServiceCreator} from '@/apps/users/infrastructure/service/refresh-token-service';
import {jwtServiceCreator, passwordServiceCreator} from '@/libs/tools/infrastructure';

import {USER_TOKENS} from './tokens';

container.register(USER_TOKENS.UserRepository, {useValue: userRepositoryCreator()});
container.register(USER_TOKENS.RefreshTokenRepository, {useValue: refreshTokenRepositoryCreator()});
container.register(USER_TOKENS.PasswordService, {useValue: passwordServiceCreator()});
container.register(USER_TOKENS.JwtService, {useValue: jwtServiceCreator()});
container.register(USER_TOKENS.RefreshTokenService, {useValue: refreshTokenServiceCreator()});

export {container};
