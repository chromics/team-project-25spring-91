//tests/gyms.test.js
const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Gym Routes', () => {
  describe('GET /api/gyms', () => {
    it('should get all gyms without authentication', async () => {
      // Create a test gym
      await global.prisma.gym.create({
        data: {
          name: 'Test Gym',
          address: '123 Test St',
          description: 'A test gym',
          contactInfo: 'test@gym.com'
        }
      });

      const response = await request(app)
        .get('/api/gyms')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should search gyms by name', async () => {
      const response = await request(app)
        .get('/api/gyms?search=test')
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should paginate gym results', async () => {
      const response = await request(app)
        .get('/api/gyms?page=1&limit=5')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/gyms/:id', () => {
    it('should get gym by id', async () => {
      const gym = await global.prisma.gym.create({
        data: {
          name: 'Test Gym Detail',
          address: '123 Test St',
          description: 'A test gym for detail view',
          contactInfo: 'detail@gym.com'
        }
      });

      const response = await request(app)
        .get(`/api/gyms/${gym.id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(gym.id);
      expect(response.body.data.name).toBe('Test Gym Detail');
    });

    it('should return 404 for non-existent gym', async () => {
      const response = await request(app)
        .get('/api/gyms/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Gym not found');
    });
  });

  describe('POST /api/gyms', () => {
    it('should create gym as admin', async () => {
      const gymData = {
        name: 'New Admin Gym',
        address: '456 Admin St',
        description: 'A gym created by admin',
        contactInfo: 'admin@gym.com'
      };

      const response = await request(app)
        .post('/api/gyms')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(gymData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Gym created successfully');
      expect(response.body.data.name).toBe(gymData.name);
    });

    it('should create gym as gym owner', async () => {
      const gymData = {
        name: 'New Owner Gym',
        address: '789 Owner St',
        description: 'A gym created by gym owner',
        contactInfo: 'owner@gym.com'
      };

      const response = await request(app)
        .post('/api/gyms')
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(gymData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.ownerId).toBe(global.testUsers.gymOwner.id);
    });

    it('should return 403 for regular user', async () => {
      const gymData = {
        name: 'Unauthorized Gym',
        address: '999 User St',
        description: 'Should not be created',
        contactInfo: 'user@gym.com'
      };

      const response = await request(app)
        .post('/api/gyms')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(gymData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 401 without authentication', async () => {
      const gymData = {
        name: 'Unauthenticated Gym',
        address: '000 Anon St'
      };

      const response = await request(app)
        .post('/api/gyms')
        .send(gymData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/gyms/:id', () => {
    it('should update gym as owner', async () => {
      // Create gym owned by gym owner
      const gym = await global.prisma.gym.create({
        data: {
          name: 'Owned Gym',
          address: '123 Owned St',
          ownerId: global.testUsers.gymOwner.id
        }
      });

      const updateData = {
        description: 'Updated gym description',
        contactInfo: 'updated@gym.com'
      };

      const response = await request(app)
        .put(`/api/gyms/${gym.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Gym updated successfully');
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should update gym as admin', async () => {
      const gym = await global.prisma.gym.create({
        data: {
          name: 'Admin Update Gym',
          address: '456 Admin St'
        }
      });

      const updateData = {
        name: 'Updated Gym Name'
      };

      const response = await request(app)
        .put(`/api/gyms/${gym.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return 403 for non-owner user', async () => {
      const gym = await global.prisma.gym.create({
        data: {
          name: 'Other User Gym',
          address: '789 Other St',
          ownerId: global.testUsers.gymOwner.id
        }
      });

      const updateData = {
        description: 'Unauthorized update'
      };

      const response = await request(app)
        .put(`/api/gyms/${gym.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/gyms/:id', () => {
    it('should delete gym as admin', async () => {
      const gym = await global.prisma.gym.create({
        data: {
          name: 'Gym to Delete',
          address: '999 Delete St'
        }
      });

      const response = await request(app)
        .delete(`/api/gyms/${gym.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Gym deleted successfully');

      // Verify gym is deleted
      const deletedGym = await global.prisma.gym.findUnique({
        where: { id: gym.id }
      });
      expect(deletedGym).toBeNull();
    });

    it('should return 403 for non-admin user', async () => {
      const gym = await global.prisma.gym.create({
        data: {
          name: 'Protected Gym',
          address: '888 Protected St'
        }
      });

      const response = await request(app)
        .delete(`/api/gyms/${gym.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/gyms/statistics/total-count', () => {
    it('should get total gym count as admin', async () => {
      const response = await request(app)
        .get('/api/gyms/statistics/total-count')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.totalGyms).toBeGreaterThanOrEqual(0);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/gyms/statistics/total-count')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });
});