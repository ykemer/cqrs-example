import express, {Request, Response} from 'express';
import {body, matchedData, param} from 'express-validator';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {
  ClassDto,
  ClassModel,
  CourseModel,
  mediatR,
  NotFoundError,
  requireRole,
  UserRole,
  validateRequest,
} from '@/shared';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes:
 *   post:
 *     summary: Create a class
 *     description: Creates a new class for a course. Requires admin privileges.
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
 *       201:
 *         description: Class created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassResponse'
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
  '/api/v1/courses/:courseId/classes',
  [
    requireRole([UserRole.admin]),
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    body('maxUsers').isInt({min: 1}).withMessage('Max users must be at least 1'),
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
    body('endDate').isISO8601().toDate().withMessage('End date must be a valid date'),
  ],
  validateRequest,
  async (req: Request<{courseId: string}>, res: Response) => {
    const {courseId} = req.params;
    const bodyData = matchedData<UpsertClassPayload>(req, {locations: ['body']});
    const command = new CreateClassCommand();
    command.courseId = courseId;
    command.maxUsers = bodyData.maxUsers;
    command.registrationDeadline = bodyData.registrationDeadline;
    command.startDate = bodyData.startDate;
    command.endDate = bodyData.endDate;

    const result = await mediatR.send(command);
    res.status(201).send(result);
  }
);

type UpsertClassPayload = {
  maxUsers: number;
  registrationDeadline: Date;
  startDate: Date;
  endDate: Date;
};

class CreateClassCommand extends RequestData<ClassDto> {
  courseId: string;
  maxUsers: number;
  registrationDeadline: Date;
  startDate: Date;
  endDate: Date;
}

@injectable()
@requestHandler(CreateClassCommand)
export class CreateClassCommandHandler implements RequestHandler<CreateClassCommand, ClassDto> {
  async handle(command: CreateClassCommand): Promise<ClassDto> {
    const course = await CourseModel.findOne({
      where: {id: command.courseId},
      attributes: ['name'],
      useMaster: true,
    });

    if (course === null) {
      throw new NotFoundError('Course not found');
    }

    const created = await ClassModel.create(
      {
        courseId: command.courseId,
        maxUsers: command.maxUsers,
        registrationDeadline: command.registrationDeadline,
        startDate: command.startDate,
        endDate: command.endDate,
      },
      {useMaster: true}
    );

    return created.toClassDto(course.name);
  }
}

export {router as createClassRouter};
