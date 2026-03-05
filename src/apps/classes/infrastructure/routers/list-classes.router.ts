import express, {Request, Response} from 'express';
import {matchedData, param, query} from 'express-validator';

import {ListClassesQuery} from '@/apps/classes/application/queries/list-classes/list-classes.query';
import {mediatR} from '@/config/infrastructure/mediatr';
import {validateRequest} from '@/config/infrastructure/middleware';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes:
 *   get:
 *     summary: List classes
 *     description: >
 *       Returns a list of classes for a course.
 *       Admins see all classes with total count.
 *       Regular users see only classes they are enrolled in or open for registration.
 *     security:
 *       - bearerAuth: []
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassesListResponse'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
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
    const {page, pageSize} = matchedData(req, {locations: ['query']});

    const result = await mediatR.send(
      new ListClassesQuery(courseId, page, pageSize, req.currentUser!.role, req.currentUser!.id)
    );

    res.status(200).send(result);
  }
);

export {router as listClassesRouter};
