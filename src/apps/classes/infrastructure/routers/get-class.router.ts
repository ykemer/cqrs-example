import express, {Request, Response} from 'express';
import {param} from 'express-validator';

import {GetClassQuery} from '@/apps/classes/application/queries/get-class/get-class.query';
import {mediatR} from '@/config/infrastructure/mediatr';
import {validateRequest} from '@/config/infrastructure/middleware';
import {NotFoundError} from '@/libs/dto/domain';

const router = express.Router();

/**
 * @swagger
 * /courses/{courseId}/classes/{id}:
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
 *         name: id
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
  '/api/v1/courses/:courseId/classes/:id',
  [
    param('id').isUUID().withMessage('ID must be a valid UUID'),
    param('courseId').isUUID().withMessage('ID must be a valid UUID'),
  ],
  validateRequest,
  async (req: Request<{courseId: string; id: string}>, res: Response) => {
    const {id, courseId} = req.params;
    const result = await mediatR.send(new GetClassQuery(courseId, id));
    if (!result) throw new NotFoundError('Class not found');
    res.status(200).send(result);
  }
);

export {router as getClassRouter};
