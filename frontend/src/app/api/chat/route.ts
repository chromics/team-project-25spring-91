import { NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';

// Initialize the Cohere client
const getCohereClient = () => {
return new CohereClient({
    token: process.env.COHERE_API_KEY || '',
  });
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, chatHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const cohere = getCohereClient();

    // Format history for Cohere
    const formattedHistory = chatHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'USER' : 'CHATBOT',
      message: msg.content
    }));

    // Call Cohere Chat API
    const response = await cohere.chat({
      message: message,
      chatHistory: formattedHistory,
      model: 'command-light', // Use a model available in the free tier
      temperature: 0.7
    });

    // Return the AI response
    return NextResponse.json({
      response: response.text
    });

  } catch (error: any) {
    console.error('Error in chat API:', error);

    return NextResponse.json(
      {
        error: `An error occurred: ${error.message}`
      },
      { status: 500 }
    );
  }
}