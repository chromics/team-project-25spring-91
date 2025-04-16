// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import type { WitResponse } from '@/types/chat';

const WIT_ACCESS_TOKEN = process.env.WIT_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Call Wit.ai API
    const response = await axios.get<WitResponse>('https://api.wit.ai/message', {
      params: {
        q: message,
      },
      headers: {
        'Authorization': `Bearer ${WIT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Extract intent and entities
    const data = response.data;
    const intents = data.intents || [];
    const topIntent = intents.length > 0 ? intents[0].name : null;
    const confidence = intents.length > 0 ? intents[0].confidence : 0;
    const entities = data.entities || {};

    // Generate appropriate response
    let botResponse = handleIntent(topIntent, entities, confidence);

    return NextResponse.json({ response: botResponse });
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function handleIntent(
  intent: string | null,
  entities: Record<string, any[]>,
  confidence: number
): string {
  // Default response if no intent matches or confidence is low
  if (!intent || confidence < 0.7) {
    return "I'm not sure I understand. Could you rephrase that?";
  }

  // Handle different intents
  switch (intent) {
    case 'greeting':
      return "Hello! I'm your fitness assistant. How can I help you today?";

    case 'workout_recommendations':
      // Check for muscle group entity if you defined one
      const muscleGroup = entities['muscle_group:muscle_group']?.[0]?.value;

      if (muscleGroup) {
        return `For ${muscleGroup} training, I recommend focusing on exercises like ${getExercisesForMuscle(muscleGroup)}.`;
      } else {
        return "For a balanced workout, I recommend combining compound exercises like squats, bench press, and rows with some cardio. What muscle groups would you like to focus on?";
      }

    case 'exercise_form':
      return "Proper form is crucial for preventing injuries. Make sure to maintain good posture, engage your core, and move through the full range of motion. Would you like specific form advice for a particular exercise?";

    // Add cases for other intents

    default:
      return "I'm still learning about fitness topics. Could you ask me about workout recommendations or exercise form?";
  }
}

function getExercisesForMuscle(muscle: string): string {
  const exercises: Record<string, string> = {
    chest: "bench press, push-ups, and chest flyes",
    legs: "squats, lunges, and leg press",
    arms: "bicep curls, tricep dips, and hammer curls",
    back: "pull-ups, rows, and lat pulldowns",
    shoulders: "overhead press, lateral raises, and face pulls",
    core: "planks, crunches, and Russian twists"
  };

  return exercises[muscle.toLowerCase()] || "various targeted exercises";
}