// TypeScript
import express, {Request, Response} from 'express';
import {body, matchedData, param} from 'express-validator';

import {CreateClassCommand} from '@/apps/classes/application/commands/create-class/create-class.command';
import {UpsertClassPayload} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {classesMediator} from '@/apps/classes/infrastructure/mediator/classes-mediator.setup';
import {requireRole, validateRequest} from '@/config/infrastructure/middleware';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

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
 *       400:
 *         description: Bad request
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

    const payload: UpsertClassPayload = {
      maxUsers: bodyData.maxUsers!,
      registrationDeadline: bodyData.registrationDeadline as unknown as Date,
      startDate: bodyData.startDate as unknown as Date,
      endDate: bodyData.endDate as unknown as Date,
    };

    const result = await classesMediator.send(new CreateClassCommand(courseId, payload));
    res.status(201).send(result);
  }
);

export {router as createClassRouter};
