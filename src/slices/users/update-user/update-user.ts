import express, {Request, Response} from 'express';
import {body, matchedData, param} from 'express-validator';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {
  DI_TOKENS,
  mediatR,
  NotFoundError,
  PasswordServiceInterface,
  requireRole,
  UserModel,
  UserRole,
  validateRequest,
} from '@/shared';

const router = express.Router();

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user by ID
 *     description: Updates user information. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *               $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       204:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 *       404:
 *         description: User not found
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
router.patch(
  '/api/v1/users/:id',
  [
    param('id').isString().notEmpty().isUUID().withMessage('User ID is required'),
    body('name').isString().trim().notEmpty().withMessage('Name must be a non-empty string'),
    body('password')
      .isString()
      .trim()
      .notEmpty()
      .isLength({min: 4, max: 20})
      .withMessage('Password must be between 4 and 20 characters'),
    body('role').optional().isIn(Object.values(UserRole)).withMessage('Role must be valid'),
  ],
  validateRequest,
  requireRole([UserRole.admin]),
  async (req: Request<{id: string}>, res: Response) => {
    const id = req.params.id;
    const {name, password} = matchedData(req, {locations: ['body']});
    await mediatR.send(new UpdateUserCommand(id, name, password));
    res.status(204).send();
  }
);

export class UpdateUserCommand extends RequestData<void> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly password: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements RequestHandler<UpdateUserCommand, void> {
  constructor(@inject(DI_TOKENS.PasswordService) private readonly passwordService: PasswordServiceInterface) {}

  async handle(input: UpdateUserCommand): Promise<void> {
    const {id, name, password} = input;

    const existingUser = await UserModel.findByPk(id, {useMaster: false});
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    existingUser.name = name;
    existingUser.password = await this.passwordService.encode(password);

    await existingUser.save();
  }
}

export {router as updateUserRouter};
