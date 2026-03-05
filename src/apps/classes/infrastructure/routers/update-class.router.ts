import express, {Request, Response} from 'express';
import {body, matchedData, param} from 'express-validator';

import {UpdateClassCommand} from '@/apps/classes/application/commands/update-class/update-class.command';
import {UpsertClassPayload} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {mediatR} from '@/config/infrastructure/mediatr';
import {requireRole, validateRequest} from '@/config/infrastructure/middleware';
import {NotFoundError} from '@/libs/dto/domain';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{id}:
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
 *       200:
 *         description: Class updated
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
  '/api/v1/courses/:courseId/classes/:id',
  [
    requireRole([UserRole.admin]),
    param('id').isUUID().withMessage('ID must be a valid UUID'),
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
  async (req: Request<{courseId: string; id: string}>, res: Response) => {
    const {id, courseId} = req.params;
    const data = matchedData<UpsertClassPayload>(req, {locations: ['body']});

    const result = await mediatR.send(new UpdateClassCommand(courseId, id, data));
    if (!result) throw new NotFoundError('Class not found');

    res.status(200).send(result);
  }
);

export {router as updateClassRouter};
