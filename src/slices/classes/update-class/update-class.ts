import express, {Request, Response} from 'express';
import {body, matchedData, param} from 'express-validator';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {
  BadRequestError,
  ClassModel,
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
 * /courses/{courseId}/classes/{classId}:
 *   put:
 *     summary: Update a class
 *     description: Updates an existing class. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [maxUsers, registrationDeadline, startDate, endDate]
 *             properties:
 *               maxUsers:
 *                 type: number
 *               registrationDeadline:
 *                 type: string
 *                 format: date-time
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       204:
 *         description: Class updated
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
router.put(
  '/api/v1/courses/:courseId/classes/:classId',
  [
    requireRole([UserRole.admin]),
    param('classId').isUUID().withMessage('ID must be a valid UUID'),
    param('courseId').isUUID().withMessage('ID must be a valid UUID'),
    body('maxUsers').optional().isInt({min: 1}),
    body('registrationDeadline')
      .isISO8601()
      .toDate()
      .withMessage('Registration deadline must be a valid date')
      .custom((value, {req}) => {
        if (new Date(value) >= new Date(req.body.startDate)) {
          throw new Error('Registration deadline must be before start date');
        }
        return true;
      }),
    body('startDate')
      .isISO8601()
      .toDate()
      .withMessage('Start date must be a valid date')
      .custom((value, {req}) => {
        if (new Date(value) >= new Date(req.body.endDate)) {
          throw new Error('Start date must be before end date');
        }
        return true;
      }),
    body('endDate').optional().isISO8601().toDate(),
  ],
  validateRequest,
  async (req: Request<{courseId: string; classId: string}>, res: Response) => {
    const {courseId, classId} = req.params;
    const bodyData = matchedData<UpsertClassPayload>(req, {locations: ['body']});
    const command = new UpdateClassCommand();
    command.id = classId;
    command.courseId = courseId;
    command.maxUsers = bodyData.maxUsers;
    command.registrationDeadline = bodyData.registrationDeadline;
    command.startDate = bodyData.startDate;
    command.endDate = bodyData.endDate;

    await mediatR.send(command);
    res.status(204).send();
  }
);

export class UpdateClassCommand extends RequestData<void> {
  id: string;
  courseId: string;
  maxUsers: number;
  registrationDeadline: Date;
  startDate: Date;
  endDate: Date;
}

type UpsertClassPayload = {
  maxUsers: number;
  registrationDeadline: Date;
  startDate: Date;
  endDate: Date;
};

@injectable()
@requestHandler(UpdateClassCommand)
export class UpdateClassCommandHandler implements RequestHandler<UpdateClassCommand, void> {
  async handle(command: UpdateClassCommand): Promise<void> {
    return await sequelize.transaction(async t => {
      const course = await CourseModel.findOne({
        where: {id: command.courseId},
        attributes: ['name'],
        transaction: t,
        useMaster: true,
      });

      if (course === null) {
        throw new NotFoundError('Course not found');
      }

      const existing = await ClassModel.findOne({
        where: {id: command.id, courseId: command.courseId},
        transaction: t,
        useMaster: true,
      });

      if (existing === null) {
        throw new NotFoundError('Class not found');
      }

      if (existing.enrolledUsers > command.maxUsers) {
        throw new BadRequestError(
          `Cannot set max users to ${command.maxUsers} because there are already ${existing.enrolledUsers} enrolled users`
        );
      }

      existing.set({
        maxUsers: command.maxUsers,
        registrationDeadline: command.registrationDeadline,
        startDate: command.startDate,
        endDate: command.endDate,
        updatedAt: new Date(),
      });

      await existing.save({transaction: t});
    });
  }
}

export {router as updateClassRouter};
