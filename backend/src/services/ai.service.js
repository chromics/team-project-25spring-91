// backend/src/services/ai.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const OpenAI = require('openai');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEEPSEEK_TIMEOUT = parseInt(process.env.DEEPSEEK_TIMEOUT_MS || '60000', 10);

const MAX_CONTEXT_INTERACTIONS = 5;
const DAILY_CONVERSATION_LIMIT = 10;

let deepseekClient;

if (DEEPSEEK_API_KEY && DEEPSEEK_BASE_URL) {
  try {
    deepseekClient = new OpenAI({
      apiKey: DEEPSEEK_API_KEY,
      baseURL: DEEPSEEK_BASE_URL,
      timeout: DEEPSEEK_TIMEOUT,
    });
    console.log(`BACKEND_SERVICE: DeepSeek client initialized. BaseURL: ${DEEPSEEK_BASE_URL}, Model: ${DEEPSEEK_MODEL}`);
  } catch (initError) {
    console.error("BACKEND_SERVICE: CRITICAL ERROR initializing DeepSeek client:", initError.message);
    deepseekClient = null;
  }
} else {
  console.error("BACKEND_SERVICE: DeepSeek API Key or Base URL missing. AI functionality disabled.");
  deepseekClient = null;
}

const aiService = {
  generateChatResponseAndLog: async (userId, userPrompt) => {
    if (!deepseekClient) {
      throw new ApiError(503, 'AI service is not configured or unavailable.');
    }

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const interactionsToday = await prisma.aiInteraction.count({
        where: {
          userId: userId,
          interactionType: "CHAT", 
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      });

      if (interactionsToday >= DAILY_CONVERSATION_LIMIT) {
        throw new ApiError(429, `You have reached your daily limit of ${DAILY_CONVERSATION_LIMIT} AI interactions. Please try again tomorrow.`);
      }
    } catch (limitError) {
      if (limitError instanceof ApiError) throw limitError;
      console.error("BACKEND_SERVICE: Error checking daily usage limit:", limitError.message);
      throw new ApiError(500, "Could not verify usage limits. Please try again.");
    }

    // --- FETCH CONTEXT ---
    let contextMessages = [];
    try {
      const recentInteractions = await prisma.aiInteraction.findMany({ 
        where: { userId: userId, interactionType: "CHAT_DEEPSEEK" },
        orderBy: { createdAt: 'desc' },
        take: MAX_CONTEXT_INTERACTIONS, 
        select: { prompt: true, response: true }
      });

      for (const interaction of recentInteractions.reverse()) {
        contextMessages.push({ role: "user", content: interaction.prompt });
        if (interaction.response && !interaction.response.toLowerCase().startsWith("sorry, i encountered an error")) {
          contextMessages.push({ role: "assistant", content: interaction.response });
        }
      }
    } catch (err) {
      console.error("BACKEND_SERVICE: Error fetching context interactions:", err.message);
    }


    let aiTextResponse = "";
    try {
      const messagesForAI = [
        { role: "system", content: "You are a helpful assistant. Be concise and friendly. Consider the preceding conversation turns for context if provided." },
        ...contextMessages,
        { role: "user", content: userPrompt }, 
      ];
      const completion = await deepseekClient.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: messagesForAI,
        max_tokens: 1024,
        temperature: 0.7,
      });

      aiTextResponse = completion.choices[0]?.message?.content?.trim() || "AI service returned an empty response.";
    } catch (error) {
      console.error("BACKEND_SERVICE: ERROR calling DeepSeek API - Name:", error.name, "Message:", error.message, "Status:", error.status);
      if (process.env.NODE_ENV === 'development') console.error("Stack:", error.stack);
      aiTextResponse = "Sorry, I encountered an issue while trying to reach the AI service. Please try again later.";
    }

    const interactionData = {
      prompt: userPrompt,
      response: aiTextResponse,
      interactionType: "CHAT_DEEPSEEK",
    };

    try {
      const loggedInteraction = await aiService.createInteraction(userId, interactionData);
      return {
        aiResponse: aiTextResponse,
        interactionId: loggedInteraction.id,
        createdAt: loggedInteraction.createdAt
      };
    } catch (dbError) {
      console.error("BACKEND_SERVICE: CRITICAL ERROR saving interaction to DB:", dbError.message);
      if (process.env.NODE_ENV === 'development') console.error("Stack:", dbError.stack);
      throw new ApiError(500, 'Failed to log AI interaction. Please contact support.');
    }
  },

  createInteraction: async (userId, data) => {
    const { prompt, response, interactionType } = data;
    return prisma.aiInteraction.create({
      data: { userId, prompt, response, interactionType },
      select: { id: true, userId: true, prompt: true, response: true, interactionType: true, createdAt: true }
    });
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
      where, orderBy: { createdAt: 'desc' }, skip, take: limit,
      select: { id: true, prompt: true, response: true, interactionType: true, createdAt: true }
    });
    return { interactions, pagination: { page, limit, totalPages, totalItems } };
  },

  getInteractionById: async (userId, interactionId) => {
    const interaction = await prisma.aiInteraction.findUnique({
      where: { id: interactionId },
      select: { id: true, userId: true, prompt: true, response: true, interactionType: true, createdAt: true }
    });
    if (!interaction) throw new ApiError(404, 'AI interaction not found');
    if (interaction.userId !== userId) throw new ApiError(403, 'You do not have permission to view this interaction');
    return interaction;
  },

  deleteInteraction: async (userId, interactionId) => {
    const interaction = await prisma.aiInteraction.findUnique({ where: { id: interactionId } });
    if (!interaction) throw new ApiError(404, 'AI interaction not found');
    if (interaction.userId !== userId) throw new ApiError(403, 'You do not have permission to delete this interaction');
    await prisma.aiInteraction.delete({ where: { id: interactionId } });
    return true;
  },
};

module.exports = { aiService };
