import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {Op, Sequelize} from 'sequelize';
import {injectable} from 'tsyringe';

import {ClassModel, CourseModel, mediatR, PaginatedRequest, PaginatedResponse, requireAuth, UserRole} from '@/shared';
import {validate} from '@/shared/middleware';

import {LIST_COURSES_QUERY_SCHEMA} from './list-courses.schema';

type ListCoursesQueryParams = {
  page: number;
  pageSize: number;
};

const router = express.Router();

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: List courses
 *     description: >
 *       Returns a paginated list of courses.
 *       Admins see all courses.
 *       Regular users see only courses they are enrolled in or courses
 *       that have a class with a registration deadline in the future.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursesListResponse'
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
  '/api/v1/courses',
  validate<unknown, ListCoursesQueryParams>({query: LIST_COURSES_QUERY_SCHEMA}) as any,
  requireAuth,
  (async (req: Request<unknown, any, unknown, ListCoursesQueryParams>, res: Response) => {
    const {page, pageSize} = req.query;
    const result = await mediatR.send(new ListCoursesQuery(page, pageSize, req.currentUser!.role, req.currentUser!.id));
    res.status(200).send(result);
  }) as any
);

export class ListCoursesQuery extends RequestData<ListCoursesResponse> implements PaginatedRequest {
  public readonly page: number;
  public readonly pageSize: number;
  public readonly take: number;
  public readonly skip: number;

  constructor(
    page: number = 1,
    pageSize: number = 10,
    public readonly role: UserRole,
    public readonly userId: string
  ) {
    super();
    this.page = Number(page);
    this.pageSize = Number(pageSize);
    this.take = Number(pageSize);
    this.skip = (Number(page) - 1) * Number(pageSize);
  }
}

class CourseDto {
  id: string;
  name: string;
  description: string;
  enrolledUsers: number;
}

class ListCoursesResponse extends PaginatedResponse<CourseDto> {}

@injectable()
@requestHandler(ListCoursesQuery)
export class ListCoursesQueryHandler implements RequestHandler<ListCoursesQuery, ListCoursesResponse> {
  async handle(input: ListCoursesQuery): Promise<ListCoursesResponse> {
    const {take, skip, page, pageSize, role, userId} = input;

    let count: number;
    let rows: CourseModel[];

    if (role === UserRole.admin) {
      // Admin: unrestricted paginated list
      ({rows, count} = await CourseModel.findAndCountAll({
        limit: take,
        offset: skip,
        order: [['created_at', 'DESC']],
        useMaster: false,
      }));
    } else {
      const now = new Date();

      ({rows, count} = await CourseModel.findAndCountAll({
        limit: take,
        offset: skip,
        order: [['created_at', 'DESC']],
        distinct: true,
        useMaster: false,
        include: [
          {
            model: ClassModel,
            as: 'classes',
            required: true,
            attributes: [],
            where: {
              [Op.or]: [
                {registrationDeadline: {[Op.gt]: now}},
                Sequelize.literal(
                  `EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = \`classes\`.\`id\` AND enrollments.user_id = '${userId}')`
                ),
              ],
            },
          },
        ],
      }));
    }

    return new ListCoursesResponse({data: rows.map(course => course.toCourseDto()), total: count, page, pageSize});
  }
}

export {router as listCoursesRouter};
