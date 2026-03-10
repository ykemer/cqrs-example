import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse, createClass, createUser} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';

describe('GET /api/v1/courses', () => {
  describe('Error cases', () => {
    it('should return 401 when the user is unauthenticated', async () => {
      const app = createTestApp(); // No currentUser
      const res = await request(app).get('/api/v1/courses');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 400 when page is invalid', async () => {
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).get('/api/v1/courses?page=0');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });
  });

  describe('Success cases', () => {
    it('should return 200 and all courses for admin', async () => {
      await createCourse({name: 'Admin Course'});
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get('/api/v1/courses');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 200 and paginated courses for admin', async () => {
      await createCourse({name: 'Course 1'});
      await createCourse({name: 'Course 2'});
      await createCourse({name: 'Course 3'});

      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get('/api/v1/courses?page=1&pageSize=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBeGreaterThanOrEqual(3);
    });

    it('should return 200 and the second page of courses', async () => {
      await createCourse({name: 'Course 1'});
      await createCourse({name: 'Course 2'});
      const c3 = await createCourse({name: 'Course 3'});

      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get('/api/v1/courses?page=2&pageSize=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.page).toBe(2);
    });

    it('should return 200 and only show relevant courses for regular user (future classes or enrolled)', async () => {
      const course1 = await createCourse({name: 'Visible Course'});
      await createClass(course1.id, {registrationDeadline: new Date(Date.now() + 86400000)}); // Future deadline

      const course2 = await createCourse({name: 'Hidden Course'});
      await createClass(course2.id, {registrationDeadline: new Date(Date.now() - 86400000)}); // Past deadline

      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).get('/api/v1/courses');

      expect(res.status).toBe(200);
      const courseNames = (res.body.data as Array<{name: string}>).map(c => c.name);
      expect(courseNames).toContain('Visible Course');
      expect(courseNames).not.toContain('Hidden Course');
    });
  });
});
