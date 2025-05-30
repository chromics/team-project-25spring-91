const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Diet Entry Routes', () => {
  let testFoodItem;

  beforeEach(async () => {
    // Create test food item for diet entries
    testFoodItem = await global.prisma.foodItem.create({
      data: {
        name: 'Test Food for Diet',
        caloriesPerUnit: 100,
        servingUnit: '100g',
        description: 'Food item for testing diet entries'
      }
    });
  });

  describe('GET /api/diet', () => {
    it('should get user diet entries with pagination', async () => {
      // Create test diet entry
      await global.prisma.dietEntry.create({
        data: {
          userId: global.testUsers.user.id,
          foodId: testFoodItem.id,
          quantity: 1.5,
          calories: 150,
          consumptionDate: new Date(),
          mealType: 'breakfast'
        }
      });

      const response = await request(app)
        .get('/api/diet')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.results).toBe(response.body.data.length);
    });

    it('should filter diet entries by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/diet?startDate=${today}&endDate=${tomorrowStr}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should filter diet entries by meal type', async () => {
      const response = await request(app)
        .get('/api/diet?mealType=breakfast')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should paginate diet entries', async () => {
      const response = await request(app)
        .get('/api/diet?page=1&limit=5')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/diet/all', () => {
    it('should get all user diet entries without pagination', async () => {
      const response = await request(app)
        .get('/api/diet/all')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeUndefined();
    });
  });

  describe('POST /api/diet', () => {
    it('should create diet entry', async () => {
      const dietData = {
        foodId: testFoodItem.id,
        quantity: 2,
        consumptionDate: new Date().toISOString(),
        mealType: 'lunch',
        notes: 'Delicious meal'
      };

      const response = await request(app)
        .post('/api/diet')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(dietData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Diet entry created successfully');
      expect(parseInt(response.body.data.quantity)).toBe(dietData.quantity);
      expect(response.body.data.mealType).toBe(dietData.mealType);
      expect(response.body.data.calories).toBe("200"); // 100 * 2
    });

    it('should return 404 for non-existent food item', async () => {
      const dietData = {
        foodId: 999999,
        quantity: 1,
        consumptionDate: new Date().toISOString(),
        mealType: 'breakfast'
      };

      const response = await request(app)
        .post('/api/diet')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(dietData)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Food item not found');
    });

    it('should validate required fields', async () => {
      const dietData = {
        quantity: 1,
        consumptionDate: new Date().toISOString()
        // Missing foodId
      };

      const response = await request(app)
        .post('/api/diet')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(dietData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('GET /api/diet/:id', () => {
    it('should get diet entry by id', async () => {
      const dietEntry = await global.prisma.dietEntry.create({
        data: {
          userId: global.testUsers.user.id,
          foodId: testFoodItem.id,
          quantity: 1,
          calories: 100,
          consumptionDate: new Date(),
          mealType: 'dinner'
        }
      });

      const response = await request(app)
        .get(`/api/diet/${dietEntry.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(dietEntry.id);
      expect(response.body.data.mealType).toBe('dinner');
    });

    it('should return 404 for non-existent diet entry', async () => {
      const response = await request(app)
        .get('/api/diet/999999')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Diet entry not found');
    });

    it('should return 403 for diet entry belonging to another user', async () => {
      const dietEntry = await global.prisma.dietEntry.create({
        data: {
          userId: global.testUsers.admin.id,
          foodId: testFoodItem.id,
          quantity: 1,
          calories: 100,
          consumptionDate: new Date()
        }
      });

      const response = await request(app)
        .get(`/api/diet/${dietEntry.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/diet/:id', () => {
    it('should update diet entry', async () => {
      const dietEntry = await global.prisma.dietEntry.create({
        data: {
          userId: global.testUsers.user.id,
          foodId: testFoodItem.id,
          quantity: 1,
          calories: 100,
          consumptionDate: new Date(),
          mealType: 'breakfast'
        }
      });

      const updateData = {
        quantity: 2,
        mealType: 'lunch',
        notes: 'Updated meal'
      };

      const response = await request(app)
        .put(`/api/diet/${dietEntry.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Diet entry updated successfully');
      expect(parseInt(response.body.data.quantity)).toBe(updateData.quantity);
      expect(response.body.data.mealType).toBe(updateData.mealType);
      expect(response.body.data.calories).toBe("200"); // Recalculated: 100 * 2
    });

    it('should return 403 for diet entry belonging to another user', async () => {
      const dietEntry = await global.prisma.dietEntry.create({
        data: {
          userId: global.testUsers.admin.id,
          foodId: testFoodItem.id,
          quantity: 1,
          calories: 100,
          consumptionDate: new Date()
        }
      });

      const updateData = {
        quantity: 2
      };

      const response = await request(app)
        .put(`/api/diet/${dietEntry.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/diet/:id', () => {
    it('should delete diet entry', async () => {
      const dietEntry = await global.prisma.dietEntry.create({
        data: {
          userId: global.testUsers.user.id,
          foodId: testFoodItem.id,
          quantity: 1,
          calories: 100,
          consumptionDate: new Date()
        }
      });

      const response = await request(app)
        .delete(`/api/diet/${dietEntry.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Diet entry deleted successfully');

      // Verify deletion
      const deletedEntry = await global.prisma.dietEntry.findUnique({
        where: { id: dietEntry.id }
      });
      expect(deletedEntry).toBeNull();
    });

    it('should return 403 for diet entry belonging to another user', async () => {
      const dietEntry = await global.prisma.dietEntry.create({
        data: {
          userId: global.testUsers.admin.id,
          foodId: testFoodItem.id,
          quantity: 1,
          calories: 100,
          consumptionDate: new Date()
        }
      });

      const response = await request(app)
        .delete(`/api/diet/${dietEntry.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/diet/summary', () => {
    it('should get diet summary for user', async () => {
      // Create test diet entries
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await global.prisma.dietEntry.createMany({
        data: [
          {
            userId: global.testUsers.user.id,
            foodId: testFoodItem.id,
            quantity: 1,
            calories: 100,
            consumptionDate: today,
            mealType: 'breakfast'
          },
          {
            userId: global.testUsers.user.id,
            foodId: testFoodItem.id,
            quantity: 2,
            calories: 200,
            consumptionDate: yesterday,
            mealType: 'lunch'
          }
        ]
      });

      const response = await request(app)
        .get('/api/diet/summary')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.totalEntries).toBeGreaterThanOrEqual(2);
      expect(response.body.data.totalCalories).toBeGreaterThanOrEqual(300);
      expect(response.body.data.dailyCalories).toBeInstanceOf(Array);
      expect(response.body.data.mealTypeSummary).toBeDefined();
    });

    it('should filter summary by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/diet/summary?startDate=${today}&endDate=${tomorrowStr}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.period.startDate).toBe(today);
      expect(response.body.data.period.endDate).toBe(tomorrowStr);
    });
  });
});