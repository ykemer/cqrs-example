import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {ConflictError, DI_TOKENS, PasswordServiceInterface, UserModel} from '@/shared';
import {mediatR} from '@/shared/mediatr';
import {validate} from '@/shared/middleware';
import {sequelize} from '@/shared/persistence/database';

import {REGISTER_BODY_SCHEMA, RegisterBody} from './register.schema';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register
 *     description: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *               $ref: '#/components/schemas/UserRegisterRequest'
 *     responses:
 *       204:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 *       409:
 *         description: User already exists
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
  '/api/v1/auth/register',
  validate<unknown, unknown, RegisterBody>({body: REGISTER_BODY_SCHEMA}),
  async (req: Request<RegisterBody>, res: Response) => {
    const {email, name, password} = req.body;
    await mediatR.send(new RegisterCommand(name, email, password));
    res.status(204).send();
  }
);

export class RegisterCommand extends RequestData<void> {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(RegisterCommand)
export class RegisterCommandHandler implements RequestHandler<RegisterCommand, void> {
  constructor(@inject(DI_TOKENS.PasswordService) private readonly passwordService: PasswordServiceInterface) {}

  async handle(input: RegisterCommand): Promise<void> {
    const {name, email, password} = input;

    await sequelize.transaction(async t => {
      const existingUser = await UserModel.findOne({where: {email}, useMaster: true, transaction: t});
      if (existingUser) {
        throw new ConflictError('User already exists');
      }

      const hashedPassword = await this.passwordService.encode(password);
      await UserModel.create({name, email, password: hashedPassword}, {useMaster: true, transaction: t});
    });
  }
}

export {router as registerRouter};
