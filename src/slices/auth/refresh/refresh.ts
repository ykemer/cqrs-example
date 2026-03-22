import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {BadRequestError, DI_TOKENS, JwtServiceInterface, RefreshTokenModel, UserModel} from '@/shared';
import {mediatR} from '@/shared/mediatr';
import {validate} from '@/shared/middleware';
import {sequelize} from '@/shared/persistence/database';
import {RefreshTokenServiceInterface} from '@/shared/services/refresh-rokens-service';

import {REFRESH_BODY_SCHEMA, RefreshBody} from './refresh.schema';

const router = express.Router();

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token
 *     description: Rotate refresh token and get new access token. Requires a valid refresh token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTokenResponse'
 *       400:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 *       500:
 *         description: Server error
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 */
router.post(
  '/api/v1/auth/refresh',
  validate<unknown, unknown, RefreshBody>({body: REFRESH_BODY_SCHEMA}),
  async (req: Request<RefreshBody>, res: Response) => {
    const {refreshToken} = req.body;
    const result = await mediatR.send(new UpdateRefreshTokenCommand(refreshToken));
    res.status(200).send(result);
  }
);

export class UpdateRefreshTokenCommand extends RequestData<UpdateRefreshTokenResponse> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}

class UpdateRefreshTokenResponse {
  refreshToken: string;
  access_token: string;
  expires_in: number;
}

@injectable()
@requestHandler(UpdateRefreshTokenCommand)
export class UpdateRefreshTokenCommandHandler implements RequestHandler<
  UpdateRefreshTokenCommand,
  UpdateRefreshTokenResponse
> {
  constructor(
    @inject(DI_TOKENS.JwtService) private readonly jwtService: JwtServiceInterface,
    @inject(DI_TOKENS.RefreshTokenService) private readonly refreshTokenService: RefreshTokenServiceInterface
  ) {}

  async handle(input: UpdateRefreshTokenCommand) {
    return await sequelize.transaction(async t => {
      const existing = await RefreshTokenModel.findOne({
        where: {token: input.refreshToken},
        useMaster: true,
        transaction: t,
      });
      if (!existing) {
        throw new BadRequestError('Invalid refresh token');
      }

      if (!existing.isValid()) {
        throw new BadRequestError('Refresh token expired');
      }

      const user = await UserModel.findByPk(existing.userId, {useMaster: true, transaction: t});
      if (!user) throw new BadRequestError('Invalid refresh token');

      await RefreshTokenModel.destroy({where: {id: existing.id}, transaction: t});

      const newTokenEntity = this.refreshTokenService.generateRefreshToken(user.id);
      await RefreshTokenModel.create(
        {
          id: newTokenEntity.id,
          userId: newTokenEntity.userId,
          token: newTokenEntity.token,
          expiresAt: newTokenEntity.expiresAt,
          createdAt: newTokenEntity.createdAt,
        },
        {useMaster: true, transaction: t}
      );

      const jwtResponse = this.jwtService.getSignedJwtTokenResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return {
        access_token: jwtResponse.access_token,
        expires_in: jwtResponse.expires_in,
        refreshToken: newTokenEntity.token,
      };
    });
  }
}

export {router as refreshRouter};
