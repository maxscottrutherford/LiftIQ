import { NextRequest, NextResponse } from 'next/server';
import { getWorkoutPlanningSystemPrompt, generateUserPrompt } from '@/lib/ai-coaching/openai-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, userHistory } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    // Get and trim API key to remove any whitespace
    let apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please check your .env.local file.' },
        { status: 500 }
      );
    }

    // Remove any potential newlines or carriage returns
    apiKey = apiKey.replace(/\r?\n|\r/g, '').trim();

    // Validate API key format (OpenAI keys start with 'sk-')
    if (!apiKey.startsWith('sk-')) {
      console.error('OPENAI_API_KEY format appears invalid');
      return NextResponse.json(
        { error: 'Invalid API key format. OpenAI keys should start with "sk-"' },
        { status: 500 }
      );
    }

    // Generate prompts
    const systemPrompt = getWorkoutPlanningSystemPrompt();
    const userPrompt = generateUserPrompt(userInput, userHistory);

    // Prepare the request
    // Note: When using json_object mode, the system prompt must explicitly mention JSON
    const requestBody = {
      model: 'gpt-4o-mini', // Using the cheaper, faster model
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' } as const, // Force JSON response
    };

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText };
      }
      
      console.error('OpenAI API error:', errorData);
      
      // Extract more specific error message
      let errorMessage = 'Failed to generate workout plan';
      if (errorData.error) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error.code) {
          errorMessage = `${errorData.error.message || 'API Error'}: ${errorData.error.code}`;
        }
      }
      
      // Check for specific error types
      if (errorMessage.includes('Incorrect API key') || 
          errorMessage.includes('invalid_api_key') || 
          errorMessage.includes('Invalid API key') ||
          response.status === 401) {
        errorMessage = 'The API key provided is incorrect or invalid. Please:\n1. Verify your key at https://platform.openai.com/api-keys\n2. Check that it starts with "sk-"\n3. Ensure there are no extra spaces or line breaks in .env.local\n4. Restart your dev server after updating .env.local';
      } else if (errorMessage.includes('insufficient_quota') || errorMessage.includes('billing')) {
        errorMessage = 'Your OpenAI account has insufficient credits. Please add credits at https://platform.openai.com/account/billing';
      } else if (errorMessage.includes('rate_limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          statusCode: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: aiResponse,
    });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

