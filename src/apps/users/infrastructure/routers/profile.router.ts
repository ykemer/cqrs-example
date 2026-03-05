import express, {Request, Response} from 'express';

import {GetUserProfileQuery} from '@/apps/users/application/queries/get-user-profile/get-user-profile.query';
import {mediatR} from '@/config/infrastructure/mediatr';
import {requireAuth} from '@/config/infrastructure/middleware';

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

export {router as profileRouter};
