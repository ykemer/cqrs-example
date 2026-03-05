import express, {Request, Response} from 'express';
import {param} from 'express-validator';

import {DeleteCourseCommand} from '@/apps/courses/application/commands/delete-course/delete-course.command';
import {mediatR} from '@/config/infrastructure/mediatr';
import {requireRole, validateRequest} from '@/config/infrastructure/middleware';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

const router = express.Router();

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     description: Deletes a course. Fails if there are enrolled users. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Course ID
 *     responses:
 *       204:
 *         description: Course deleted successfully
 *       400:
 *         description: Course has enrolled users
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
 *         description: Course not found
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
  '/api/v1/courses/:id',
  [param('id').isUUID().withMessage('Course ID must be a valid UUID')],
  validateRequest,
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await mediatR.send(new DeleteCourseCommand(id));
    res.status(204).send();
  }
);

export {router as deleteCourseRouter};
