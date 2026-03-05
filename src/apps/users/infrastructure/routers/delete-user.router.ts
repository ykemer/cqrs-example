import express, {Request, Response} from 'express';
import {param} from 'express-validator';

import {DeleteUserCommand} from '@/apps/users/application/commands/delete-user/delete-user.command';
import {mediatR} from '@/config/infrastructure/mediatr';
import {requireRole, validateRequest} from '@/config/infrastructure/middleware';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

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

export {router as deleteUserRouter};
