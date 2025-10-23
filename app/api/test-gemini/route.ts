import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not found' }, { status: 500 });
    }

    if (apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'Please replace the placeholder API key' }, { status: 500 });
    }

    // Test a simple Gemini API call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Generate a friendly reply to: "Hey, can we meet tomorrow?" for WhatsApp. Make it casual and helpful.'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Gemini API Error',
        status: response.status,
        details: data 
      }, { status: response.status });
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ 
      success: true, 
      response: generatedText,
      fullResponse: data,
      apiKey: `${apiKey.substring(0, 10)}...` // Show first 10 chars for verification
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
