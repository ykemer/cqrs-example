import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {RefreshTokenRepositoryInterface} from '@/apps/users/domain/persistence/refresh-token-repository-interface';
import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {RefreshTokenServiceInterface} from '@/apps/users/domain/services';
import {USER_TOKENS} from '@/apps/users/infrastructure/di/tokens';
import {BadRequestError} from '@/libs/dto/domain';
import {JwtServiceInterface, PasswordServiceInterface} from '@/libs/tools/domain';

import {LoginCommand} from './login.command';
import {LoginUserResponse} from './login-response';

@injectable()
@requestHandler(LoginCommand)
export class LoginCommandHandler implements RequestHandler<LoginCommand, LoginUserResponse> {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: UserRepositoryInterface,
    @inject(USER_TOKENS.PasswordService) private readonly passwordService: PasswordServiceInterface,
    @inject(USER_TOKENS.JwtService) private readonly jwtService: JwtServiceInterface,
    @inject(USER_TOKENS.RefreshTokenService) private readonly refreshTokenService: RefreshTokenServiceInterface,
    @inject(USER_TOKENS.RefreshTokenRepository) private readonly refreshTokenRepository: RefreshTokenRepositoryInterface
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
