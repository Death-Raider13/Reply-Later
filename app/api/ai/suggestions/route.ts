import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai';
import { freeAIService } from '@/lib/free-ai';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { reminder, context, preferredTone } = body;

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder data is required' },
        { status: 400 }
      );
    }

    // Validate reminder structure
    if (!reminder.title || !reminder.platform) {
      return NextResponse.json(
        { error: 'Reminder must have title and platform' },
        { status: 400 }
      );
    }

    let suggestions = [];
    let aiProvider = 'fallback';

    // Use Hugging Face as primary AI provider
    try {
      suggestions = await freeAIService.generateReplySuggestions({
        reminder,
        context,
        preferredTone
      });
      aiProvider = 'free-ai';
      console.log('Hugging Face AI generated suggestions successfully');
    } catch (freeAIError) {
      console.log('Hugging Face failed, trying OpenAI fallback...', freeAIError);
      
      // Fallback to OpenAI if Hugging Face fails
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        try {
          const openaiService = new OpenAIService(openaiKey);
          suggestions = await openaiService.generateReplySuggestions({
            reminder,
            context,
            preferredTone
          });
          aiProvider = 'openai';
          console.log('OpenAI fallback successful');
        } catch (openaiError) {
          console.log('Both AI services failed, this should not happen as free-ai has smart templates fallback');
          throw openaiError;
        }
      } else {
        console.log('No OpenAI key available for fallback');
        throw freeAIError;
      }
    }

    return NextResponse.json({
      success: true,
      suggestions,
      aiProvider,
      reminder: {
        id: reminder.id,
        title: reminder.title,
        platform: reminder.platform
      }
    });

  } catch (error) {
    console.error('All AI services failed, this should not happen as free-ai has fallbacks');
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
