import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '@shared/store';
import { aiService } from '@shared/lib/services/aiService';
import { Card, Spinner, Button } from '@shared/ui';
import type { AIMessage } from '@mubarak-way/shared';

export default function AIChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserStore();

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if we have an ayah to explain
  useEffect(() => {
    const ayahId = searchParams.get('ayah');
    if (ayahId && messages.length === 0) {
      handleExplainAyah(ayahId);
    }
  }, [searchParams]);

  // Check subscription limits
  const canUseAI = () => {
    if (!user) return false;

    const limits = getSubscriptionLimits(user.subscription.tier);
    const usage = user.usage.aiRequestsPerDay;

    if (limits.aiRequests === -1) return true; // Unlimited
    return usage < limits.aiRequests;
  };

  // Get subscription limits based on tier
  const getSubscriptionLimits = (tier: 'free' | 'pro' | 'premium') => {
    switch (tier) {
      case 'free':
        return { aiRequests: 5 };
      case 'pro':
        return { aiRequests: 50 };
      case 'premium':
        return { aiRequests: -1 }; // unlimited
      default:
        return { aiRequests: 5 };
    }
  };

  const handleExplainAyah = async (ayahId: string) => {
    if (!canUseAI()) {
      setError(t('subscription.limitReached'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const userMessage: AIMessage = {
        role: 'user',
        content: t('ai.explainAyahRequest', {
          defaultValue: `Please explain ayah ${ayahId}`,
          ayahId
        }),
        timestamp: new Date(),
      };

      setMessages([userMessage]);

      const response = await aiService.explainVerse({
        ayahId,
        language: t('common.language', { defaultValue: 'en' }),
        detailLevel: 'medium',
      });

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages([userMessage, assistantMessage]);
    } catch (err: any) {
      console.error('AI error:', err);
      setError(err.message || t('errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !canUseAI()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    try {
      setIsLoading(true);
      setError(null);
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const response = await aiService.ask({
        question: input,
        language: t('common.language', { defaultValue: 'en' }),
      });

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI error:', err);
      setError(err.message || t('errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="page-container p-4">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('errors.unauthorized')}
          </p>
          <Button onClick={() => navigate('/')}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  const remainingRequests = user.subscription.limits.aiRequests === -1
    ? '∞'
    : user.subscription.limits.aiRequests - user.usage.aiRequests;

  return (
    <div className="page-container flex flex-col h-screen">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← {t('common.back')}
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🤖 {t('ai.assistant')}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {remainingRequests} {t('ai.requestsRemaining', { defaultValue: 'requests remaining' })}
              </p>
            </div>
          </div>

          {user.subscription.tier === 'free' && (
            <Button
              size="sm"
              onClick={() => navigate('/settings/subscription')}
            >
              {t('settings.upgrade')}
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('ai.welcomeTitle', { defaultValue: 'Ask me anything about Islam' })}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('ai.welcomeDescription', {
                defaultValue: 'I can help you understand the Quran, explain verses, and answer questions about Islam.'
              })}
            </p>

            {/* Suggested Questions */}
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('ai.suggestedQuestions', { defaultValue: 'Suggested questions:' })}
              </p>
              {[
                'What is the meaning of Surah Al-Fatiha?',
                'How many times should I pray daily?',
                'What are the pillars of Islam?',
                'Explain the concept of Tawhid',
              ].map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  className="w-full text-left p-3 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  💬 {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800'
              }`}>
                <div className="flex items-start gap-2">
                  <div className="text-2xl flex-shrink-0">
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'text-white'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-primary-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🤖</div>
                <Spinner size="sm" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('ai.thinking')}
                </p>
              </div>
            </Card>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            {error.includes('limit') && (
              <Button
                size="sm"
                onClick={() => navigate('/settings/subscription')}
              >
                {t('settings.upgrade')}
              </Button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {!canUseAI() ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('subscription.limitReached')}
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/settings/subscription')}
            >
              {t('settings.upgrade')}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('ai.placeholder')}
              rows={2}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="self-end"
            >
              ➤
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
