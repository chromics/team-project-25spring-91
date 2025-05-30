// src/services/ai.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const aiService = {
  createInteraction: async (userId, data) => {
    const { prompt, response, interactionType /*, contextualData */ } = data;

    const interaction = await prisma.aiInteraction.create({
      data: {
        userId,
        prompt,
        response,
        interactionType,
        // contextualData, // Uncomment if using
      },
      select: { // Select the fields you want to return
        id: true,
        userId: true,
        prompt: true,
        response: true,
        interactionType: true,
        createdAt: true,
      }
    });
    return interaction;
  },

  getUserInteractions: async (userId, { page = 1, limit = 10, interactionType }) => {
    const skip = (page - 1) * limit;
    const where = { userId };

    if (interactionType) {
      where.interactionType = { contains: interactionType, mode: 'insensitive' };
    }

    const totalItems = await prisma.aiInteraction.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const interactions = await prisma.aiInteraction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        prompt: true, // Maybe a truncated version for list view? For now, full.
        response: true,
        interactionType: true,
        createdAt: true,
      }
    });

    return {
      interactions,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
    };
  },

  getInteractionById: async (userId, interactionId) => {
    const interaction = await prisma.aiInteraction.findUnique({
      where: { id: interactionId },
      select: {
        id: true,
        userId: true,
        prompt: true,
        response: true,
        interactionType: true,
        createdAt: true,
      }
    });

    if (!interaction) {
      throw new ApiError(404, 'AI interaction not found');
    }
    if (interaction.userId !== userId) {
      // For admin access, this check would be different
      throw new ApiError(403, 'You do not have permission to view this interaction');
    }
    return interaction;
  },

  deleteInteraction: async (userId, interactionId) => {
    const interaction = await prisma.aiInteraction.findUnique({
      where: { id: interactionId },
    });

    if (!interaction) {
      throw new ApiError(404, 'AI interaction not found');
    }
    if (interaction.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this interaction');
    }

    await prisma.aiInteraction.delete({
      where: { id: interactionId },
    });
    return true;
  },
};

module.exports = { aiService };
