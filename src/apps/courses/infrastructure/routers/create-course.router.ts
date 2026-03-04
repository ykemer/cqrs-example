import express, {Request, Response} from 'express';
import {body, matchedData} from 'express-validator';

import {CreateCourseCommand} from '@/apps/courses/application/commands/create-course/create-course.command';
import {coursesMediator} from '@/apps/courses/infrastructure/mediator/courses-mediator.setup';
import {requireRole, validateRequest} from '@/config/infrastructure/middleware';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

const router = express.Router();

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a course
 *     description: Creates a new course. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post(
  '/api/v1/courses',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  validateRequest,
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const {name, description} = matchedData(req, {locations: ['body']});
    const course = await coursesMediator.send(new CreateCourseCommand(name, description));
    res.status(201).send(course);
  }
);

export {router as createCourseRouter};
