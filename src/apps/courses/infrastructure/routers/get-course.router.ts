import express, {Request, Response} from 'express';
import {param} from 'express-validator';

import {GetCourseQuery} from '@/apps/courses/application/queries/get-course/get-course.query';
import {coursesMediator} from '@/apps/courses/infrastructure/mediator/courses-mediator.setup';
import {requireAuth, validateRequest} from '@/config/infrastructure/middleware';

const router = express.Router();

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     description: Returns a single course by its ID. Requires authentication.
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
 *       200:
 *         description: Course details
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get(
  '/api/v1/courses/:id',
  [param('id').isUUID().withMessage('Course ID must be a valid UUID')],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const course = await coursesMediator.send(new GetCourseQuery(id));
    res.status(200).send(course);
  }
);

export {router as getCourseRouter};
