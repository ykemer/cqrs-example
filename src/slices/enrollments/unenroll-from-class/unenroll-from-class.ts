import express, {Request, Response} from 'express';
import {param} from 'express-validator';
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
  validateRequest,
} from '@/shared';
import {UserUnenrolledEvent} from '@/shared/domain/events';

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
  [
    param('classId').isUUID().withMessage('ID must be a valid UUID'),
    param('courseId').isUUID().withMessage('ID must be a valid UUID'),
  ],
  validateRequest,
  requireAuth,
  async (req: Request<{courseId: string; classId: string}>, res: Response) => {
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
    const course = await CourseModel.findByPk(command.courseId, {useMaster: false});
    if (!course) {
      throw new NotFoundError(`Course ${command.courseId} not found`);
    }

    const classToEnroll = await ClassModel.findOne({
      where: {id: command.classId, courseId: command.courseId},
      useMaster: false,
    });
    if (!classToEnroll) {
      throw new NotFoundError(`Class ${command.classId} not found for course ${command.courseId}`);
    }

    const existingEnrollment = await EnrollmentsModel.findOne({
      where: {
        classId: command.classId,
        userId: command.userId,
      },
    });

    if (existingEnrollment === null) {
      throw new ConflictError('User is not enrolled to this class');
    }

    await existingEnrollment.destroy();
    await mediatR.publish(new UserUnenrolledEvent(command.userId, command.classId));
  }
}

export {router as unenrollFromClassRouter};
