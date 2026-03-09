import express, {Request, Response} from 'express';
import {param} from 'express-validator';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {BadRequestError, ClassModel, mediatR, NotFoundError, requireRole, UserRole, validateRequest} from '@/shared';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     description: Deletes a class. Requires admin privileges.
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
 *     responses:
 *       204:
 *         description: Class deleted successfully
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
router.delete(
  '/api/v1/courses/:courseId/classes/:id',
  [
    requireRole([UserRole.admin]),
    param('id').isUUID().withMessage('ID must be a valid UUID'),
    param('courseId').isUUID().withMessage('ID must be a valid UUID'),
  ],
  validateRequest,
  async (req: Request<{courseId: string; id: string}>, res: Response) => {
    const {id, courseId} = req.params;
    await mediatR.send(new DeleteClassCommand(courseId, id));
    res.status(204).send();
  }
);

export class DeleteClassCommand extends RequestData<void> {
  constructor(
    public readonly courseId: string,
    public readonly id: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(DeleteClassCommand)
export class DeleteClassCommandHandler implements RequestHandler<DeleteClassCommand, void> {
  async handle(command: DeleteClassCommand): Promise<void> {
    const existingClass = await ClassModel.findOne({
      where: {id: command.id, courseId: command.courseId},
      useMaster: true,
    });

    if (existingClass === null) {
      throw new NotFoundError('Class not found');
    }

    if (existingClass.enrolledUsers > 0) {
      throw new BadRequestError('Can not delete class when it has enrolled users');
    }

    await ClassModel.destroy({where: {id: command.id}});
  }
}

export {router as deleteClassRouter};
