import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {mediatR, PaginatedResponse, requireRole, UserDto, UserModel, UserRole} from '@/shared';
import {validate} from '@/shared/middleware';

import {LIST_USERS_QUERY_SCHEMA} from './list-users.schema';

type ListUsersQueryParams = {
  page: number;
  pageSize: number;
};

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get list of users
 *     description: Returns a paginated list of users. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 10
 *         description: Number of items per page (max 10)
 *     responses:
 *       200:
 *         description: A paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
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
router.get(
  '/api/v1/users',
  validate<unknown, ListUsersQueryParams>({query: LIST_USERS_QUERY_SCHEMA}) as any,
  requireRole([UserRole.admin]),
  (async (req: Request<unknown, any, unknown, ListUsersQueryParams>, res: Response) => {
    const {page, pageSize} = req.query;
    const result = await mediatR.send(new ListUsersQuery(page, pageSize));
    res.status(200).send(result);
  }) as any
);

export class ListUsersQuery extends RequestData<ListUsersResponse> {
  page: number;
  pageSize: number;
  take: number;
  skip: number;

  constructor(page: number = 1, pageSize: number = 10) {
    super();
    this.page = Number(page);
    this.pageSize = Number(pageSize);

    this.take = Number(pageSize);
    this.skip = (Number(page) - 1) * Number(pageSize);
  }
}

class ListUsersResponse extends PaginatedResponse<UserDto> {}

@injectable()
@requestHandler(ListUsersQuery)
export class ListUsersCommandHandler implements RequestHandler<ListUsersQuery, ListUsersResponse> {
  async handle(input: ListUsersQuery): Promise<ListUsersResponse> {
    const {rows, count} = await UserModel.findAndCountAll({
      limit: input.take,
      offset: input.skip,
      order: [['createdAt', 'DESC']],
      useMaster: false,
    });

    return new ListUsersResponse({
      data: rows.map(row => row.toUserDto()),
      total: count,
      page: input.page,
      pageSize: input.pageSize,
    });
  }
}

export {router as listUsersRouter};
