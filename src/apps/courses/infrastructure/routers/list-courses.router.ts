import express, {Request, Response} from 'express';
import {matchedData, query} from 'express-validator';

import {ListCoursesQuery} from '@/apps/courses/application/queries/list-courses/list-courses.query';
import {coursesMediator} from '@/apps/courses/infrastructure/mediator/courses-mediator.setup';
import {requireAuth, validateRequest} from '@/config/infrastructure/middleware';

const router = express.Router();

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: List courses
 *     description: >
 *       Returns a paginated list of courses.
 *       Admins see all courses.
 *       Regular users see only courses they are enrolled in or courses
 *       that have a class with a registration deadline in the future.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of courses
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get(
  '/api/v1/courses',
  [
    query('page').default(1).isInt({min: 1}).toInt().withMessage('page must be a number greater than 0'),
    query('pageSize').default(10).isInt({min: 1, max: 10}).toInt().withMessage('pageSize must be between 1 and 10'),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const {page, pageSize} = matchedData(req, {locations: ['query']});
    const result = await coursesMediator.send(
      new ListCoursesQuery(page, pageSize, req.currentUser!.role, req.currentUser!.id)
    );
    res.status(200).send(result);
  }
);

export {router as listCoursesRouter};
