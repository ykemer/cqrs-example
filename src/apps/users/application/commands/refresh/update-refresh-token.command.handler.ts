import {RefreshTokenRepositoryInterface} from '@/apps/users/domain/persistence/refresh-token-repository-interface';
import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {RefreshTokenServiceInterface} from '@/apps/users/domain/services';
import {BadRequestError} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';
import {JwtServiceInterface} from '@/libs/tools/domain';

import {UpdateRefreshTokenCommand} from './update-refresh-token.command';

export class UpdateRefreshTokenCommandHandler implements IHandler<UpdateRefreshTokenCommand, any> {
  constructor(
    private readonly jwtService: JwtServiceInterface,
    private readonly refreshTokenService: RefreshTokenServiceInterface,
    private readonly userRepo: UserRepositoryInterface,
    private readonly refreshTokenRepo: RefreshTokenRepositoryInterface
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
