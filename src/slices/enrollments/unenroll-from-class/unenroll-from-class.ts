import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {
  ClassModel,
  ConflictError,
  CourseModel,
  EnrollmentsModel,
  mediatR,
  NotFoundError,
  requireAuth,
  sequelize,
} from '@/shared';
import {UserUnenrolledEvent} from '@/shared/domain/events';
import {validate} from '@/shared/middleware';

import {UNENROLL_FROM_CLASS_PARAMS_SCHEMA} from './unenroll-from-class.schema';

type UnenrollFromClassParams = {
  classId: string;
  courseId: string;
};

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{classId}/enrollments:
 *   delete:
 *     summary: Unenroll from class
 *     description: Unenroll a user from a class. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Class ID
 *     responses:
 *       204:
 *         description: User unenrolled successfully
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
 *       404:
 *         description: Class not found
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
  '/api/v1/courses/:courseId/classes/:classId/enrollments',
  validate<UnenrollFromClassParams>({params: UNENROLL_FROM_CLASS_PARAMS_SCHEMA}),
  requireAuth,
  async (req: Request<UnenrollFromClassParams>, res: Response) => {
    const {classId, courseId} = req.params;
    await mediatR.send(new UnenrollFromClassCommand(classId, courseId, req.currentUser.id));
    res.status(204).send();
  }
);

export class UnenrollFromClassCommand extends RequestData<void> {
  constructor(
    public readonly classId: string,
    public readonly courseId: string,
    public readonly userId: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(UnenrollFromClassCommand)
export class UnenrollFromClassHandler implements RequestHandler<UnenrollFromClassCommand, void> {
  async handle(command: UnenrollFromClassCommand): Promise<void> {
    return await sequelize.transaction(async t => {
      const course = await CourseModel.findByPk(command.courseId, {transaction: t, useMaster: true});
      if (!course) {
        throw new NotFoundError(`Course ${command.courseId} not found`);
      }

      const classToEnroll = await ClassModel.findOne({
        where: {id: command.classId, courseId: command.courseId},
        transaction: t,
        useMaster: true,
      });
      if (!classToEnroll) {
        throw new NotFoundError(`Class ${command.classId} not found for course ${command.courseId}`);
      }

      const existingEnrollment = await EnrollmentsModel.findOne({
        where: {
          classId: command.classId,
          userId: command.userId,
        },
        transaction: t,
        useMaster: true,
      });

      if (existingEnrollment === null) {
        throw new ConflictError('User is not enrolled to this class');
      }

      await existingEnrollment.destroy({transaction: t});
      await mediatR.publish(new UserUnenrolledEvent(command.userId, command.classId));
    });
  }
}

export {router as unenrollFromClassRouter};
