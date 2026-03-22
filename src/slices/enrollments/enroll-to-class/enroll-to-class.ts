import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {
  BadRequestError,
  ClassModel,
  ConflictError,
  CourseModel,
  EnrollmentsModel,
  mediatR,
  NotFoundError,
  requireAuth,
  sequelize,
} from '@/shared';
import {UserEnrolledEvent} from '@/shared/domain/events';
import {validate} from '@/shared/middleware';

import {ENROLL_TO_CLASS_PARAMS_SCHEMA, EnrollToClassSchema} from './enroll-to-class.schema';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{classId}/enrollments:
 *   post:
 *     summary: Enroll to class
 *     description: Enroll a user to a class. Requires authentication.
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
 *         description: User enrolled
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
router.post(
  '/api/v1/courses/:courseId/classes/:classId/enrollments',
  validate<EnrollToClassSchema>({params: ENROLL_TO_CLASS_PARAMS_SCHEMA}),
  requireAuth,
  async (req: Request<EnrollToClassSchema>, res: Response) => {
    const {classId, courseId} = req.params;
    await mediatR.send(new EnrollToClassCommand(courseId, classId, req.currentUser.id));
    res.status(204).send();
  }
);

export class EnrollToClassCommand extends RequestData<void> {
  constructor(
    public readonly courseId: string,
    public readonly classId: string,
    public readonly userId: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(EnrollToClassCommand)
export class EnrollToClassHandler implements RequestHandler<EnrollToClassCommand, void> {
  async handle(command: EnrollToClassCommand): Promise<void> {
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

      if (classToEnroll.registrationDeadline < new Date()) {
        throw new BadRequestError('Registration deadline has passed for this class');
      }

      if (classToEnroll.maxUsers <= classToEnroll.enrolledUsers) {
        throw new BadRequestError('Class is full');
      }

      const existingEnrollment = await EnrollmentsModel.findOne({
        where: {
          classId: command.classId,
          userId: command.userId,
        },
        transaction: t,
        useMaster: true,
      });

      if (existingEnrollment !== null) {
        throw new ConflictError('User is already enrolled to this class');
      }

      await EnrollmentsModel.create(
        {
          classId: command.classId,
          userId: command.userId,
        },
        {transaction: t, useMaster: true}
      );

      await mediatR.publish(new UserEnrolledEvent(command.userId, command.classId));
    });
  }
}

export {router as enrollToClassRouter};
