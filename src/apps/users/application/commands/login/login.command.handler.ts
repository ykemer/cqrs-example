import {RefreshTokenRepositoryInterface} from '@/apps/users/domain/persistence/refresh-token-repository-interface';
import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {RefreshTokenServiceInterface} from '@/apps/users/domain/services';
import {BadRequestError} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';
import {JwtServiceInterface, PasswordServiceInterface} from '@/libs/tools/domain';

import {LoginCommand} from './login.command';
import {LoginUserResponse} from './login-response';

export class LoginCommandHandler implements IHandler<LoginCommand, LoginUserResponse> {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordService: PasswordServiceInterface,
    private readonly jwtService: JwtServiceInterface,
    private readonly refreshTokenService: RefreshTokenServiceInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface
  ) {}

  async handle(input: LoginCommand): Promise<LoginUserResponse> {
    const {email, password} = input;

    const existingUser = await this.userRepository.findByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordMatch = await this.passwordService.compare(password, existingUser.password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const jwtResponse = this.jwtService.getSignedJwtTokenResponse({
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
    });

    // create and persist refresh token (write to master)
    const refreshTokenEntity = this.refreshTokenService.generateRefreshToken(existingUser.id);

    await this.refreshTokenRepository.create(refreshTokenEntity);

    return {
      ...jwtResponse,
      ...{
        refreshToken: refreshTokenEntity.token,
      },
    };
  }
}
