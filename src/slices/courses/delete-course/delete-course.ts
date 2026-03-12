import express, {Request, Response} from 'express';
import {param} from 'express-validator';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {
  BadRequestError,
  CourseModel,
  mediatR,
  NotFoundError,
  requireRole,
  sequelize,
  UserRole,
  validateRequest,
} from '@/shared';

const router = express.Router();

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     description: Deletes a course. Fails if there are enrolled users. Requires admin privileges.
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
 *       204:
 *         description: Course deleted successfully
 *       400:
 *         description: Course has enrolled users
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
router.delete(
  '/api/v1/courses/:id',
  [param('id').isUUID().withMessage('Course ID must be a valid UUID')],
  validateRequest,
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await mediatR.send(new DeleteCourseCommand(id));
    res.status(204).send();
  }
);

class DeleteCourseCommand extends RequestData<void> {
  constructor(public readonly id: string) {
    super();
  }
}

@injectable()
@requestHandler(DeleteCourseCommand)
export class DeleteCourseCommandHandler implements RequestHandler<DeleteCourseCommand, void> {
  async handle(input: DeleteCourseCommand): Promise<void> {
    const {id} = input;

    await sequelize.transaction(async t => {
      const course = await CourseModel.findByPk(id, {transaction: t, useMaster: true});
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      if (course.enrolledUsers > 0) {
        throw new BadRequestError('Cannot delete a course with enrolled users');
      }

      await CourseModel.destroy({where: {id: course.id}, transaction: t});
    });
  }
}

export {router as deleteCourseRouter};
