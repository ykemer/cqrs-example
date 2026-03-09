import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {
  BadRequestError,
  DI_TOKENS,
  JwtServiceInterface,
  PasswordServiceInterface,
  RefreshTokenModel,
  UserModel,
  validateRequest,
} from '@/shared';
import {mediatR} from '@/shared/mediatr';
import {RefreshTokenServiceInterface} from '@/shared/services/refresh-rokens-service';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticate with email and password to receive a JWT access token and refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *               $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTokenResponse'
 *       400:
 *         description: Validation error or invalid credentials
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
  '/api/v1/auth/login',
  [
    body('email').trim().normalizeEmail().isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must provide a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {email, password} = req.body;
    const result = await mediatR.send(new LoginCommand(email, password));
    res.status(200).send(result);
  }
);

class LoginUserResponse {
  refreshToken: string;
  access_token: string;
  expires_in: number;
}

class LoginCommand extends RequestData<LoginUserResponse> {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(LoginCommand)
export class LoginCommandHandler implements RequestHandler<LoginCommand, LoginUserResponse> {
  constructor(
    @inject(DI_TOKENS.PasswordService) private readonly passwordService: PasswordServiceInterface,
    @inject(DI_TOKENS.JwtService) private readonly jwtService: JwtServiceInterface,
    @inject(DI_TOKENS.RefreshTokenService) private readonly refreshTokenService: RefreshTokenServiceInterface
  ) {}

  async handle(input: LoginCommand): Promise<LoginUserResponse> {
    const {email, password} = input;

    const existingUser = await UserModel.findOne({where: {email}, useMaster: false});
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

    const refreshTokenEntity = this.refreshTokenService.generateRefreshToken(existingUser.id);
    await RefreshTokenModel.create(
      {
        id: refreshTokenEntity.id,
        userId: refreshTokenEntity.userId,
        token: refreshTokenEntity.token,
        expiresAt: refreshTokenEntity.expiresAt,
        createdAt: refreshTokenEntity.createdAt ?? new Date(),
      },
      {useMaster: true}
    );

    return {
      access_token: jwtResponse.access_token,
      expires_in: jwtResponse.expires_in,
      refreshToken: refreshTokenEntity.token,
    };
  }
}

export {router as loginRouter};
