import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {ClassDto, ClassModel, CourseModel, mediatR, NotFoundError, requireRole, UserRole} from '@/shared';
import {validate} from '@/shared/middleware';

import {GET_CLASS_PARAMS_SCHEMA} from './get-class.schema';

type GetClassParams = {
  courseId: string;
  classId: string;
};

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{classId}:
 *   get:
 *     summary: Get a class by ID
 *     description: Returns a single class by its ID. Requires authentication.
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
 *       200:
 *         description: Class details
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
router.get(
  '/api/v1/courses/:courseId/classes/:classId',
  validate<GetClassParams>({params: GET_CLASS_PARAMS_SCHEMA}),
  requireRole([UserRole.admin]),
  async (req: Request, res: Response) => {
    const classId = req.params.classId as string;
    const courseId = req.params.courseId as string;
    const result = await mediatR.send(new GetClassQuery(courseId, classId));
    res.status(200).send(result);
  }
);

export class GetClassQuery extends RequestData<ClassDto> {
  constructor(
    public readonly courseId: string,
    public readonly classId: string
  ) {
    super();
  }
}

@injectable()
@requestHandler(GetClassQuery)
export class GetClassQueryHandler implements RequestHandler<GetClassQuery, ClassDto | null> {
  async handle(query: GetClassQuery): Promise<ClassDto | null> {
    const course = await CourseModel.findByPk(query.courseId, {useMaster: false});
    if (!course) {
      throw new NotFoundError(`Course ${query.classId} not found`);
    }

    const output = await ClassModel.findOne({
      where: {id: query.classId, courseId: query.courseId},
      include: [{model: CourseModel, as: 'course', attributes: ['name']}],
      useMaster: false,
    });

    if (output === null) {
      throw new NotFoundError(`Class ${query.classId} for course ${query.courseId} not found`);
    }
    return {
      id: output.id,
      courseId: output.courseId,
      name: course.name,
      maxUsers: output.maxUsers,
      enrolledUsers: output.enrolledUsers,
      registrationDeadline: output.registrationDeadline,
      startDate: output.startDate,
      endDate: output.endDate,
    };
  }
}

export {router as getClassRouter};
