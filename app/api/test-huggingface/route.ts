import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Hugging Face API key not found' }, { status: 500 });
    }

    if (apiKey === 'your_huggingface_api_key_here') {
      return NextResponse.json({ error: 'Please replace the placeholder API key' }, { status: 500 });
    }

    // Test a simple Hugging Face API call
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-small', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: "Hello, how are you?",
        parameters: {
          max_length: 50,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Hugging Face API Error',
        status: response.status,
        details: data 
      }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true, 
      response: data,
      apiKey: `${apiKey.substring(0, 10)}...` // Show first 10 chars for verification
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
