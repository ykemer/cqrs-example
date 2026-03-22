import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {
  BadRequestError,
  ClassDto,
  ClassModel,
  CourseModel,
  mediatR,
  NotFoundError,
  requireRole,
  sequelize,
  UpsertClassPayload,
  UserRole,
} from '@/shared';
import {validate} from '@/shared/middleware';

import {CREATE_CLASS_BODY_SCHEMA, CREATE_CLASS_PARAMS_SCHEMA} from './create-class.schema';

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
  requireRole([UserRole.admin]),
  validate({params: CREATE_CLASS_PARAMS_SCHEMA, body: CREATE_CLASS_BODY_SCHEMA}),
  async (req: Request, res: Response) => {
    const {courseId} = req.params as unknown as {courseId: string};
    const bodyData = req.body as unknown as UpsertClassPayload;
    const command = new CreateClassCommand();
    command.courseId = courseId;
    command.maxUsers = bodyData.maxUsers;
    command.registrationDeadline = new Date(bodyData.registrationDeadline);
    command.startDate = new Date(bodyData.startDate);
    command.endDate = new Date(bodyData.endDate);

    const result = await mediatR.send(command);
    res.status(201).send(result);
  }
);

export class CreateClassCommand extends RequestData<ClassDto> {
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
    // Validate date constraints
    if (command.registrationDeadline >= command.startDate) {
      throw new BadRequestError('Registration deadline must be before start date');
    }
    if (command.startDate >= command.endDate) {
      throw new BadRequestError('Start date must be before end date');
    }

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

      const created = await ClassModel.create(
        {
          courseId: command.courseId,
          maxUsers: command.maxUsers,
          registrationDeadline: command.registrationDeadline,
          startDate: command.startDate,
          endDate: command.endDate,
        },
        {transaction: t, useMaster: true}
      );

      return created.toClassDto(course.name);
    });
  }
}

export {router as createClassRouter};
