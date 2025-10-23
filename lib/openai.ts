import { Reminder } from './types';

export interface ReplySuggestion {
  id: string;
  text: string;
  tone: 'professional' | 'casual' | 'friendly' | 'apologetic' | 'enthusiastic';
  platform: string;
}

export interface AIReplyRequest {
  reminder: Reminder;
  context?: string;
  preferredTone?: string;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateReplySuggestions(request: AIReplyRequest): Promise<ReplySuggestion[]> {
    const { reminder, context, preferredTone } = request;
    
    const prompt = this.buildPrompt(reminder, context, preferredTone);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates appropriate reply suggestions for different messaging platforms. Always provide practical, contextual, and platform-appropriate responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          n: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      return this.parseAIResponse(aiResponse, reminder.platform);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return this.getFallbackSuggestions(reminder);
    }
  }

  private buildPrompt(reminder: Reminder, context?: string, preferredTone?: string): string {
    const platformContext = this.getPlatformContext(reminder.platform);
    
    return `
Generate 3-4 reply suggestions for a ${reminder.platform} message reminder.

Context:
- Platform: ${reminder.platform}
- Reminder: "${reminder.title}"
- Notes: ${reminder.note || 'None'}
- Additional context: ${context || 'None'}
- Preferred tone: ${preferredTone || 'Mixed tones'}

${platformContext}

Please provide suggestions in different tones:
1. Professional/Formal
2. Casual/Friendly  
3. Apologetic (if delayed response)
4. Enthusiastic/Positive

Format your response as JSON array with this structure:
[
  {
    "text": "Your reply suggestion here",
    "tone": "professional|casual|friendly|apologetic|enthusiastic"
  }
]

Make sure replies are:
- Appropriate for ${reminder.platform}
- Contextually relevant to "${reminder.title}"
- Natural and conversational
- Ready to send (complete messages)
    `.trim();
  }

  private getPlatformContext(platform: string): string {
    const contexts = {
      whatsapp: 'WhatsApp is casual and personal. Use emojis sparingly, keep messages conversational.',
      email: 'Email should be more formal with proper greetings and closings. Include subject context.',
      instagram: 'Instagram is visual and casual. Keep responses brief and engaging.',
      twitter: 'Twitter has character limits. Be concise and engaging.',
      linkedin: 'LinkedIn is professional. Maintain business-appropriate tone.',
      telegram: 'Telegram is like WhatsApp but can be more technical/detailed.',
      discord: 'Discord is casual and community-focused. Can be playful.',
      slack: 'Slack is workplace communication. Be professional but friendly.',
      other: 'General messaging platform. Keep responses versatile and appropriate.'
    };

    return contexts[platform.toLowerCase() as keyof typeof contexts] || contexts.other;
  }

  private parseAIResponse(response: string, platform: string): ReplySuggestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((item: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          text: item.text,
          tone: item.tone || 'casual',
          platform: platform
        }));
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    // Fallback: try to extract suggestions from text
    const lines = response.split('\n').filter(line => line.trim());
    const suggestions: ReplySuggestion[] = [];
    
    lines.forEach((line, index) => {
      if (line.includes('"') || line.includes('•') || line.includes('-')) {
        const text = line.replace(/^[\d\.\-\•\*\s]+/, '').replace(/['"]/g, '').trim();
        if (text.length > 10) {
          suggestions.push({
            id: `ai-fallback-${index}`,
            text: text,
            tone: this.inferTone(text),
            platform: platform
          });
        }
      }
    });

    return suggestions.slice(0, 4);
  }

  private inferTone(text: string): ReplySuggestion['tone'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('sorry') || lowerText.includes('apologize') || lowerText.includes('delayed')) {
      return 'apologetic';
    }
    if (lowerText.includes('excited') || lowerText.includes('great') || lowerText.includes('awesome')) {
      return 'enthusiastic';
    }
    if (lowerText.includes('dear') || lowerText.includes('sincerely') || lowerText.includes('regards')) {
      return 'professional';
    }
    if (lowerText.includes('hey') || lowerText.includes('thanks') || lowerText.includes('sure')) {
      return 'casual';
    }
    
    return 'friendly';
  }

  private getFallbackSuggestions(reminder: Reminder): ReplySuggestion[] {
    const platformSpecific = {
      email: [
        { text: "Thank you for your message. I'll review this and get back to you shortly.", tone: 'professional' as const },
        { text: "Hi! Thanks for reaching out. Let me check on this and respond soon.", tone: 'friendly' as const },
        { text: "I apologize for the delayed response. I'll address this right away.", tone: 'apologetic' as const }
      ],
      whatsapp: [
        { text: "Hey! Just saw your message. Let me get back to you on this 👍", tone: 'casual' as const },
        { text: "Thanks for the message! I'll check and reply soon.", tone: 'friendly' as const },
        { text: "Sorry for the late reply! Looking into this now.", tone: 'apologetic' as const }
      ],
      default: [
        { text: "Thanks for your message! I'll get back to you soon.", tone: 'friendly' as const },
        { text: "I'll review this and respond shortly.", tone: 'professional' as const },
        { text: "Sorry for the delay! I'll respond to this right away.", tone: 'apologetic' as const }
      ]
    };

    const suggestions = platformSpecific[reminder.platform as keyof typeof platformSpecific] || platformSpecific.default;
    
    return suggestions.map((suggestion, index) => ({
      id: `fallback-${Date.now()}-${index}`,
      text: suggestion.text,
      tone: suggestion.tone,
      platform: reminder.platform
    }));
  }
}

// Create a singleton instance
export const openaiService = new OpenAIService(process.env.OPENAI_API_KEY || '');
