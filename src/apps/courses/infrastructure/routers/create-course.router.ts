import express, {Request, Response} from 'express';
import {body, matchedData} from 'express-validator';

import {CreateCourseCommand} from '@/apps/courses/application/commands/create-course/create-course.command';
import {mediatR} from '@/config/infrastructure/mediatr';
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
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
    const course = await mediatR.send(new CreateCourseCommand(name, description));
    res.status(201).send(course);
  }
);

export {router as createCourseRouter};
