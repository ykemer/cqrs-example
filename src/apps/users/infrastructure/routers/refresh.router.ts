import express, {Request, Response} from 'express';
import {body} from 'express-validator';

import {UpdateRefreshTokenCommand} from '@/apps/users/application/commands/refresh/update-refresh-token.command';
import {mediatR} from '@/config/infrastructure/mediatr';
import {validateRequest} from '@/config/infrastructure/middleware';

const router = express.Router();

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token
 *     description: Rotate refresh token and get new access token. Requires a valid refresh token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTokenResponse'
 *       400:
 *         description: Invalid or expired refresh token
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
router.post(
  '/api/v1/auth/refresh',
  [body('refreshToken').trim().notEmpty().withMessage('refreshToken is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const {refreshToken} = req.body;
    const result = await mediatR.send(new UpdateRefreshTokenCommand(refreshToken));
    res.status(200).send(result);
  }
);

export {router as refreshRouter};
