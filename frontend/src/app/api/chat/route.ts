import { NextRequest, NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';

export async function POST(request: NextRequest) {
  try {
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY || '',
      timeout: 4000
    });

    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase().trim();

    // General fitness responses
    const response = await cohere.chat({
      message: `Respond to this fitness question in a friendly, casual tone but keep it under 8 sentences: ${lastMessage}.`,
      model: 'command',
      max_tokens: 400,
      temperature: 0.6, // Slightly more creative
      preamble: `When responding to a greeting/goodbye/thankyou message, keep it VERY CONCISE and under 2 sentences. You're a knowledgeable but approachable fitness coach. Be concise but add a tiny bit of personality.`,
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