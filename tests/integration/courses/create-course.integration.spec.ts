import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {UserRole} from '@/shared/domain/models/user';

describe('POST /api/v1/courses', () => {
  describe('Error cases', () => {
    it('should return 400 when name is missing', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).post('/api/v1/courses').send({description: 'Some description'});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 400 when description is missing', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).post('/api/v1/courses').send({name: 'Course Name'});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 401 when user is unauthenticated', async () => {
      const app = createTestApp(); // No currentUser
      const res = await request(app).post('/api/v1/courses').send({name: 'Course Name', description: 'Desc'});
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 403 when user is not an admin', async () => {
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).post('/api/v1/courses').send({name: 'Course Name', description: 'Desc'});
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('title');
    });
  });

  describe('Success cases', () => {
    it('should return 201 and the created course when valid data is provided by admin', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = {name: 'New Course', description: 'Course Description'};
      const res = await request(app).post('/api/v1/courses').send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(payload.name);
      expect(res.body.description).toBe(payload.description);
    });
  });
});
