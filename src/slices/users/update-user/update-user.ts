import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {DI_TOKENS, mediatR, NotFoundError, PasswordServiceInterface, requireRole, UserModel, UserRole} from '@/shared';
import {validate} from '@/shared/middleware';

import {UPDATE_USER_BODY_SCHEMA, UPDATE_USER_PARAMS_SCHEMA} from './update-user.schema';

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
  validate({params: UPDATE_USER_PARAMS_SCHEMA, body: UPDATE_USER_BODY_SCHEMA}),
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const {name, password} = req.body;
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
