const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Booking Routes', () => {
  let testGym, testClass, testSchedule, testMembership, testPlan;

  beforeEach(async () => {
    // Create test gym
    testGym = await global.prisma.gym.create({
      data: {
        name: 'Test Booking Gym',
        address: '123 Booking St',
        ownerId: global.testUsers.gymOwner.id
      }
    });

    // Create test class
    testClass = await global.prisma.gymClass.create({
      data: {
        gymId: testGym.id,
        name: 'Test Booking Class',
        description: 'A class for booking tests',
        maxCapacity: 10,
        durationMinutes: 60,
        membersOnly: false,
        isActive: true
      }
    });

    // Create test schedule
    testSchedule = await global.prisma.classSchedule.create({
      data: {
        classId: testClass.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
        instructor: 'Test Instructor',
        currentBookings: 0
      }
    });

    // Create membership plan
    testPlan = await global.prisma.membershipPlan.create({
      data: {
        gymId: testGym.id,
        name: 'Booking Plan',
        description: 'Plan for booking tests',
        durationDays: 30,
        price: 50.00,
        maxBookingsPerWeek: 5
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
        bookingsUsedThisWeek: 0,
        lastBookingCountReset: new Date()
      }
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    beforeEach(async () => {
      // Create test booking
      await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.user.id,
          membershipId: testMembership.id,
          scheduleId: testSchedule.id,
          bookingStatus: 'confirmed',
          attended: false
        }
      });
    });

    it('should get user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.results).toBe(response.body.data.length);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/bookings/upcoming', () => {
    it('should get upcoming bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/upcoming')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/bookings/history', () => {
    beforeEach(async () => {
      // Create past schedule and booking
      const pastSchedule = await global.prisma.classSchedule.create({
        data: {
          classId: testClass.id,
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          endTime: new Date(Date.now() - 23 * 60 * 60 * 1000), // -23 hours
          instructor: 'Past Instructor'
        }
      });

      await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.user.id,
          membershipId: testMembership.id,
          scheduleId: pastSchedule.id,
          bookingStatus: 'attended',
          attended: true
        }
      });
    });

    it('should get booking history', async () => {
      const response = await request(app)
        .get('/api/bookings/history')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should paginate booking history', async () => {
      const response = await request(app)
        .get('/api/bookings/history?page=1&limit=5')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create booking', async () => {
      const bookingData = {
        scheduleId: testSchedule.id,
        membershipId: testMembership.id
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(bookingData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Class booked successfully');
      expect(response.body.data.scheduleId).toBe(testSchedule.id);
    });

    it('should return 404 for non-existent schedule', async () => {
      const bookingData = {
        scheduleId: 999999,
        membershipId: testMembership.id
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(bookingData)
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for cancelled class', async () => {
      // Cancel the schedule
      await global.prisma.classSchedule.update({
        where: { id: testSchedule.id },
        data: { isCancelled: true }
      });

      const bookingData = {
        scheduleId: testSchedule.id,
        membershipId: testMembership.id
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(bookingData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for past class', async () => {
      // Create past schedule
      const pastSchedule = await global.prisma.classSchedule.create({
        data: {
          classId: testClass.id,
          startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          instructor: 'Past Instructor'
        }
      });

      const bookingData = {
        scheduleId: pastSchedule.id,
        membershipId: testMembership.id
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(bookingData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });


    it('should return 409 for duplicate booking', async () => {
      // Create first booking
      await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.user.id,
          membershipId: testMembership.id,
          scheduleId: testSchedule.id,
          bookingStatus: 'confirmed'
        }
      });

      const bookingData = {
        scheduleId: testSchedule.id,
        membershipId: testMembership.id
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(bookingData)
        .expect(409);

      expect(response.body.status).toBe('error');
    });

    it('should return 403 for exceeded booking limit', async () => {
      // Max out weekly bookings
      await global.prisma.userMembership.update({
        where: { id: testMembership.id },
        data: { bookingsUsedThisWeek: testPlan.maxBookingsPerWeek }
      });

      const bookingData = {
        scheduleId: testSchedule.id,
        membershipId: testMembership.id
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(bookingData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    let testBooking;

    beforeEach(async () => {
      testBooking = await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.user.id,
          membershipId: testMembership.id,
          scheduleId: testSchedule.id,
          bookingStatus: 'confirmed'
        }
      });

      // Increment schedule booking count
      await global.prisma.classSchedule.update({
        where: { id: testSchedule.id },
        data: { currentBookings: { increment: 1 } }
      });
    });

    it('should cancel booking', async () => {
      const cancellationData = {
        cancellationReason: 'Schedule conflict'
      };

      const response = await request(app)
        .put(`/api/bookings/${testBooking.id}/cancel`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(cancellationData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Booking cancelled successfully');

      // Verify cancellation
      const cancelledBooking = await global.prisma.userBooking.findUnique({
        where: { id: testBooking.id }
      });
      expect(cancelledBooking.bookingStatus).toBe('cancelled');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .put('/api/bookings/999999/cancel')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send({})
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for already cancelled booking', async () => {
      // Cancel booking first
      await global.prisma.userBooking.update({
        where: { id: testBooking.id },
        data: { bookingStatus: 'cancelled' }
      });

      const response = await request(app)
        .put(`/api/bookings/${testBooking.id}/cancel`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for cancelling past class booking', async () => {
      // Create past schedule and booking
      const pastSchedule = await global.prisma.classSchedule.create({
        data: {
          classId: testClass.id,
          startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          instructor: 'Past Instructor'
        }
      });

      const pastBooking = await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.user.id,
          membershipId: testMembership.id,
          scheduleId: pastSchedule.id,
          bookingStatus: 'confirmed'
        }
      });

      const response = await request(app)
        .put(`/api/bookings/${pastBooking.id}/cancel`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/bookings/:id/mark-attended', () => {
    let testBooking, pastSchedule;

    beforeEach(async () => {
      // Create past schedule
      pastSchedule = await global.prisma.classSchedule.create({
        data: {
          classId: testClass.id,
          startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          instructor: 'Past Instructor'
        }
      });

      testBooking = await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.user.id,
          membershipId: testMembership.id,
          scheduleId: pastSchedule.id,
          bookingStatus: 'confirmed',
          attended: false
        }
      });
    });

    it('should mark booking as attended', async () => {
      const response = await request(app)
        .put(`/api/bookings/${testBooking.id}/mark-attended`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Booking marked as attended');

      // Verify attendance marking
      const attendedBooking = await global.prisma.userBooking.findUnique({
        where: { id: testBooking.id }
      });
      expect(attendedBooking.attended).toBe(true);
      expect(attendedBooking.bookingStatus).toBe('attended');
    });

    it('should return 400 for future class', async () => {
      const futureBooking = await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.user.id,
          membershipId: testMembership.id,
          scheduleId: testSchedule.id, // Future schedule
          bookingStatus: 'confirmed'
        }
      });

      const response = await request(app)
        .put(`/api/bookings/${futureBooking.id}/mark-attended`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for cancelled booking', async () => {
      await global.prisma.userBooking.update({
        where: { id: testBooking.id },
        data: { bookingStatus: 'cancelled' }
      });

      const response = await request(app)
        .put(`/api/bookings/${testBooking.id}/mark-attended`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/bookings/:id', () => {
    let testBooking;

    beforeEach(async () => {
      testBooking = await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.user.id,
          membershipId: testMembership.id,
          scheduleId: testSchedule.id,
          bookingStatus: 'confirmed'
        }
      });
    });

    it('should get booking by id', async () => {
      const response = await request(app)
        .get(`/api/bookings/${testBooking.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testBooking.id);
      expect(response.body.data.bookingStatus).toBe('confirmed');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bookings/999999')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for booking belonging to another user', async () => {
      const otherBooking = await global.prisma.userBooking.create({
        data: {
          userId: global.testUsers.admin.id,
          membershipId: testMembership.id,
          scheduleId: testSchedule.id,
          bookingStatus: 'confirmed'
        }
      });

      const response = await request(app)
        .get(`/api/bookings/${otherBooking.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});