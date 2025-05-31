// backend/src/controllers/ai.controller.js
const { aiService } = require('../services/ai.service');

const aiController = {
  generateChatResponse: async (req, res) => {
    const userId = req.user.id; 
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ status: 'fail', message: 'Prompt is required.' });
    }

    const result = await aiService.generateChatResponseAndLog(userId, prompt);
    res.status(200).json({ 
      status: 'success',
      message: 'AI response generated and interaction logged.',
      data: result, 
    });
  },

  createInteraction: async (req, res) => {
    const userId = req.user.id;
    const interaction = await aiService.createInteraction(userId, req.body);
    res.status(201).json({ status: 'success', message: 'AI interaction logged successfully', data: interaction });
  },

  getUserInteractions: async (req, res) => {
    const userId = req.user.id;
    const { page, limit, interactionType } = req.query;
    const result = await aiService.getUserInteractions(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      interactionType,
    });
    res.status(200).json({ status: 'success', results: result.interactions.length, pagination: result.pagination, data: result.interactions });
  },

  getInteractionById: async (req, res) => {
    const userId = req.user.id;
    const interactionId = parseInt(req.params.id);
    const interaction = await aiService.getInteractionById(userId, interactionId);
    res.status(200).json({ status: 'success', data: interaction });
  },

  deleteInteraction: async (req, res) => {
    const userId = req.user.id;
    const interactionId = parseInt(req.params.id);
    await aiService.deleteInteraction(userId, interactionId);
    res.status(200).json({ status: 'success', message: 'AI interaction deleted successfully' });
  },
};

module.exports = { aiController };
