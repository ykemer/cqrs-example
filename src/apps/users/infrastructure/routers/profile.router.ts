import express, {Request, Response} from 'express';

import {GetUserProfileQuery} from '@/apps/users/application/queries/get-user-profile/get-user-profile.query';
import {usersMediator} from '@/apps/users/infrastructure/mediator/users-mediator.setup';
import {requireAuth} from '@/config/infrastructure/middleware';

const router = express.Router();

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Profile
 *     description: Get user profile
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/api/v1/auth/profile', requireAuth, async (req: Request, res: Response) => {
  const user = await usersMediator.send(new GetUserProfileQuery(req.currentUser!.id));
  res.status(200).send(user);
});

export {router as profileRouter};
