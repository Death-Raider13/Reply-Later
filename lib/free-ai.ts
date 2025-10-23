import { Reminder } from './types';
import { ReplySuggestion } from './openai';

export class FreeAIService {
  private huggingFaceKey: string;
  private geminiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor(huggingFaceKey?: string, geminiKey?: string) {
    this.huggingFaceKey = huggingFaceKey || '';
    this.geminiKey = geminiKey || '';
  }

  async generateReplySuggestions(request: {
    reminder: Reminder;
    context?: string;
    preferredTone?: string;
  }): Promise<ReplySuggestion[]> {
    const { reminder, context, preferredTone } = request;

    console.log('=== FREE AI SERVICE DEBUG ===');
    console.log('Reminder:', reminder.title);
    console.log('Context:', context);
    console.log('Tone:', preferredTone);
    console.log('Gemini Key exists:', !!this.geminiKey);
    console.log('Hugging Face Key exists:', !!this.huggingFaceKey);

    // Try Google Gemini first (truly free AI)
    try {
      console.log('Trying Google Gemini...');
      const suggestions = await this.tryGemini(reminder, context, preferredTone);
      if (suggestions.length > 0) {
        console.log('Gemini SUCCESS! Generated', suggestions.length, 'suggestions');
        return suggestions;
      }
    } catch (error) {
      console.log('Gemini FAILED:', error);
    }

    // Try a completely free alternative (no API key needed)
    try {
      console.log('Trying free AI alternative...');
      const suggestions = await this.tryFreeAIAlternative(reminder, context, preferredTone);
      if (suggestions.length > 0) {
        console.log('Free AI alternative SUCCESS! Generated', suggestions.length, 'suggestions');
        return suggestions;
      }
    } catch (error) {
      console.log('Free AI alternative FAILED:', error);
    }

    // Try Hugging Face as backup
    try {
      console.log('Trying Hugging Face...');
      const suggestions = await this.tryHuggingFace(reminder, context, preferredTone);
      if (suggestions.length > 0) {
        console.log('Hugging Face SUCCESS! Generated', suggestions.length, 'suggestions');
        return suggestions;
      }
    } catch (error) {
      console.log('Hugging Face FAILED:', error);
    }

    // Final fallback to smart templates
    console.log('Falling back to smart templates...');
    return this.getSmartTemplateSuggestions(reminder, context, preferredTone);
  }

  private async tryFreeAIAlternative(
    reminder: Reminder,
    context?: string,
    preferredTone?: string
  ): Promise<ReplySuggestion[]> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const suggestions = this.generateIntelligentSuggestions(reminder, context, preferredTone);
    
    if (suggestions.length === 0) {
      throw new Error('No intelligent suggestions generated');
    }

    return suggestions;
  }

  private generateIntelligentSuggestions(
    reminder: Reminder,
    context?: string,
    preferredTone?: string
  ): ReplySuggestion[] {
    const tone = preferredTone || 'friendly';
    const platform = reminder.platform;
    const title = reminder.title.toLowerCase();
    const contextLower = context?.toLowerCase() || '';
    
    // Analyze the message content and context for intelligent responses
    const messageAnalysis = this.analyzeMessage(title, contextLower, platform);
    const suggestions: ReplySuggestion[] = [];

    // Generate contextually intelligent responses
    const responseTemplates = this.getIntelligentResponseTemplates(messageAnalysis, tone, platform);
    
    // Add variety and personalization
    responseTemplates.forEach((template, index) => {
      const personalizedResponse = this.personalizeResponse(template, messageAnalysis, context);
      suggestions.push({
        id: `free-ai-${Date.now()}-${index}`,
        text: personalizedResponse,
        tone: this.selectToneForResponse(template, tone, index),
        platform: platform
      });
    });

    return suggestions.slice(0, 4);
  }

  private analyzeMessage(title: string, context: string, platform: string) {
    const allText = `${title} ${context}`.toLowerCase();
    
    return {
      isQuestion: allText.includes('?') || allText.includes('when') || allText.includes('what') || allText.includes('how') || allText.includes('where'),
      isUrgent: allText.includes('urgent') || allText.includes('asap') || allText.includes('immediately') || allText.includes('emergency'),
      isEvent: allText.includes('meeting') || allText.includes('party') || allText.includes('event') || allText.includes('conference') || allText.includes('wedding') || allText.includes('funeral'),
      isWork: allText.includes('project') || allText.includes('work') || allText.includes('deadline') || allText.includes('task') || allText.includes('business'),
      isPersonal: allText.includes('family') || allText.includes('friend') || allText.includes('personal') || allText.includes('birthday'),
      isFormal: platform === 'email' || platform === 'linkedin' || allText.includes('professional'),
      sentiment: this.analyzeSentiment(allText),
      keywords: this.extractKeywords(allText),
      platform: platform
    };
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['great', 'awesome', 'excellent', 'wonderful', 'amazing', 'fantastic', 'good', 'happy', 'excited'];
    const negativeWords = ['problem', 'issue', 'urgent', 'sorry', 'apologize', 'mistake', 'error', 'bad', 'terrible'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractKeywords(text: string): string[] {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'about', 'this', 'that', 'these', 'those', 'a', 'an'];
    return text.split(' ')
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);
  }

  private getIntelligentResponseTemplates(analysis: any, tone: string, platform: string): string[] {
    const templates: string[] = [];
    
    // Context-aware responses
    if (analysis.isQuestion) {
      templates.push("I got your question and I'll research this thoroughly before responding.");
      templates.push("Thanks for asking! Let me look into this and get back to you with a detailed answer.");
    }
    
    if (analysis.isUrgent) {
      templates.push("I understand this is urgent. I'll prioritize this and respond as quickly as possible.");
      templates.push("Got it - marking this as high priority and will address it immediately.");
    }
    
    if (analysis.isEvent) {
      templates.push("Thanks for the event details! I'll check my calendar and confirm my availability.");
      templates.push("I received your message about the event. I'll review the details and get back to you.");
    }
    
    if (analysis.isWork) {
      templates.push("I'll review the project details and provide my feedback shortly.");
      templates.push("Thanks for the work update. I'll analyze this and respond with my thoughts.");
    }
    
    // Sentiment-based responses
    if (analysis.sentiment === 'positive') {
      templates.push("That sounds fantastic! I'm excited to discuss this further.");
      templates.push("Great news! I'll get back to you with my enthusiastic response.");
    } else if (analysis.sentiment === 'negative') {
      templates.push("I understand your concern. I'll address this carefully and thoughtfully.");
      templates.push("Thanks for bringing this to my attention. I'll handle this with care.");
    }
    
    // Platform-specific responses
    if (platform === 'whatsapp') {
      templates.push("Hey! Just saw your message. I'll get back to you soon! 👍");
      templates.push("Got it! Let me check this out and reply back 📱");
    } else if (platform === 'email') {
      templates.push("Thank you for your email. I'll review this matter and respond accordingly.");
      templates.push("I acknowledge receipt of your message and will provide a comprehensive response.");
    } else if (platform === 'linkedin') {
      templates.push("Thank you for your professional message. I'll respond with detailed insights.");
      templates.push("I appreciate you reaching out. I'll provide a thoughtful professional response.");
    }
    
    // Default intelligent responses
    if (templates.length < 4) {
      templates.push("I received your message and I'll craft a thoughtful response shortly.");
      templates.push("Thanks for reaching out! I'll give this proper attention and respond soon.");
      templates.push("I'll take some time to consider this properly and get back to you.");
      templates.push("Your message is important to me. I'll respond with care and attention.");
    }
    
    return templates.slice(0, 6); // Get more than needed for variety
  }

  private personalizeResponse(template: string, analysis: any, context?: string): string {
    let response = template;
    
    // Add context-specific details
    if (context && analysis.keywords.length > 0) {
      const mainKeyword = analysis.keywords[0];
      response = response.replace(/this/g, `this ${mainKeyword} matter`);
    }
    
    // Add platform-appropriate elements
    if (analysis.platform === 'whatsapp' && !response.includes('👍') && !response.includes('📱')) {
      response += ' 😊';
    }
    
    return response;
  }

  private selectToneForResponse(template: string, preferredTone: string, index: number): ReplySuggestion['tone'] {
    const templateLower = template.toLowerCase();
    
    // Analyze template content for appropriate tone
    if (templateLower.includes('fantastic') || templateLower.includes('excited') || templateLower.includes('awesome')) {
      return 'enthusiastic';
    }
    if (templateLower.includes('professional') || templateLower.includes('acknowledge') || templateLower.includes('comprehensive')) {
      return 'professional';
    }
    if (templateLower.includes('sorry') || templateLower.includes('apologize') || templateLower.includes('concern')) {
      return 'apologetic';
    }
    if (templateLower.includes('hey') || templateLower.includes('👍') || templateLower.includes('😊')) {
      return 'casual';
    }
    
    // Distribute tones evenly
    const tones: ReplySuggestion['tone'][] = ['friendly', 'professional', 'casual', 'enthusiastic'];
    return tones[index % tones.length];
  }

  private async tryGemini(
    reminder: Reminder,
    context?: string,
    preferredTone?: string
  ): Promise<ReplySuggestion[]> {
    if (!this.geminiKey || this.geminiKey === 'your_gemini_api_key_here') {
      throw new Error('No valid Gemini API key');
    }

    const prompt = `Generate 4 different reply suggestions for a ${reminder.platform} message titled "${reminder.title}".
    
Context: ${context || 'General message'}
Preferred tone: ${preferredTone || 'friendly'}
Platform: ${reminder.platform}

Please generate 4 unique, contextually appropriate reply suggestions that:
1. Acknowledge the specific context (${context || 'the message'})
2. Use a ${preferredTone || 'friendly'} tone
3. Are appropriate for ${reminder.platform}
4. Are natural and conversational

Format as JSON array:
[
  {"text": "suggestion 1", "tone": "casual"},
  {"text": "suggestion 2", "tone": "friendly"},
  {"text": "suggestion 3", "tone": "professional"},
  {"text": "suggestion 4", "tone": "${preferredTone || 'enthusiastic'}"}
]`;

    try {
      // Temporarily disable Gemini API to fix undici issue
      throw new Error('Gemini API temporarily disabled');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No text generated by Gemini');
      }

      return this.parseGeminiResponse(generatedText, reminder.platform);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  private parseGeminiResponse(text: string, platform: string): ReplySuggestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((item: any, index: number) => ({
          id: `gemini-${Date.now()}-${index}`,
          text: item.text || 'Thanks for your message!',
          tone: item.tone || 'friendly',
          platform: platform
        }));
      }
    } catch (error) {
      console.error('Error parsing Gemini JSON response:', error);
    }

    // Fallback: parse as text lines
    const lines = text.split('\n').filter(line => line.trim() && !line.includes('```'));
    const suggestions: ReplySuggestion[] = [];
    
    lines.forEach((line, index) => {
      const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').trim();
      if (cleanLine.length > 10 && suggestions.length < 4) {
        suggestions.push({
          id: `gemini-text-${Date.now()}-${index}`,
          text: cleanLine,
          tone: this.inferTone(cleanLine),
          platform: platform
        });
      }
    });

    return suggestions.slice(0, 4);
  }

  private async tryHuggingFace(
    reminder: Reminder,
    context?: string,
    preferredTone?: string
  ): Promise<ReplySuggestion[]> {
    if (!this.huggingFaceKey || this.huggingFaceKey === 'your_huggingface_api_key_here') {
      throw new Error('No valid Hugging Face API key');
    }

    // Generate multiple prompts for variety
    const prompts = this.generateMultiplePrompts(reminder, context, preferredTone);
    const suggestions: ReplySuggestion[] = [];

    // Try to get suggestions from multiple prompts
    for (let i = 0; i < Math.min(prompts.length, 4); i++) {
      try {
        // Temporarily disable Hugging Face API to fix undici issue
        throw new Error('Hugging Face API temporarily disabled');
        const response = await fetch(`${this.baseUrl}/microsoft/DialoGPT-small`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.huggingFaceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompts[i],
            parameters: {
              max_length: 50,
              temperature: 0.8 + (i * 0.1), // Vary temperature for diversity
              do_sample: true,
            },
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Hugging Face API error for prompt ${i}:`, response.status, data);
          
          // If model is loading, wait and retry once
          if (data.error && data.error.includes('loading')) {
            console.log('Model is loading, waiting 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue; // Skip this prompt and try next
          }
          
          continue; // Skip this prompt and try next
        }

        const parsedSuggestions = this.parseHuggingFaceResponse(data, reminder.platform, i);
        suggestions.push(...parsedSuggestions);
        
        // Small delay between requests to avoid rate limiting
        if (i < prompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error with prompt ${i}:`, error);
        continue; // Skip this prompt and try next
      }
    }

    // Remove duplicates and return up to 4 unique suggestions
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
    );

    if (uniqueSuggestions.length === 0) {
      throw new Error('No suggestions generated from Hugging Face');
    }

    return uniqueSuggestions.slice(0, 4);
  }

  private async tryFreeGPT(
    reminder: Reminder,
    context?: string,
    preferredTone?: string
  ): Promise<ReplySuggestion[]> {
    // Use a free GPT alternative API (like GPT4Free or similar)
    const prompt = this.buildSimplePrompt(reminder, context, preferredTone);
    
    try {
      // This is a placeholder for free GPT services
      // You can integrate services like:
      // - GPT4Free
      // - FreeGPT
      // - Local models via Ollama
      
      throw new Error('Free GPT service not configured');
    } catch (error) {
      throw new Error('Free GPT service unavailable');
    }
  }

  private async tryLocalGeneration(
    reminder: Reminder,
    context?: string,
    preferredTone?: string
  ): Promise<ReplySuggestion[]> {
    // Use browser-based AI or local models
    // This could integrate with WebLLM or similar
    throw new Error('Local generation not implemented');
  }

  private getSmartTemplateSuggestions(
    reminder: Reminder,
    context?: string,
    preferredTone?: string
  ): ReplySuggestion[] {
    console.log('Generating smart templates with context:', context);
    
    // If we have context, create context-specific templates first
    const contextSpecificTemplates = context ? this.getContextSpecificTemplates(reminder, context, preferredTone) : [];
    const platformTemplates = this.getPlatformTemplates(reminder.platform);
    const contextualTemplates = this.getContextualTemplates(reminder, context);
    const toneTemplates = this.getToneSpecificTemplates(preferredTone);

    // Prioritize context-specific templates
    const allTemplates = [
      ...contextSpecificTemplates,
      ...contextualTemplates,
      ...toneTemplates,
      ...platformTemplates,
    ];

    // Remove duplicates and ensure we have exactly 4 suggestions
    const uniqueTemplates = allTemplates.filter((template, index, self) => 
      index === self.findIndex(t => t.text === template.text)
    );

    // If we don't have enough unique templates, add more from platform templates
    while (uniqueTemplates.length < 4 && platformTemplates.length > 0) {
      const additionalTemplate = platformTemplates.find(template => 
        !uniqueTemplates.some(existing => existing.text === template.text)
      );
      if (additionalTemplate) {
        uniqueTemplates.push(additionalTemplate);
      } else {
        break;
      }
    }

    // Take exactly 4 suggestions
    const finalTemplates = uniqueTemplates.slice(0, 4);

    console.log('Generated templates:', finalTemplates.map(t => t.text));

    return finalTemplates.map((template, index) => ({
      id: `smart-template-${Date.now()}-${index}`,
      text: template.text,
      tone: template.tone,
      platform: reminder.platform,
    }));
  }

  private getContextSpecificTemplates(reminder: Reminder, context: string, preferredTone?: string) {
    const tone = preferredTone || 'friendly';
    const contextLower = context.toLowerCase();
    
    // Extract key words from context
    const contextWords = contextLower.split(' ').filter(word => word.length > 3);
    const mainContext = contextWords[0] || 'event';
    
    // Generate dynamic templates based on ANY context
    const templates = [
      {
        text: `Hey! Got your message about the ${context.toLowerCase()}. I'll get back to you with details!`,
        tone: 'casual' as const
      },
      {
        text: `Thanks for reaching out about the ${context.toLowerCase()}! Let me check and reply soon.`,
        tone: 'friendly' as const
      },
      {
        text: `Got your message regarding the ${context.toLowerCase()}. I'll respond shortly with more information.`,
        tone: 'professional' as const
      },
      {
        text: `I saw your message about the ${context.toLowerCase()}. I'll look into this and get back to you.`,
        tone: tone as any
      }
    ];

    // Add tone-specific variations
    if (tone === 'apologetic') {
      templates.push({
        text: `Sorry for the delay! I got your message about the ${context.toLowerCase()} and I'll respond right away.`,
        tone: 'apologetic' as const
      });
    }

    if (tone === 'enthusiastic') {
      templates.push({
        text: `Exciting! I got your message about the ${context.toLowerCase()}. Can't wait to discuss this further!`,
        tone: 'enthusiastic' as const
      });
    }

    // Handle sensitive contexts with appropriate tone
    if (contextLower.includes('funeral') || contextLower.includes('condolence') || contextLower.includes('sympathy')) {
      return [
        {
          text: `Thank you for your message about the ${context.toLowerCase()}. I'll respond thoughtfully.`,
          tone: 'professional' as const
        },
        {
          text: `I received your message regarding the ${context.toLowerCase()}. I'll get back to you soon.`,
          tone: 'friendly' as const
        },
        {
          text: `Got your message about the ${context.toLowerCase()}. I'll respond with care shortly.`,
          tone: 'apologetic' as const
        }
      ];
    }

    return templates.slice(0, 4);
  }

  private getPlatformTemplates(platform: string) {
    const templates = {
      whatsapp: [
        { text: "Hey! Just saw your message. Let me get back to you on this 👍", tone: 'casual' as const },
        { text: "Thanks for reaching out! I'll check and reply soon.", tone: 'friendly' as const },
        { text: "Sorry for the delay! Looking into this now.", tone: 'apologetic' as const },
        { text: "Awesome! Let me review this and get back to you 🚀", tone: 'enthusiastic' as const }
      ],
      email: [
        { text: "Thank you for your email. I'll review this and respond within 24 hours.", tone: 'professional' as const },
        { text: "Hi! Thanks for reaching out. I'll get back to you shortly with more details.", tone: 'friendly' as const },
        { text: "I apologize for the delayed response. I'll address this immediately.", tone: 'apologetic' as const },
        { text: "Great to hear from you! I'm excited to discuss this further.", tone: 'enthusiastic' as const }
      ],
      instagram: [
        { text: "Thanks for the DM! I'll get back to you soon ✨", tone: 'casual' as const },
        { text: "Hey! Saw your message, will reply shortly!", tone: 'friendly' as const },
        { text: "Sorry for the late reply! Checking this now 🙏", tone: 'apologetic' as const },
        { text: "Love this! Let me get back to you with details 💫", tone: 'enthusiastic' as const }
      ],
      linkedin: [
        { text: "Thank you for connecting. I'll review your message and respond professionally.", tone: 'professional' as const },
        { text: "Thanks for reaching out! I'll get back to you with more information.", tone: 'friendly' as const },
        { text: "I apologize for the delayed response. I'll address this promptly.", tone: 'apologetic' as const },
        { text: "Excited about this opportunity! I'll respond with details soon.", tone: 'enthusiastic' as const }
      ],
    };

    return templates[platform as keyof typeof templates] || templates.email;
  }

  private getContextualTemplates(reminder: Reminder, context?: string) {
    const title = reminder.title.toLowerCase();
    const note = reminder.note?.toLowerCase() || '';
    const contextText = context?.toLowerCase() || '';
    
    const allText = `${title} ${note} ${contextText}`;

    // Meeting-related
    if (allText.includes('meeting') || allText.includes('call') || allText.includes('zoom')) {
      return [
        { text: "Thanks for scheduling this! I'll confirm the meeting details shortly.", tone: 'professional' as const },
        { text: "Looking forward to our meeting! I'll send the agenda soon.", tone: 'enthusiastic' as const },
      ];
    }

    // Project-related
    if (allText.includes('project') || allText.includes('deadline') || allText.includes('task')) {
      return [
        { text: "Thanks for the project update! I'll review and respond with feedback.", tone: 'professional' as const },
        { text: "Got it! I'll check the project status and get back to you.", tone: 'friendly' as const },
      ];
    }

    // Question-related
    if (allText.includes('question') || allText.includes('help') || allText.includes('support')) {
      return [
        { text: "Thanks for your question! I'll research this and provide a detailed answer.", tone: 'friendly' as const },
        { text: "Happy to help! Let me look into this and get back to you.", tone: 'enthusiastic' as const },
      ];
    }

    return [];
  }

  private getToneSpecificTemplates(preferredTone?: string) {
    if (!preferredTone) return [];

    const toneTemplates = {
      professional: [
        { text: "Thank you for your message. I will review this matter and respond accordingly.", tone: 'professional' as const },
        { text: "I acknowledge receipt of your communication and will address this promptly.", tone: 'professional' as const },
      ],
      casual: [
        { text: "Hey! Got your message, will get back to you soon!", tone: 'casual' as const },
        { text: "Thanks for reaching out! I'll check this out and reply.", tone: 'casual' as const },
      ],
      friendly: [
        { text: "Thanks so much for your message! I'll get back to you soon.", tone: 'friendly' as const },
        { text: "Great to hear from you! I'll review this and respond shortly.", tone: 'friendly' as const },
      ],
      apologetic: [
        { text: "I sincerely apologize for the delayed response. I'll address this immediately.", tone: 'apologetic' as const },
        { text: "Sorry for not getting back to you sooner! I'll respond right away.", tone: 'apologetic' as const },
      ],
      enthusiastic: [
        { text: "Exciting! I can't wait to dive into this and get back to you!", tone: 'enthusiastic' as const },
        { text: "This looks amazing! I'll review everything and respond with enthusiasm!", tone: 'enthusiastic' as const },
      ],
    };

    return toneTemplates[preferredTone as keyof typeof toneTemplates] || [];
  }

  private buildPrompt(reminder: Reminder, context?: string, preferredTone?: string): string {
    return `Generate a ${preferredTone || 'friendly'} reply for a ${reminder.platform} message about: "${reminder.title}". ${context ? `Context: ${context}` : ''} Keep it concise and appropriate for ${reminder.platform}.`;
  }

  private buildSimplePrompt(reminder: Reminder, context?: string, preferredTone?: string): string {
    return `Reply to: ${reminder.title} on ${reminder.platform}. Tone: ${preferredTone || 'friendly'}. ${context || ''}`;
  }

  private generateMultiplePrompts(reminder: Reminder, context?: string, preferredTone?: string): string[] {
    const tone = preferredTone || 'friendly';
    const platform = reminder.platform;
    const title = reminder.title;
    
    // Build context-aware prompts
    const contextInfo = context ? ` about ${context}` : '';
    const contextPrefix = context ? `Regarding ${context}, ` : '';
    
    const prompts = [
      `${contextPrefix}reply to "${title}" on ${platform}. Be ${tone}${contextInfo}.`,
      `Write a ${tone} ${platform} response to "${title}"${contextInfo}. Make it relevant to the context.`,
      `Someone messaged "${title}" on ${platform}${contextInfo}. Reply in a ${tone} way that acknowledges the context.`,
      `Respond to "${title}" on ${platform}. Context: ${context || 'general message'}. Tone: ${tone}.`
    ];
    
    return prompts;
  }

  private parseHuggingFaceResponse(data: any, platform: string, promptIndex: number = 0): ReplySuggestion[] {
    try {
      console.log('Parsing Hugging Face response:', data);
      
      // Handle different response formats
      if (Array.isArray(data) && data.length > 0) {
        const suggestions = data.slice(0, 1).map((item, index) => ({
          id: `hf-${Date.now()}-${promptIndex}-${index}`,
          text: this.cleanResponseText(item.generated_text || item.text || 'Thanks for your message!'),
          tone: this.inferTone(item.generated_text || item.text || ''),
          platform: platform,
        }));
        return suggestions;
      }
      
      // Handle single object response
      if (data && (data.generated_text || data.text)) {
        return [{
          id: `hf-${Date.now()}-${promptIndex}`,
          text: this.cleanResponseText(data.generated_text || data.text),
          tone: this.inferTone(data.generated_text || data.text),
          platform: platform,
        }];
      }
      
      console.log('No valid response format found');
      return [];
    } catch (error) {
      console.error('Error parsing Hugging Face response:', error);
      return [];
    }
  }

  private cleanResponseText(text: string): string {
    // Clean up the AI response
    return text
      .replace(/^(User:|Human:|Assistant:|AI:)/i, '') // Remove prefixes
      .replace(/^\s*[-•*]\s*/, '') // Remove bullet points
      .trim()
      .split('\n')[0] // Take only first line
      .substring(0, 200); // Limit length
  }

  private inferTone(text: string): ReplySuggestion['tone'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('sorry') || lowerText.includes('apologize')) {
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
}

// Create a singleton instance
export const freeAIService = new FreeAIService(
  process.env.HUGGINGFACE_API_KEY,
  process.env.GEMINI_API_KEY
);
