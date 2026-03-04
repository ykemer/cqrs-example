import express, {Request, Response} from 'express';
import {param} from 'express-validator';

import {DeleteClassCommand} from '@/apps/classes/application/commands/delete-class/delete-class.command';
import {classesMediator} from '@/apps/classes/infrastructure/mediator/classes-mediator.setup';
import {requireRole, validateRequest} from '@/config/infrastructure/middleware';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     description: Deletes a class. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       204:
 *         description: Class deleted
 */
router.delete(
  '/api/v1/courses/:courseId/classes/:id',
  [
    requireRole([UserRole.admin]),
    param('id').isUUID().withMessage('ID must be a valid UUID'),
    param('courseId').isUUID().withMessage('ID must be a valid UUID'),
  ],
  validateRequest,
  async (req: Request<{courseId: string; id: string}>, res: Response) => {
    const {id, courseId} = req.params;
    await classesMediator.send(new DeleteClassCommand(courseId, id));
    res.status(204).send();
  }
);

export {router as deleteClassRouter};
