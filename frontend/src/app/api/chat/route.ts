// frontend/src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';

// Create a Cohere client instance
const cohere = new CohereClient({
token: process.env.COHERE_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!process.env.COHERE_API_KEY) {
      throw new Error('COHERE_API_KEY is not configured in environment variables');
    }

    // Parse the request body
    const { message, history = [] } = await request.json();

    // Format the conversation history for Cohere
    const chatHistory = history.map(item => ({
      role: item.role === 'user' ? 'USER' : 'CHATBOT',
      message: item.parts
    }));

    // Prepare the system prompt
    const systemPrompt = "You are a fitness and workout assistant. Provide accurate, helpful information about exercise, nutrition, and general fitness. Keep your responses concise and actionable.";

    // Generate a response using Cohere's chat endpoint
    const response = await cohere.chat({
      message: message,
      chatHistory: chatHistory,
      model: 'command', // You can also use 'command-light' or other Cohere models
      temperature: 0.7,
      preamble: systemPrompt,
      maxTokens: 800,
    });

    // Extract the response text
    const responseText = response.text;

    // Update the conversation history
    const updatedHistory = [
      ...history,
      { role: 'user', parts: message },
      { role: 'model', parts: responseText }
    ];

    // Return the response
    return NextResponse.json({
      response: responseText,
      history: updatedHistory
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error in chat API:', error);

    // Check for specific error types
    if (error.status === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          details: error.message
        },
        { status: 429 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        {
          error: 'Invalid API key or authentication error.',
          details: error.message
        },
        { status: 401 }
      );
    }

    // Return a general error response
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error.message
      },
      { status: 500 }
    );
  }
}