import express, {Request, Response} from 'express';
import {matchedData, param, query} from 'express-validator';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {Op, Sequelize} from 'sequelize';
import {injectable} from 'tsyringe';

import {
  ClassDto,
  ClassModel,
  CourseModel,
  EnrollmentsModel,
  mediatR,
  NotFoundError,
  PaginatedRequest,
  PaginatedResponse,
  UserRole,
  validateRequest,
} from '@/shared';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes:
 *   get:
 *     summary: List classes
 *     description: >
 *       Returns a list of classes for a course.
 *       Admins see all classes with total count.
 *       Regular users see only classes they are enrolled in or open for registration.
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
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassesListResponse'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 */
router.get(
  '/api/v1/courses/:courseId/classes',
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    query('take').optional().isInt({min: 1}).toInt(),
    query('skip').optional().isInt({min: 0}).toInt(),
  ],
  validateRequest,
  async (req: Request<{courseId: string}>, res: Response) => {
    const courseId = req.params.courseId;
    const {page, pageSize} = matchedData(req, {locations: ['query']});

    const result = await mediatR.send(
      new ListClassesQuery(courseId, page, pageSize, req.currentUser!.role, req.currentUser!.id)
    );

    res.status(200).send(result);
  }
);

export class ListClassesQuery extends RequestData<ListClassesResponse> implements PaginatedRequest {
  public readonly courseId: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly take: number;
  public readonly skip: number;

  constructor(
    courseId: string,
    page: number = 1,
    pageSize: number = 10,
    public readonly role: UserRole,
    public readonly userId: string
  ) {
    super();
    this.courseId = courseId;
    this.page = page;
    this.pageSize = pageSize;
    this.take = pageSize;
    this.skip = (page - 1) * pageSize;
  }
}

export class ListClassesResponse extends PaginatedResponse<ClassDto> {}

@injectable()
@requestHandler(ListClassesQuery)
export class ListClassesQueryHandler implements RequestHandler<ListClassesQuery, ListClassesResponse> {
  async handle(input: ListClassesQuery): Promise<ListClassesResponse> {
    const {take, skip, page, pageSize, role, userId, courseId} = input;

    const course = await CourseModel.findByPk(courseId, {useMaster: false});
    if (!course) {
      throw new NotFoundError(`Course with ID ${courseId} not found`);
    }

    let count: number;
    let rows: ClassModel[];

    if (role === UserRole.admin) {
      // Admin: unrestricted paginated list
      ({rows, count} = await ClassModel.findAndCountAll({
        limit: take,
        offset: skip,
        order: [['created_at', 'DESC']],
        include: [{model: CourseModel, as: 'course', attributes: ['name']}],
        useMaster: false,
        where: {courseId},
      }));
    } else {
      // Regular user: courses they are enrolled in OR courses that have a class
      // with registration deadline in the future
      const now = new Date();
      ({rows, count} = await ClassModel.findAndCountAll({
        where: {
          courseId,
          [Op.or]: [
            {registrationDeadline: {[Op.gt]: now}},
            Sequelize.literal(
              `EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = ClassModel.id AND enrollments.user_id = '${userId}')`
            ),
          ],
        },
        include: [
          {
            model: EnrollmentsModel,
            as: 'enrollments',
            attributes: [],
            required: false,
            where: {userId},
          },
          {
            model: CourseModel,
            as: 'course',
            attributes: ['name'],
          },
        ],
        limit: take,
        offset: skip,
        order: [['created_at', 'DESC']],
        useMaster: false,
        distinct: true,
      }));
    }

    const data = rows.map(row => row.toClassDto(course.name));

    return new ListClassesResponse({data, total: count, page, pageSize});
  }
}

export {router as listClassesRouter};
