'use client';

import { useState, useEffect } from 'react';
import { X, Copy, RefreshCw, Sparkles, MessageSquare, CheckCircle } from 'lucide-react';
import { Reminder } from '@/lib/types';
import { ReplySuggestion } from '@/lib/openai';
import { getPlatformIcon } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ReplySuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder;
}

const toneColors = {
  professional: 'bg-blue-50 border-blue-200 text-blue-800',
  casual: 'bg-green-50 border-green-200 text-green-800',
  friendly: 'bg-purple-50 border-purple-200 text-purple-800',
  apologetic: 'bg-orange-50 border-orange-200 text-orange-800',
  enthusiastic: 'bg-pink-50 border-pink-200 text-pink-800',
};

const toneIcons = {
  professional: '💼',
  casual: '😊',
  friendly: '👋',
  apologetic: '🙏',
  enthusiastic: '🎉',
};

export function ReplySuggestionsModal({ isOpen, onClose, reminder }: ReplySuggestionsModalProps) {
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [preferredTone, setPreferredTone] = useState('');

  useEffect(() => {
    if (isOpen && reminder) {
      generateSuggestions();
    }
  }, [isOpen, reminder]);

  const generateSuggestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminder,
          context: context.trim() || undefined,
          preferredTone: preferredTone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
        const provider = data.aiProvider || 'unknown';
        const providerNames = {
          'openai': 'OpenAI GPT',
          'free-ai': 'Google Gemini AI',
          'fallback': 'Smart Templates'
        };
        toast.success(`Suggestions by ${providerNames[provider as keyof typeof providerNames] || provider}!`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      let errorMessage = 'Failed to generate AI suggestions';
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('billing')) {
          errorMessage = 'OpenAI billing setup required. Using smart fallback suggestions.';
        } else if (error.message.includes('API key')) {
          errorMessage = 'OpenAI API key issue. Using fallback suggestions.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Show enhanced fallback suggestions
      setSuggestions(getEnhancedFallbackSuggestions());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackSuggestions = (): ReplySuggestion[] => {
    return [
      {
        id: 'fallback-1',
        text: "Thanks for your message! I'll get back to you soon.",
        tone: 'friendly',
        platform: reminder.platform
      },
      {
        id: 'fallback-2',
        text: "I'll review this and respond shortly.",
        tone: 'professional',
        platform: reminder.platform
      },
      {
        id: 'fallback-3',
        text: "Sorry for the late reply! I'll respond to this right away.",
        tone: 'apologetic',
        platform: reminder.platform
      }
    ];
  };

  const getEnhancedFallbackSuggestions = (): ReplySuggestion[] => {
    const platformSpecific = {
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
      default: [
        { text: "Thanks for your message! I'll get back to you soon.", tone: 'friendly' as const },
        { text: "I'll review this and respond shortly.", tone: 'professional' as const },
        { text: "Sorry for the delay! I'll respond to this right away.", tone: 'apologetic' as const },
        { text: "Great to hear from you! I'll reply with more details soon.", tone: 'enthusiastic' as const }
      ]
    };

    const suggestions = platformSpecific[reminder.platform as keyof typeof platformSpecific] || platformSpecific.default;
    
    return suggestions.map((suggestion, index) => ({
      id: `enhanced-fallback-${Date.now()}-${index}`,
      text: suggestion.text,
      tone: suggestion.tone,
      platform: reminder.platform
    }));
  };

  const copyToClipboard = async (suggestion: ReplySuggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.text);
      setCopiedId(suggestion.id);
      toast.success('Copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleRegenerateWithOptions = () => {
    generateSuggestions();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Reply Suggestions</h2>
              <p className="text-sm text-gray-600">
                {getPlatformIcon(reminder.platform)} {reminder.platform} • {reminder.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="space-y-4">
            <div>
              <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Context (Optional)
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="e.g., This is about a project deadline, meeting request, etc."
              />
            </div>
            
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Tone (Optional)
              </label>
              <select
                id="tone"
                value={preferredTone}
                onChange={(e) => setPreferredTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Mixed tones</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="apologetic">Apologetic</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>

            <button
              onClick={handleRegenerateWithOptions}
              disabled={loading}
              className="flex items-center justify-center w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Generating...' : 'Regenerate Suggestions'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-red-500 text-xs mt-1">Showing fallback suggestions instead.</p>
            </div>
          )}

          {loading && suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Generating AI suggestions...</p>
              <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {toneIcons[suggestion.tone] || '💬'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${toneColors[suggestion.tone] || toneColors.friendly}`}>
                        {suggestion.tone}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(suggestion)}
                      className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copiedId === suggestion.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          <span className="text-green-500 text-sm">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          <span className="text-sm">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-gray-800 leading-relaxed">{suggestion.text}</p>
                </div>
              ))}

              {suggestions.length === 0 && !loading && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No suggestions available</p>
                  <p className="text-gray-500 text-sm">Try regenerating with different options</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              💡 Tip: Copy a suggestion and paste it into your {reminder.platform} chat
            </p>
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
