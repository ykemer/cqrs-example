import express, {Request, Response} from 'express';
import {body} from 'express-validator';

import {LoginCommand} from '@/apps/users/application/commands/login/login.command';
import {UpdateRefreshTokenCommand} from '@/apps/users/application/commands/refresh/update-refresh-token.command';
import {usersMediator} from '@/apps/users/infrastructure/mediator/users-mediator.setup';
import {validateRequest} from '@/config/infrastructure/middleware';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *            schema:
 *               $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTokenResponse'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  '/api/v1/auth/login',
  [
    body('email').trim().normalizeEmail().isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must provide a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {email, password} = req.body;
    const result = await usersMediator.send(new LoginCommand(email, password));
    res.status(200).send(result);
  }
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and receive new access token
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTokenResponse'
 */
router.post(
  '/api/v1/auth/refresh',
  [body('refreshToken').trim().notEmpty().withMessage('refreshToken is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const {refreshToken} = req.body;
    const result = await usersMediator.send(new UpdateRefreshTokenCommand(refreshToken));
    res.status(200).send(result);
  }
);

export {router as loginRouter};
