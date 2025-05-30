const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Gym Classes Routes', () => {
  let testGym;
  let testClass;

  beforeEach(async () => {
    // Create test gym
    testGym = await global.prisma.gym.create({
      data: {
        name: 'Test Class Gym',
        address: '123 Class St',
        ownerId: global.testUsers.gymOwner.id
      }
    });

    // Create test class
    testClass = await global.prisma.gymClass.create({
      data: {
        gymId: testGym.id,
        name: 'Test Yoga Class',
        description: 'A relaxing yoga class',
        maxCapacity: 20,
        durationMinutes: 60,
        membersOnly: false,
        difficultyLevel: 'beginner',
        isActive: true
      }
    });
  });

  describe('GET /api/classes', () => {
    it('should get all gym classes', async () => {
      const response = await request(app)
        .get('/api/classes')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter classes by gym', async () => {
      const response = await request(app)
        .get(`/api/classes?gymId=${testGym.id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(cls => {
        expect(cls.gymId).toBe(testGym.id);
      });
    });

    it('should filter classes by difficulty level', async () => {
      const response = await request(app)
        .get('/api/classes?difficultyLevel=beginner')
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(cls => {
        expect(cls.difficultyLevel).toBe('beginner');
      });
    });

    it('should search classes by name', async () => {
      const response = await request(app)
        .get('/api/classes?search=yoga')
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should paginate classes', async () => {
      const response = await request(app)
        .get('/api/classes?page=1&limit=5')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/classes/:id', () => {
    it('should get class by id', async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass.id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testClass.id);
      expect(response.body.data.name).toBe('Test Yoga Class');
    });

    it('should return 404 for non-existent class', async () => {
      const response = await request(app)
        .get('/api/classes/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Class not found');
    });
  });

  describe('POST /api/classes', () => {
    it('should create class as gym owner', async () => {
      const classData = {
        gymId: testGym.id,
        name: 'New HIIT Class',
        description: 'High intensity interval training',
        maxCapacity: 15,
        durationMinutes: 45,
        membersOnly: true,
        difficultyLevel: 'intermediate'
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(classData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Class created successfully');
      expect(response.body.data.name).toBe(classData.name);
    });

    it('should create class as admin', async () => {
      const classData = {
        gymId: testGym.id,
        name: 'Admin Created Class',
        description: 'Class created by admin',
        durationMinutes: 30
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(classData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(classData.name);
    });

    it('should return 403 for gym owner trying to create class for non-owned gym', async () => {
      const otherGym = await global.prisma.gym.create({
        data: {
          name: 'Other Gym',
          address: '456 Other St'
        }
      });

      const classData = {
        gymId: otherGym.id,
        name: 'Unauthorized Class',
        description: 'Should not be created',
        durationMinutes: 60
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(classData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 403 for regular user', async () => {
      const classData = {
        gymId: testGym.id,
        name: 'User Class',
        description: 'Should not be created',
        durationMinutes: 60
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(classData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should validate required fields', async () => {
      const classData = {
        gymId: testGym.id
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(classData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/classes/:id/schedules', () => {
    it('should get class schedules', async () => {
      // Create a schedule
      await global.prisma.classSchedule.create({
        data: {
          classId: testClass.id,
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
          instructor: 'Test Instructor'
        }
      });

      const response = await request(app)
        .get(`/api/classes/${testClass.id}/schedules`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter schedules by date range', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get(`/api/classes/${testClass.id}/schedules?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('POST /api/classes/:id/schedules', () => {
    it('should create class schedule as gym owner', async () => {
      const scheduleData = {
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        instructor: 'New Instructor'
      };

      const response = await request(app)
        .post(`/api/classes/${testClass.id}/schedules`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(scheduleData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Class schedule created successfully');
    });

    it('should return 400 for invalid time order', async () => {
      const scheduleData = {
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(), // Before start
        instructor: 'Test Instructor'
      };

      const response = await request(app)
        .post(`/api/classes/${testClass.id}/schedules`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(scheduleData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/classes/:id', () => {
    it('should update class as gym owner', async () => {
      const updateData = {
        description: 'Updated yoga class description',
        maxCapacity: 25
      };

      const response = await request(app)
        .put(`/api/classes/${testClass.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Class updated successfully');
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should return 403 for unauthorized user', async () => {
      const updateData = {
        description: 'Unauthorized update'
      };

      const response = await request(app)
        .put(`/api/classes/${testClass.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/classes/:id', () => {
    it('should deactivate class with schedules as gym owner', async () => {
      // Create a schedule to prevent hard deletion
      await global.prisma.classSchedule.create({
        data: {
          classId: testClass.id,
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          instructor: 'Test Instructor'
        }
      });

      const response = await request(app)
        .delete(`/api/classes/${testClass.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('deactivated');
    });

    it('should hard delete class without schedules', async () => {
      // Create a new class without schedules
      const newClass = await global.prisma.gymClass.create({
        data: {
          gymId: testGym.id,
          name: 'Deletable Class',
          description: 'Can be deleted',
          durationMinutes: 30
        }
      });

      const response = await request(app)
        .delete(`/api/classes/${newClass.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Class deleted successfully');
    });
  });
});