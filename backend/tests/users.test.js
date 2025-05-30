const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('User Routes', () => {
  describe('GET /api/users/profile', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe(global.testUsers.user.email);
      expect(response.body.data.displayName).toBe(global.testUsers.user.displayName);
      expect(response.body.data.role).toBe(global.testUsers.user.role);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        displayName: 'Updated Test User',
        gender: 'Male',
        heightCm: 180,
        weightKg: 75
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.displayName).toBe(updateData.displayName);
      expect(response.body.data.gender).toBe(updateData.gender);
      expect(response.body.data.heightCm).toBe(updateData.heightCm);
    });

    it('should update password with current password', async () => {
      const updateData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Profile updated successfully');
    });

    it('should return 400 for incorrect current password', async () => {
      const updateData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Current password is incorrect');
    });
  });

  describe('GET /api/users/admin/all-users', () => {
    it('should get all users as admin', async () => {
      const response = await request(app)
        .get('/api/users/admin/all-users')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/users/admin/all-users')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/users/admin/all-users?role=admin')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('should search users by email/name', async () => {
      const response = await request(app)
        .get('/api/users/admin/all-users?search=test')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('PUT /api/users/admin/change-role/:id', () => {
    it('should change user role as admin', async () => {
      const updateData = {
        role: 'gym_owner'
      };

      const response = await request(app)
        .put(`/api/users/admin/change-role/${global.testUsers.user.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User role updated successfully');
      expect(response.body.data.role).toBe('gym_owner');
    });

    it('should return 403 for non-admin user', async () => {
      const updateData = {
        role: 'admin'
      };

      const response = await request(app)
        .put(`/api/users/admin/change-role/${global.testUsers.user.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for invalid role', async () => {
      const updateData = {
        role: 'invalid_role'
      };

      const response = await request(app)
        .put(`/api/users/admin/change-role/${global.testUsers.user.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/users/admin/statistics/counts', () => {
    it('should get user counts as admin', async () => {
      const response = await request(app)
        .get('/api/users/admin/statistics/counts')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.totalUsers).toBeGreaterThanOrEqual(3);
      expect(response.body.data.totalAdmins).toBeGreaterThanOrEqual(1);
      expect(response.body.data.totalGymOwners).toBeGreaterThanOrEqual(1);
      expect(response.body.data.totalRegularUsers).toBeGreaterThanOrEqual(0);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/users/admin/statistics/counts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });
});