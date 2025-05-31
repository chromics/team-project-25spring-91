const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Competition Routes', () => {
  let testGym;
  let testCompetition;

  beforeEach(async () => {
    // Create test gym
    testGym = await global.prisma.gym.create({
      data: {
        name: 'Test Competition Gym',
        address: '123 Competition St',
        ownerId: global.testUsers.gymOwner.id
      }
    });

    // Create test competition
    testCompetition = await global.prisma.competition.create({
      data: {
        gymId: testGym.id,
        name: 'Test Competition',
        description: 'A test competition for testing',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        maxParticipants: 50,
        isActive: true
      }
    });
  });

  describe('GET /api/competitions', () => {
    it('should get all competitions without authentication', async () => {
      const response = await request(app)
        .get('/api/competitions')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter competitions by gym', async () => {
      const response = await request(app)
        .get(`/api/competitions?gymId=${testGym.id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(competition => {
        expect(competition.gymId).toBe(testGym.id);
      });
    });

    it('should filter competitions by active status', async () => {
      const response = await request(app)
        .get('/api/competitions?isActive=true')
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(competition => {
        expect(competition.isActive).toBe(true);
      });
    });

    it('should search competitions by name', async () => {
      const response = await request(app)
        .get('/api/competitions?search=test')
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should paginate competitions', async () => {
      const response = await request(app)
        .get('/api/competitions?page=1&limit=5')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/competitions/:id', () => {
    it('should get competition by id', async () => {
      const response = await request(app)
        .get(`/api/competitions/${testCompetition.id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testCompetition.id);
      expect(response.body.data.name).toBe('Test Competition');
    });

    it('should return 404 for non-existent competition', async () => {
      const response = await request(app)
        .get('/api/competitions/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Competition not found');
    });
  });

  describe('POST /api/competitions', () => {
    it('should create competition as admin', async () => {
      const competitionData = {
        gymId: testGym.id,
        name: 'New Admin Competition',
        description: 'Competition created by admin',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
        maxParticipants: 100
      };

      const response = await request(app)
        .post('/api/competitions')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(competitionData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Competition created successfully');
      expect(response.body.data.name).toBe(competitionData.name);
    });

    it('should create competition as gym owner for owned gym', async () => {
      const competitionData = {
        gymId: testGym.id,
        name: 'Owner Competition',
        description: 'Competition created by gym owner',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/competitions')
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(competitionData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(competitionData.name);
    });

    it('should return 403 for gym owner trying to create competition for non-owned gym', async () => {
      const otherGym = await global.prisma.gym.create({
        data: {
          name: 'Other Gym',
          address: '456 Other St'
        }
      });

      const competitionData = {
        gymId: otherGym.id,
        name: 'Unauthorized Competition',
        description: 'Should not be created',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/competitions')
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(competitionData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 403 for regular user', async () => {
      const competitionData = {
        gymId: testGym.id,
        name: 'User Competition',
        description: 'Should not be created',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/competitions')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(competitionData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should validate date order', async () => {
      const competitionData = {
        gymId: testGym.id,
        name: 'Invalid Date Competition',
        description: 'End date before start date',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString() // End before start
      };

      const response = await request(app)
        .post('/api/competitions')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(competitionData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/competitions/:id/join', () => {
    it('should join competition', async () => {
      const response = await request(app)
        .post(`/api/competitions/${testCompetition.id}/join`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Successfully joined the competition');
    });

    it('should return 400 for already joined competition', async () => {
      // Join first time
      await request(app)
        .post(`/api/competitions/${testCompetition.id}/join`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(201);

      // Try to join again
      const response = await request(app)
        .post(`/api/competitions/${testCompetition.id}/join`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent competition', async () => {
      const response = await request(app)
        .post('/api/competitions/999999/join')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/competitions/:id/leave', () => {
    beforeEach(async () => {
      // Join competition first
      await global.prisma.competitionUser.create({
        data: {
          userId: global.testUsers.user.id,
          competitionId: testCompetition.id,
          joinDate: new Date(),
          totalPoints: 0,
          completionPct: 0,
          isActive: true
        }
      });
    });

    it('should leave competition', async () => {
      const response = await request(app)
        .delete(`/api/competitions/${testCompetition.id}/leave`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Successfully left the competition');
    });

    it('should return 404 for not joined competition', async () => {
      const response = await request(app)
        .delete(`/api/competitions/${testCompetition.id}/leave`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/competitions/:id/tasks', () => {
    it('should create task as gym owner', async () => {
      const taskData = {
        name: 'Push-up Challenge',
        description: 'Complete as many push-ups as possible',
        targetValue: 1000,
        unit: 'reps',
        pointsValue: 100,
        exerciseId: global.testExercises.pushup.id
      };

      const response = await request(app)
        .post(`/api/competitions/${testCompetition.id}/tasks`)
        .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
        .send(taskData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data.name).toBe(taskData.name);
    });

    it('should return 403 for unauthorized user', async () => {
      const taskData = {
        name: 'Unauthorized Task',
        description: 'Should not be created',
        targetValue: 100,
        unit: 'reps'
      };

      const response = await request(app)
        .post(`/api/competitions/${testCompetition.id}/tasks`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(taskData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/competitions/:id/leaderboard', () => {
    it('should get competition leaderboard', async () => {
      const response = await request(app)
        .get(`/api/competitions/${testCompetition.id}/leaderboard`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.competition).toBeDefined();
      expect(response.body.data.leaderboard).toBeInstanceOf(Array);
    });

    it('should paginate leaderboard', async () => {
      const response = await request(app)
        .get(`/api/competitions/${testCompetition.id}/leaderboard?page=1&limit=5`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/competitions/user/competitions', () => {
    it('should get user competitions', async () => {
      const response = await request(app)
        .get('/api/competitions/user/competitions')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter by active status', async () => {
      const response = await request(app)
        .get('/api/competitions/user/competitions?active=true')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/competitions/:competitionId/tasks-list', () => {
    it('should get competition tasks', async () => {
      // Create a task first
      await global.prisma.competitionTask.create({
        data: {
          competitionId: testCompetition.id,
          name: 'Test Task',
          description: 'A test task',
          targetValue: 100,
          unit: 'reps',
          pointsValue: 50
        }
      });

      const response = await request(app)
        .get(`/api/competitions/${testCompetition.id}/tasks-list`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('PUT /api/competitions/tasks/:taskId/progress', () => {
    let testTask, participant;

    beforeEach(async () => {
      // Create participant
      participant = await global.prisma.competitionUser.create({
        data: {
          userId: global.testUsers.user.id,
          competitionId: testCompetition.id,
          joinDate: new Date(),
          totalPoints: 0,
          completionPct: 0,
          isActive: true
        }
      });

      // Create task
      testTask = await global.prisma.competitionTask.create({
        data: {
          competitionId: testCompetition.id,
          name: 'Progress Task',
          description: 'Task for progress testing',
          targetValue: 100,
          unit: 'reps',
          pointsValue: 50
        }
      });

      // Create progress record
      await global.prisma.competitionProgress.create({
        data: {
          participantId: participant.id,
          taskId: testTask.id,
          currentValue: 0,
          isCompleted: false
        }
      });
    });

    it('should update task progress', async () => {
      const progressData = {
        currentValue: 50,
        notes: 'Halfway there!'
      };

      const response = await request(app)
        .put(`/api/competitions/tasks/${testTask.id}/progress`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(progressData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Progress updated successfully');
    });

    it('should mark task as completed when target reached', async () => {
      const progressData = {
        currentValue: 100
      };

      const response = await request(app)
        .put(`/api/competitions/tasks/${testTask.id}/progress`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(progressData)
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });
});