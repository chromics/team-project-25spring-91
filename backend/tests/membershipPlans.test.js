const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Membership Plan Routes', () => {
  let testGym, testPlan;

  beforeEach(async () => {
    // Create test gym
    testGym = await global.prisma.gym.create({
      data: {
        name: 'Test Plan Gym',
        address: '123 Plan St',
        ownerId: global.testUsers.gymOwner.id
      }
    });

    // Create test membership plan
    testPlan = await global.prisma.membershipPlan.create({
      data: {
        gymId: testGym.id,
        name: 'Test Plan',
        description: 'A test membership plan',
        durationDays: 30,
        price: 49.99,
        maxBookingsPerWeek: 5,
        isActive: true
      }
    });
  });

  describe('GET /api/membership-plans/plans/:planId', () => {
    it('should get membership plan by id', async () => {
      const response = await request(app)
        .get(`/api/membership-plans/plans/${testPlan.id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testPlan.id);
      expect(response.body.data.name).toBe('Test Plan');
    });

    it('should return 404 for non-existent plan', async () => {
      const response = await request(app)
        .get('/api/membership-plans/plans/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Membership plan not found');
    });
  });

  describe('PUT /api/membership-plans/plans/:planId', () => {
    it('should update membership plan as gym owner', async () => {
      const updateData = {
        description: 'Updated plan description',
        price: 59.99,
        maxBookingsPerWeek: 7
      };

      const response = await request(app)
        .put(`/api/membership-plans/plans/${testPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Membership plan updated successfully');
      expect(response.body.data.description).toBe(updateData.description);
      expect(parseFloat(response.body.data.price)).toBe(updateData.price);
    });

    it('should update membership plan as admin', async () => {
      const updateData = {
        name: 'Admin Updated Plan',
        price: 69.99
      };

      const response = await request(app)
        .put(`/api/membership-plans/plans/${testPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return 403 for gym owner trying to update plan for non-owned gym', async () => {
      const otherGym = await global.prisma.gym.create({
        data: {
          name: 'Other Gym',
          address: '456 Other St'
        }
      });

      const otherPlan = await global.prisma.membershipPlan.create({
        data: {
          gymId: otherGym.id,
          name: 'Other Plan',
          description: 'Plan for other gym',
          durationDays: 30,
          price: 40.00
        }
      });

      const updateData = {
        price: 50.00
      };

      const response = await request(app)
        .put(`/api/membership-plans/plans/${otherPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 403 for regular user', async () => {
      const updateData = {
        price: 100.00
      };

      const response = await request(app)
        .put(`/api/membership-plans/plans/${testPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 409 for duplicate plan name within gym', async () => {
      // Create another plan in the same gym
      await global.prisma.membershipPlan.create({
        data: {
          gymId: testGym.id,
          name: 'Premium Plan',
          description: 'Premium membership',
          durationDays: 30,
          price: 99.99
        }
      });

      const updateData = {
        name: 'Premium Plan' // Trying to use existing name
      };

      const response = await request(app)
        .put(`/api/membership-plans/plans/${testPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(updateData)
        .expect(409);

      expect(response.body.status).toBe('error');
    });

    it('should validate update data', async () => {
      const updateData = {
        price: -10 // Invalid negative price
      };

      const response = await request(app)
        .put(`/api/membership-plans/plans/${testPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/membership-plans/plans/:planId', () => {
    it('should delete membership plan without active subscriptions', async () => {
      const response = await request(app)
        .delete(`/api/membership-plans/plans/${testPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Membership plan deleted successfully');

      // Verify deletion
      const deletedPlan = await global.prisma.membershipPlan.findUnique({
        where: { id: testPlan.id }
      });
      expect(deletedPlan).toBeNull();
    });

    it('should deactivate membership plan with active subscriptions', async () => {
      // Create active membership using this plan
      await global.prisma.userMembership.create({
        data: {
          userId: global.testUsers.user.id,
          gymId: testGym.id,
          planId: testPlan.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      });

      const response = await request(app)
        .delete(`/api/membership-plans/plans/${testPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('deactivated');
      expect(response.body.data.isActive).toBe(false);
    });

    it('should return 403 for unauthorized user', async () => {
      const response = await request(app)
        .delete(`/api/membership-plans/plans/${testPlan.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/gyms/:gymId/membership-plans', () => {
    it('should create membership plan as gym owner', async () => {
      const planData = {
        name: 'New Premium Plan',
        description: 'Premium membership with all benefits',
        durationDays: 365,
        price: 299.99,
        maxBookingsPerWeek: null, // Unlimited
        isActive: true
      };

      const response = await request(app)
        .post(`/api/gyms/${testGym.id}/membership-plans`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(planData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Membership plan created successfully');
      expect(response.body.data.name).toBe(planData.name);
      expect(response.body.data.gymId).toBe(testGym.id);
    });

    it('should create membership plan as admin', async () => {
      const planData = {
        name: 'Admin Created Plan',
        description: 'Plan created by admin',
        durationDays: 90,
        price: 149.99
      };

      const response = await request(app)
        .post(`/api/gyms/${testGym.id}/membership-plans`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(planData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(planData.name);
    });

    it('should return 404 for non-existent gym', async () => {
      const planData = {
        name: 'Invalid Gym Plan',
        description: 'Plan for non-existent gym',
        durationDays: 30,
        price: 50.00
      };

      const response = await request(app)
        .post('/api/gyms/999999/membership-plans')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(planData)
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 403 for gym owner trying to create plan for non-owned gym', async () => {
      const otherGym = await global.prisma.gym.create({
        data: {
          name: 'Other Gym',
          address: '456 Other St'
        }
      });

      const planData = {
        name: 'Unauthorized Plan',
        description: 'Should not be created',
        durationDays: 30,
        price: 50.00
      };

      const response = await request(app)
        .post(`/api/gyms/${otherGym.id}/membership-plans`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(planData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 409 for duplicate plan name within gym', async () => {
      const planData = {
        name: 'Test Plan', // Same as existing plan
        description: 'Duplicate plan name',
        durationDays: 30,
        price: 50.00
      };

      const response = await request(app)
        .post(`/api/gyms/${testGym.id}/membership-plans`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(planData)
        .expect(409);

      expect(response.body.status).toBe('error');
    });

    it('should validate required fields', async () => {
      const planData = {
        name: 'Incomplete Plan'
        // Missing required fields
      };

      const response = await request(app)
        .post(`/api/gyms/${testGym.id}/membership-plans`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(planData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });
});