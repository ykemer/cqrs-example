import express, {Request, Response} from 'express';
import {RequestData, RequestHandler, requestHandler} from 'mediatr-ts';
import {injectable} from 'tsyringe';

import {mediatR, NotFoundError, requireAuth, UserDto, UserModel} from '@/shared';

const router = express.Router();

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Profile
 *     description: Get the currently authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
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
router.get('/api/v1/auth/profile', requireAuth, async (req: Request, res: Response) => {
  const user = await mediatR.send(new GetUserProfileQuery(req.currentUser!.id));
  res.status(200).send(user);
});

export class GetUserProfileQuery extends RequestData<UserDto> {
  constructor(public readonly id: string) {
    super();
  }
}

@injectable()
@requestHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler implements RequestHandler<GetUserProfileQuery, UserDto> {
  async handle(input: GetUserProfileQuery): Promise<UserDto> {
    const {id} = input;
    const existingUser = await UserModel.findByPk(id, {useMaster: false});
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const {password: _password, ...userDto} = existingUser;
    return userDto;
  }
}

export {router as profileRouter};
