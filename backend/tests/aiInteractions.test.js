//tests/aiInteraction.test.js
const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('AI Interactions Routes', () => {
  describe('POST /api/ai/interactions', () => {
    it('should create AI interaction', async () => {
      const interactionData = {
        prompt: 'What exercises should I do for chest?',
        response: 'For chest development, I recommend push-ups, bench press, and chest flies. These exercises target the pectoral muscles effectively.',
        interactionType: 'WORKOUT_PLAN'
      };

      const response = await request(app)
        .post('/api/ai/interactions')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(interactionData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('AI interaction logged successfully');
      expect(response.body.data.prompt).toBe(interactionData.prompt);
      expect(response.body.data.response).toBe(interactionData.response);
      expect(response.body.data.interactionType).toBe(interactionData.interactionType);
    });

    it('should validate required fields', async () => {
      const interactionData = {
        prompt: 'Test prompt'
        // Missing response
      };

      const response = await request(app)
        .post('/api/ai/interactions')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(interactionData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation error');
    });

    it('should validate prompt length', async () => {
      const interactionData = {
        prompt: 'a'.repeat(5001), // Too long
        response: 'Valid response'
      };

      const response = await request(app)
        .post('/api/ai/interactions')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(interactionData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation error');
    });

    it('should return 401 without authentication', async () => {
      const interactionData = {
        prompt: 'Test prompt',
        response: 'Test response'
      };

      const response = await request(app)
        .post('/api/ai/interactions')
        .send(interactionData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/ai/interactions', () => {
    beforeEach(async () => {
      // Create test AI interactions
      await global.prisma.aiInteraction.createMany({
        data: [
          {
            userId: global.testUsers.user.id,
            prompt: 'First prompt',
            response: 'First response',
            interactionType: 'WORKOUT_PLAN'
          },
          {
            userId: global.testUsers.user.id,
            prompt: 'Second prompt',
            response: 'Second response',
            interactionType: 'DIET_ADVICE'
          },
          {
            userId: global.testUsers.admin.id,
            prompt: 'Admin prompt',
            response: 'Admin response',
            interactionType: 'GENERAL_QA'
          }
        ]
      });
    });

    it('should get user AI interactions', async () => {
      const response = await request(app)
        .get('/api/ai/interactions')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.results).toBe(response.body.data.length);
      
      // Should only get interactions for the authenticated user
      response.body.data.forEach(interaction => {
        expect(['First prompt', 'Second prompt']).toContain(interaction.prompt);
      });
    });

    it('should paginate AI interactions', async () => {
      const response = await request(app)
        .get('/api/ai/interactions?page=1&limit=1')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });

    it('should filter by interaction type', async () => {
      const response = await request(app)
        .get('/api/ai/interactions?interactionType=WORKOUT_PLAN')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(interaction => {
        expect(interaction.interactionType).toContain('WORKOUT_PLAN');
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/ai/interactions')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/ai/interactions/:id', () => {
    it('should get AI interaction by id', async () => {
      const interaction = await global.prisma.aiInteraction.create({
        data: {
          userId: global.testUsers.user.id,
          prompt: 'Test prompt for detail',
          response: 'Test response for detail',
          interactionType: 'WORKOUT_PLAN'
        }
      });

      const response = await request(app)
        .get(`/api/ai/interactions/${interaction.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(interaction.id);
      expect(response.body.data.prompt).toBe('Test prompt for detail');
      expect(response.body.data.response).toBe('Test response for detail');
    });

    it('should return 404 for non-existent interaction', async () => {
      const response = await request(app)
        .get('/api/ai/interactions/999999')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('AI interaction not found');
    });

    it('should return 403 for interaction belonging to another user', async () => {
      const interaction = await global.prisma.aiInteraction.create({
        data: {
          userId: global.testUsers.admin.id,
          prompt: 'Admin prompt',
          response: 'Admin response'
        }
      });

      const response = await request(app)
        .get(`/api/ai/interactions/${interaction.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/ai/interactions/:id', () => {
    it('should delete AI interaction', async () => {
      const interaction = await global.prisma.aiInteraction.create({
        data: {
          userId: global.testUsers.user.id,
          prompt: 'Interaction to delete',
          response: 'Response to delete'
        }
      });

      const response = await request(app)
        .delete(`/api/ai/interactions/${interaction.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('AI interaction deleted successfully');

      // Verify deletion
      const deletedInteraction = await global.prisma.aiInteraction.findUnique({
        where: { id: interaction.id }
      });
      expect(deletedInteraction).toBeNull();
    });

    it('should return 403 for interaction belonging to another user', async () => {
      const interaction = await global.prisma.aiInteraction.create({
        data: {
          userId: global.testUsers.admin.id,
          prompt: 'Protected interaction',
          response: 'Protected response'
        }
      });

      const response = await request(app)
        .delete(`/api/ai/interactions/${interaction.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });
});