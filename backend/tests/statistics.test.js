//tests/statistics.test.js
const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Statistics Routes', () => {
  beforeEach(async () => {
    // Create some test data for statistics
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    await global.prisma.actualWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Test Workout for Stats',
        completedDate: lastWeek,
        actualDuration: 45,
        actualExercises: {
          create: [
            {
              exerciseId: global.testExercises.pushup.id,
              actualSets: 3,
              actualReps: 10,
              actualWeight: 0
            }
          ]
        }
      }
    });
  });

  describe('GET /api/statistics/dashboard', () => {
    it('should get dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/statistics/dashboard')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.completedWorkoutSessions).toBeDefined();
      expect(response.body.data.currentMonthCompletionRate).toBeDefined();
      expect(response.body.data.monthlyCompletedWorkouts).toBeInstanceOf(Array);
      expect(response.body.data.workoutsByYear).toBeInstanceOf(Array);
      expect(response.body.data.longestStreak).toBeDefined();
      expect(response.body.data.currentStreak).toBeDefined();
      expect(response.body.data.bestRecords).toBeDefined();
      expect(response.body.data.topExercises).toBeInstanceOf(Array);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/statistics/dashboard')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/statistics/exercise/:exerciseId', () => {
    it('should get exercise progress statistics', async () => {
      const exerciseId = global.testExercises.pushup.id;

      const response = await request(app)
        .get(`/api/statistics/exercise/${exerciseId}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.exercise).toBeDefined();
      expect(response.body.data.exercise.id).toBe(exerciseId);
      expect(response.body.data.progressData).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent exercise', async () => {
      const response = await request(app)
        .get('/api/statistics/exercise/999999')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Exercise not found');
    });

    it('should return 400 for invalid exercise id', async () => {
      const response = await request(app)
        .get('/api/statistics/exercise/invalid')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });
});