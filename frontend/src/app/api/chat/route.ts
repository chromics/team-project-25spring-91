import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-jwt-secret");
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const { prompt, conversationId, interactionType } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get OpenAI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Be concise and friendly in your responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversationId || Date.now().toString(),
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
