import express, {Request, Response} from 'express';
import {param} from 'express-validator';

import {GetClassQuery} from '@/apps/classes/application/queries/get-class/get-class.query';
import {classesMediator} from '@/apps/classes/infrastructure/mediator/classes-mediator.setup';
import {validateRequest} from '@/config/infrastructure/middleware';
import {NotFoundError} from '@/libs/dto/domain';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{id}:
 *   get:
 *     summary: Get a class by ID
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
 *       200:
 *         description: Class details
 *       404:
 *         description: Class not found
 */
router.get(
  '/api/v1/courses/:courseId/classes/:id',
  [
    param('id').isUUID().withMessage('ID must be a valid UUID'),
    param('courseId').isUUID().withMessage('ID must be a valid UUID'),
  ],
  validateRequest,
  async (req: Request<{courseId: string; id: string}>, res: Response) => {
    const {id, courseId} = req.params;
    const result = await classesMediator.send(new GetClassQuery(courseId, id));
    if (!result) throw new NotFoundError('Class not found');
    res.send(result);
  }
);

export {router as getClassRouter};
