import express, {Request, Response} from 'express';
import {param} from 'express-validator';
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
  validateRequest,
} from '@/shared';
import {UserEnrolledEvent} from '@/shared/domain/events';

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
  [
    param('classId').isUUID().withMessage('ID must be a valid UUID'),
    param('courseId').isUUID().withMessage('ID must be a valid UUID'),
  ],
  validateRequest,
  requireAuth,
  async (req: Request<{courseId: string; classId: string}>, res: Response) => {
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
    // verify the course exists
    const course = await CourseModel.findByPk(command.courseId, {useMaster: false});
    if (!course) {
      throw new NotFoundError(`Course ${command.courseId} not found`);
    }

    // verify the class exists and belongs to the course
    const classToEnroll = await ClassModel.findByPk(command.classId, {useMaster: false});
    if (!classToEnroll || classToEnroll.courseId !== command.courseId) {
      throw new NotFoundError(`Class ${command.classId} not found for course ${command.courseId}`);
    }

    // if registrationDeadline is before now, registration has passed
    if (classToEnroll.registrationDeadline < new Date()) {
      throw new BadRequestError('Registration deadline has passed for this class');
    }

    const existingEnrollment = await EnrollmentsModel.findOne({
      where: {
        classId: command.classId,
        userId: command.userId,
      },
    });

    if (existingEnrollment !== null) {
      throw new ConflictError('User is already enrolled to this class');
    }

    await EnrollmentsModel.create({
      classId: command.classId,
      userId: command.userId,
    });

    await mediatR.publish(new UserEnrolledEvent(command.userId, command.classId));
  }
}

export {router as enrollToClassRouter};
