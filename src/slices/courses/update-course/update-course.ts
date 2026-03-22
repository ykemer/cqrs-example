import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {CourseModel, mediatR, NotFoundError, requireRole, sequelize, UserRole} from '@/shared';
import {validate} from '@/shared/middleware';

import {UPDATE_COURSE_BODY_SCHEMA, UPDATE_COURSE_PARAMS_SCHEMA} from './update-course.schema';

type UpdateCourseParams = {
  id: string;
};

type UpdateCourseBody = {
  name: string;
  description: string;
};

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
 *       204:
 *         description: Course updated successfully
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
router.patch(
  '/api/v1/courses/:id',
  validate<UpdateCourseParams, unknown, UpdateCourseBody>({
    params: UPDATE_COURSE_PARAMS_SCHEMA,
    body: UPDATE_COURSE_BODY_SCHEMA,
  }),
  requireRole([UserRole.admin]),
  async (req: Request<UpdateCourseParams, any, UpdateCourseBody>, res: Response) => {
    const {id} = req.params;
    const {name, description} = req.body;
    await mediatR.send(new UpdateCourseCommand(id, name, description));
    res.status(204).send();
  }
);

export class UpdateCourseCommand extends RequestData<void> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(UpdateCourseCommand)
export class UpdateCourseCommandHandler implements RequestHandler<UpdateCourseCommand, void> {
  async handle(input: UpdateCourseCommand): Promise<void> {
    const {id, name, description} = input;

    await sequelize.transaction(async t => {
      const course = await CourseModel.findByPk(id, {transaction: t, useMaster: true});
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      course.set({
        name,
        description,
        updatedAt: new Date(),
      });

      await course.save({transaction: t});
    });
  }
}

export {router as updateCourseRouter};
