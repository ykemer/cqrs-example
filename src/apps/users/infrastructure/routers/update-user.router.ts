import express, {Request, Response} from 'express';
import {body, matchedData, param} from 'express-validator';

import {UpdateUserCommand} from '@/apps/users/application/commands/update-user/update-user.command';
import {mediatR} from '@/config/infrastructure/mediatr';
import {requireRole, validateRequest} from '@/config/infrastructure/middleware';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

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
    body('name').optional().isString().trim().notEmpty().withMessage('Name must be a non-empty string'),
    body('password')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({min: 4, max: 20})
      .withMessage('Password must be between 4 and 20 characters'),
    body('role').optional().isIn(Object.values(UserRole)).withMessage('Role must be valid'),
  ],
  validateRequest,
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updates = matchedData(req, {locations: ['body']});
    await mediatR.send(new UpdateUserCommand(id, updates));
    res.status(204).send();
  }
);

export {router as updateUserRouter};
