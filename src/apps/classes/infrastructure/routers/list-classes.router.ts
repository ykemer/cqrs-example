import express, {Request, Response} from 'express';
import {param, query} from 'express-validator';

import {GetClassesForUserQuery} from '@/apps/classes/application/queries/get-classes-for-user/get-classes-for-user.query';
import {GetClassesWithCountQuery} from '@/apps/classes/application/queries/get-classes-with-count/get-classes-with-count.query';
import {classesMediator} from '@/apps/classes/infrastructure/mediator/classes-mediator.setup';
import {validateRequest} from '@/config/infrastructure/middleware';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes:
 *   get:
 *     summary: List classes
 *     description: Returns a list of classes for a course. Admins see all, users see enrolled/open.
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
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of classes
 */
router.get(
  '/api/v1/courses/:courseId/classes',
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    query('take').optional().isInt({min: 1}).toInt(),
    query('skip').optional().isInt({min: 0}).toInt(),
  ],
  validateRequest,
  async (req: Request<{courseId: string}>, res: Response) => {
    const courseId = req.params.courseId;
    const take = (req.query.take as unknown as number) || 10;
    const skip = (req.query.skip as unknown as number) || 0;
    const user = req.currentUser!;

    let result;
    if (user.role === UserRole.admin) {
      result = await classesMediator.send(new GetClassesWithCountQuery(courseId, take, skip));
    } else {
      result = await classesMediator.send(new GetClassesForUserQuery(courseId, user.id, take, skip));
    }

    res.status(200).send(result);
  }
);

export {router as listClassesRouter};
