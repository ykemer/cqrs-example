import express, {Request, Response} from 'express';
import {param} from 'express-validator';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {mediatR, NotFoundError, requireRole, UserModel, UserRole, validateRequest} from '@/shared';

const router = express.Router();

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Deletes user. Requires admin privileges.
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
 *     responses:
 *       204:
 *         description: User deleted successfully
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
router.delete(
  '/api/v1/users/:id',
  [param('id').isString().notEmpty().isUUID().withMessage('User ID is required')],
  validateRequest,
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await mediatR.send(new DeleteUserCommand(id));
    res.status(204).send();
  }
);

export class DeleteUserCommand extends RequestData<void> {
  constructor(public readonly id: string) {
    super();
  }
}

@injectable()
@requestHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements RequestHandler<DeleteUserCommand, void> {
  async handle(input: DeleteUserCommand): Promise<void> {
    const {id} = input;
    const existingUser = await UserModel.findByPk(id, {useMaster: false});
    if (!existingUser) {
      throw new NotFoundError('Invalid user');
    }

    await UserModel.destroy({where: {id}});
  }
}

export {router as deleteUserRouter};
