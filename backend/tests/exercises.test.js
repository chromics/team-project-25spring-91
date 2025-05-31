//tests/exercises.test.js
const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Exercise Routes', () => {
  describe('GET /api/exercises', () => {
    it('should get all exercises ', async () => {
      const response = await request(app)
        .get('/api/exercises')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.results).toBe(response.body.data.length);
    });

    it('should filter exercises by category', async () => {
      const response = await request(app)
        .get('/api/exercises?category=strength')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(exercise => {
        expect(exercise.category).toBe('strength');
      });
    });

    it('should search exercises by name', async () => {
      const response = await request(app)
        .get('/api/exercises?search=push')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(exercise => {
        expect(exercise.name.toLowerCase()).toContain('push');
      });
    });
  });

  describe('GET /api/exercises/:id', () => {
    it('should get exercise by id', async () => {
      const exerciseId = global.testExercises.pushup.id;

      const response = await request(app)
        .get(`/api/exercises/${exerciseId}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(exerciseId);
      expect(response.body.data.name).toBe('Push-up');
    });

    it('should return 404 for non-existent exercise', async () => {
      const response = await request(app)
        .get('/api/exercises/999999')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Exercise not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .get('/api/exercises/invalid')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/exercises', () => {
    it('should create exercise as admin', async () => {
      const exerciseData = {
        name: 'Pull-up',
        category: 'strength',
        description: 'Upper body pulling exercise',
        imageUrl: 'https://example.com/pullup.jpg'
      };

      const response = await request(app)
        .post('/api/exercises')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(exerciseData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Exercise created successfully');
      expect(response.body.data.name).toBe(exerciseData.name);
      expect(response.body.data.category).toBe(exerciseData.category);
    });

    it('should return 403 for non-admin user', async () => {
      const exerciseData = {
        name: 'Pull-up',
        category: 'strength',
        description: 'Upper body pulling exercise'
      };

      const response = await request(app)
        .post('/api/exercises')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(exerciseData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 401 without authentication', async () => {
      const exerciseData = {
        name: 'Pull-up',
        category: 'strength',
        description: 'Upper body pulling exercise'
      };

      const response = await request(app)
        .post('/api/exercises')
        .send(exerciseData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 409 for duplicate exercise name', async () => {
      const exerciseData = {
        name: 'Push-up', // Already exists
        category: 'strength',
        description: 'Duplicate exercise'
      };

      const response = await request(app)
        .post('/api/exercises')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(exerciseData)
        .expect(409);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/exercises/:id', () => {
    it('should update exercise as admin', async () => {
      const exerciseId = global.testExercises.pushup.id;
      const updateData = {
        description: 'Updated description for push-up exercise',
        imageUrl: 'https://example.com/new-pushup.jpg'
      };

      const response = await request(app)
        .put(`/api/exercises/${exerciseId}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Exercise updated successfully');
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.imageUrl).toBe(updateData.imageUrl);
    });

    it('should return 403 for non-admin user', async () => {
      const exerciseId = global.testExercises.pushup.id;
      const updateData = {
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/exercises/${exerciseId}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/exercises/:id', () => {
    it('should delete exercise as admin', async () => {
      // Create a temporary exercise to delete
      const tempExercise = await global.prisma.exercise.create({
        data: {
          name: 'Temporary Exercise',
          category: 'test',
          description: 'Exercise to be deleted'
        }
      });

      const response = await request(app)
        .delete(`/api/exercises/${tempExercise.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Exercise deleted successfully');

      // Verify exercise is deleted
      const deletedExercise = await global.prisma.exercise.findUnique({
        where: { id: tempExercise.id }
      });
      expect(deletedExercise).toBeNull();
    });

    it('should return 403 for non-admin user', async () => {
      const exerciseId = global.testExercises.pushup.id;

      const response = await request(app)
        .delete(`/api/exercises/${exerciseId}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });
});