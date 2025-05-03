import { NextRequest, NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';

export async function POST(request: NextRequest) {
  try {
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY || '',
      timeout: 4000
    });

    const { messages } = await request.json();

    // include last 3 message + current user message in request
    const recentMessages = messages.slice(-4);
    const lastMessage = recentMessages[recentMessages.length - 1].content.toLowerCase().trim();

    const chatHistory = recentMessages
      .slice(0, -1)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
        message: msg.content
      }));

    const response = await cohere.chat({
      message: lastMessage,
      model: 'command',
      max_tokens: 500,
      temperature: 0.6,
      chat_history: chatHistory,
      preamble: `You're a knowledgeable but approachable fitness coach. Always stay on topic. When responding to a greeting/goodbye/thankyou, be VERY CONCISE (under 2 sentences). Be friendly and clear.`,
      stop_sequences: ['###END###']
    });

    return NextResponse.json({
      response: response.text.replace(/^(great!|awesome!)\s*/i, '')
    });

  } catch (error) {
    return NextResponse.json(
      { response: "Sorry, I'm currently having trouble processing your request." },
      { status: 500 }
    );
  }
}
