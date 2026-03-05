import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {RefreshTokenRepositoryInterface} from '@/apps/users/domain/persistence/refresh-token-repository-interface';
import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {RefreshTokenServiceInterface} from '@/apps/users/domain/services';
import {USER_TOKENS} from '@/apps/users/infrastructure/di/tokens';
import {BadRequestError} from '@/libs/dto/domain';
import {JwtServiceInterface} from '@/libs/tools/domain';

import {UpdateRefreshTokenCommand} from './update-refresh-token.command';

@injectable()
@requestHandler(UpdateRefreshTokenCommand)
export class UpdateRefreshTokenCommandHandler implements RequestHandler<UpdateRefreshTokenCommand, any> {
  constructor(
    @inject(USER_TOKENS.JwtService) private readonly jwtService: JwtServiceInterface,
    @inject(USER_TOKENS.RefreshTokenService) private readonly refreshTokenService: RefreshTokenServiceInterface,
    @inject(USER_TOKENS.UserRepository) private readonly userRepo: UserRepositoryInterface,
    @inject(USER_TOKENS.RefreshTokenRepository) private readonly refreshTokenRepo: RefreshTokenRepositoryInterface
  ) {}

  async handle(input: UpdateRefreshTokenCommand) {
    // read token from replica
    const existing = await this.refreshTokenRepo.findByToken(input.refreshToken);
    if (!existing || existing.revoked) {
      throw new BadRequestError('Invalid refresh token');
    }

    if (existing.expiresAt && new Date(existing.expiresAt).getTime() < Date.now()) {
      throw new BadRequestError('Refresh token expired');
    }

    const user = await this.userRepo.findById(existing.userId);
    if (!user) throw new BadRequestError('Invalid refresh token');

    await this.refreshTokenRepo.delete(existing.id);

    const mewTokenEntity = this.refreshTokenService.generateRefreshToken(user.id);
    await this.refreshTokenRepo.create(mewTokenEntity);

    const jwtResponse = this.jwtService.getSignedJwtTokenResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      ...jwtResponse,
      refreshToken: mewTokenEntity.token,
    };
  }
}
