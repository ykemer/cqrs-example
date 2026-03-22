import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {BadRequestError, ClassModel, mediatR, NotFoundError, requireRole, sequelize, UserRole} from '@/shared';
import {validate} from '@/shared/middleware';

import {DELETE_CLASS_PARAMS_SCHEMA} from './delete-class.schema';

type DeleteClassParams = {
  courseId: string;
  classId: string;
};

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{classId}:
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
 *         name: classId
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
  '/api/v1/courses/:courseId/classes/:classId',
  validate<DeleteClassParams>({params: DELETE_CLASS_PARAMS_SCHEMA}),
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const classId = req.params.classId as string;
    const courseId = req.params.courseId as string;
    await mediatR.send(new DeleteClassCommand(courseId, classId));
    res.status(204).send();
  }
);

export class DeleteClassCommand extends RequestData<void> {
  constructor(
    public readonly courseId: string,
    public readonly classId: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(DeleteClassCommand)
export class DeleteClassCommandHandler implements RequestHandler<DeleteClassCommand, void> {
  async handle(command: DeleteClassCommand): Promise<void> {
    return await sequelize.transaction(async t => {
      const existingClass = await ClassModel.findOne({
        where: {id: command.classId, courseId: command.courseId},
        transaction: t,
        useMaster: true,
      });

      if (existingClass === null) {
        throw new NotFoundError('Class not found');
      }

      if (existingClass.enrolledUsers > 0) {
        throw new BadRequestError('Can not delete class when it has enrolled users');
      }

      await ClassModel.destroy({where: {id: command.classId}, transaction: t});
    });
  }
}

export {router as deleteClassRouter};
