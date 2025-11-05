import { getWorkoutPlanningSystemPrompt, generateUserPrompt } from './openai-prompt';

interface UserHistory {
  recentExercises?: string[];
  averageSessionDuration?: number;
  preferredSplitType?: string;
}

interface GenerateWorkoutPlanOptions {
  userInput: string;
  userHistory?: UserHistory;
}

/**
 * Call the OpenAI API through our Next.js API route
 */
export async function generateWorkoutPlan({ userInput, userHistory }: GenerateWorkoutPlanOptions): Promise<string> {
  try {
    const response = await fetch('/api/ai/workout-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput,
        userHistory,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
}

