// app/api/chat/route.ts (cohere api)
import { NextRequest, NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';

export async function POST(request: NextRequest) {
  try {
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY || '',
    });

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Extract the last message as the current query
    const lastMessage = messages[messages.length - 1].content;

    // Format previous messages and filter out any without content
    const chatHistory = messages
      .slice(0, -1)
      .filter(msg => msg.content && msg.content.trim() !== '') // Remove empty messages
      .map(msg => ({
        role: msg.role === 'user' ? 'User' : 'Chatbot',
        message: msg.content.trim() // Ensure content is trimmed
      }));

    console.log('Sending to Cohere:', {
      message: lastMessage,
      chatHistoryLength: chatHistory.length,
      chatHistory: chatHistory.slice(0, 2) // Log sample for debugging
    });

    // If there's no chat history, don't include it in the request
    const requestOptions = {
      message: lastMessage,
      model: 'command-light',
      preamble: "You are a helpful health assistant for the SUSTracker app. Provide friendly and accurate health advice."
    };

    // Only include chat_history if it's not empty
    if (chatHistory.length > 0) {
      requestOptions.chat_history = chatHistory;
    }

    // Call Cohere Chat API
    const response = await cohere.chat(requestOptions);

    return NextResponse.json({
      response: response.text
    });
  } catch (error) {
    console.error('Cohere API error:', error);

    // Log the error details for debugging
    console.error('Status code:', error.statusCode);
    console.error('Body:', error.body);

    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        message: error.message,
        statusCode: error.statusCode,
        body: error.body
      },
      { status: 500 }
    );
  }
}