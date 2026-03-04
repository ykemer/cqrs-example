import express, {Request, Response} from 'express';
import {body, matchedData, param} from 'express-validator';

import {UpdateCourseCommand} from '@/apps/courses/application/commands/update-course/update-course.command';
import {coursesMediator} from '@/apps/courses/infrastructure/mediator/courses-mediator.setup';
import {requireRole, validateRequest} from '@/config/infrastructure/middleware';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

const router = express.Router();

/**
 * @swagger
 * /courses/{id}:
 *   patch:
 *     summary: Update a course
 *     description: Updates an existing course. Requires admin privileges.
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
 *       200:
 *         description: Course updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/api/v1/courses/:id',
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  validateRequest,
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const {name, description} = matchedData(req, {locations: ['body']});
    const course = await coursesMediator.send(new UpdateCourseCommand(id, name, description));
    res.status(200).send(course);
  }
);

export {router as updateCourseRouter};
