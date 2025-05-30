const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Membership Routes', () => {
  let testGym, testPlan, testMembership;

  beforeEach(async () => {
    // Create test gym
    testGym = await global.prisma.gym.create({
      data: {
        name: 'Test Membership Gym',
        address: '123 Membership St',
        ownerId: global.testUsers.gymOwner.id
      }
    });

    // Create test membership plan
    testPlan = await global.prisma.membershipPlan.create({
      data: {
        gymId: testGym.id,
        name: 'Basic Plan',
        description: 'Basic membership plan',
        durationDays: 30,
        price: 50.00,
        maxBookingsPerWeek: 3,
        isActive: true
      }
    });

    // Create test membership
    testMembership = await global.prisma.userMembership.create({
      data: {
        userId: global.testUsers.user.id,
        gymId: testGym.id,
        planId: testPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        autoRenew: false,
        bookingsUsedThisWeek: 0,
        lastBookingCountReset: new Date()
      }
    });
  });

  describe('GET /api/memberships/my-memberships', () => {
    it('should get user memberships', async () => {
      const response = await request(app)
        .get('/api/memberships/my-memberships')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.results).toBe(response.body.data.length);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/memberships/my-memberships')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/memberships/:id', () => {
    it('should get membership by id', async () => {
      const response = await request(app)
        .get(`/api/memberships/${testMembership.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testMembership.id);
      expect(response.body.data.status).toBe('active');
    });

    it('should return 404 for non-existent membership', async () => {
      const response = await request(app)
        .get('/api/memberships/999999')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Membership not found');
    });

    it('should return 404 for membership belonging to another user', async () => {
      const otherMembership = await global.prisma.userMembership.create({
        data: {
          userId: global.testUsers.admin.id,
          gymId: testGym.id,
          planId: testPlan.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      });

      const response = await request(app)
        .get(`/api/memberships/${otherMembership.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/memberships/subscribe', () => {
    it('should create membership subscription', async () => {
      const subscriptionData = {
        gymId: testGym.id,
        planId: testPlan.id,
        autoRenew: true,
        paymentMethod: 'credit_card'
      };

      const response = await request(app)
        .post('/api/memberships/subscribe')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(subscriptionData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Membership created successfully');
      expect(response.body.data.membership.gymId).toBe(testGym.id);
      expect(response.body.data.payment).toBeDefined();
    });

    it('should return 404 for non-existent plan', async () => {
      const subscriptionData = {
        gymId: testGym.id,
        planId: 999999,
        paymentMethod: 'credit_card'
      };

      const response = await request(app)
        .post('/api/memberships/subscribe')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(subscriptionData)
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 409 for existing active membership at gym', async () => {
      const subscriptionData = {
        gymId: testGym.id,
        planId: testPlan.id,
        paymentMethod: 'credit_card'
      };

      const response = await request(app)
        .post('/api/memberships/subscribe')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(subscriptionData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already have an active membership');
    });

    it('should validate required fields', async () => {
      const subscriptionData = {
        gymId: testGym.id
        // Missing planId and paymentMethod
      };

      const response = await request(app)
        .post('/api/memberships/subscribe')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(subscriptionData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/memberships/:id', () => {
    it('should update membership auto-renew setting', async () => {
      const updateData = {
        autoRenew: true
      };

      const response = await request(app)
        .put(`/api/memberships/${testMembership.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Membership updated successfully');
      expect(response.body.data.autoRenew).toBe(true);
    });

    it('should return 400 for inactive membership', async () => {
      // Update membership to inactive
      await global.prisma.userMembership.update({
        where: { id: testMembership.id },
        data: { status: 'expired' }
      });

      const updateData = {
        autoRenew: true
      };

      const response = await request(app)
        .put(`/api/memberships/${testMembership.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/memberships/:id/cancel', () => {
    it('should cancel membership', async () => {
      const response = await request(app)
        .post(`/api/memberships/${testMembership.id}/cancel`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Membership cancelled successfully');

      // Verify cancellation
      const cancelledMembership = await global.prisma.userMembership.findUnique({
        where: { id: testMembership.id }
      });
      expect(cancelledMembership.status).toBe('cancelled');
      expect(cancelledMembership.autoRenew).toBe(false);
    });

    it('should return 400 for already cancelled membership', async () => {
      // Cancel first
      await global.prisma.userMembership.update({
        where: { id: testMembership.id },
        data: { status: 'cancelled' }
      });

      const response = await request(app)
        .post(`/api/memberships/${testMembership.id}/cancel`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/memberships/:id/payments', () => {
    beforeEach(async () => {
      // Create payment record
      await global.prisma.membershipPayment.create({
        data: {
          membershipId: testMembership.id,
          amount: 50.00,
          paymentDate: new Date(),
          paymentMethod: 'credit_card',
          status: 'completed',
          transactionId: 'TEST123'
        }
      });
    });

    it('should get membership payment history', async () => {
      const response = await request(app)
        .get(`/api/memberships/${testMembership.id}/payments`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.results).toBe(response.body.data.length);
    });

    it('should return 404 for membership belonging to another user', async () => {
      const otherMembership = await global.prisma.userMembership.create({
        data: {
          userId: global.testUsers.admin.id,
          gymId: testGym.id,
          planId: testPlan.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      });

      const response = await request(app)
        .get(`/api/memberships/${otherMembership.id}/payments`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});