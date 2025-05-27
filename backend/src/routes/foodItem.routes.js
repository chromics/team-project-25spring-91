// src/routes/foodItem.routes.js
const express = require('express');
const { foodItemController } = require('../controllers/foodItem.controller');
const { validate } = require('../middleware/validate');
const { dietSchemas } = require('../validators/diet.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { roleCheck } = require('../middleware/roleCheck');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/all',
  asyncHandler(foodItemController.getAllFoodItemsNoPagination)
);

// Public routes - anyone can search/view food items
router.get(
  '/',
  validate(dietSchemas.searchFoodItems),
  asyncHandler(foodItemController.getAllFoodItems)
);

router.get(
  '/:id',
  validate(dietSchemas.getFoodItem),
  asyncHandler(foodItemController.getFoodItemById)
);

// Admin-only routes - require authentication and admin role
router.use(authMiddleware);
router.use(roleCheck(['admin']));

router.post(
  '/',
  validate(dietSchemas.createFoodItem),
  asyncHandler(foodItemController.createFoodItem)
);

router.put(
  '/:id',
  validate(dietSchemas.updateFoodItem),
  asyncHandler(foodItemController.updateFoodItem)
);

router.delete(
  '/:id',
  validate(dietSchemas.getFoodItem),
  asyncHandler(foodItemController.deleteFoodItem)
);

module.exports = router;