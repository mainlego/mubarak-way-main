import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '@shared/store';
import { aiService } from '@shared/lib/services/aiService';
import { Card, Spinner, Button } from '@shared/ui';
import { Sparkles, ArrowLeft, Send, Copy, Share2, Crown } from 'lucide-react';
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

      // Parse ayahId like "1:1" to surahNumber:ayahNumber
      const [surahNumber, ayahNumber] = ayahId.split(':').map(Number);

      const response = await aiService.explainVerse({
        surahNumber,
        ayahNumber,
        language: t('common.language', { defaultValue: 'en' }),
        detailLevel: 'medium',
      });

      console.log('📝 AIChatPage: Processing explainVerse response', response);
      console.log('📝 AIChatPage: response.explanation type:', typeof response.explanation);
      console.log('📝 AIChatPage: response.explanation value:', response.explanation);

      // Extract explanation from AIResponse object
      // Backend returns: { surahNumber, ayahNumber, explanation: AIResponse }
      // where AIResponse = { answer: string, sources: [], relatedVerses: [] }
      const explanationText = typeof response.explanation === 'string'
        ? response.explanation
        : response.explanation?.answer || 'No explanation received';

      console.log('📝 AIChatPage: Extracted explanationText:', explanationText);

      if (!explanationText || explanationText === 'No explanation received') {
        console.error('❌ AIChatPage: Invalid explanation text', { explanationText, response });
        throw new Error('Invalid AI response: explanation text is empty');
      }

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: explanationText,
        timestamp: new Date(),
      };

      console.log('✅ AIChatPage: Adding explanation message', assistantMessage);
      setMessages([userMessage, assistantMessage]);
    } catch (err: any) {
      console.error('❌ AIChatPage: explainVerse error', err);
      console.error('Error stack:', err.stack);
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

      console.log('📝 AIChatPage: Processing AI response', response);
      console.log('📝 AIChatPage: response.answer type:', typeof response.answer);
      console.log('📝 AIChatPage: response.answer value:', response.answer);

      // Extract answer from AIResponse object
      // Backend returns: { question: string, answer: AIResponse }
      // where AIResponse = { answer: string, sources: [], relatedVerses: [] }
      const answerText = typeof response.answer === 'string'
        ? response.answer
        : response.answer?.answer || 'No answer received';

      console.log('📝 AIChatPage: Extracted answerText:', answerText);

      if (!answerText || answerText === 'No answer received') {
        console.error('❌ AIChatPage: Invalid answer text', { answerText, response });
        throw new Error('Invalid AI response: answer text is empty');
      }

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: answerText,
        timestamp: new Date(),
      };

      console.log('✅ AIChatPage: Adding assistant message', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('❌ AIChatPage: AI error', err);
      console.error('Error stack:', err.stack);
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
    : user.subscription.limits.aiRequests - user.usage.aiRequestsPerDay;

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      {/* Header */}
      <header className="container-app pt-6 pb-4 safe-top">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="icon-container bg-card hover:bg-card-hover"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>

          {user.subscription.tier === 'free' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/settings/subscription')}
            >
              <Crown className="w-4 h-4 mr-1" />
              {t('settings.upgrade')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="icon-container bg-gradient-accent">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t('ai.assistant')}
            </h1>
            <p className="text-sm text-text-secondary">
              {remainingRequests} {t('ai.requestsRemaining', { defaultValue: 'запросов осталось' })}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto container-app pb-32 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-accent flex items-center justify-center shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {t('ai.welcomeTitle', { defaultValue: 'Спросите меня о Исламе' })}
            </h2>
            <p className="text-text-secondary mb-8">
              {t('ai.welcomeDescription', {
                defaultValue: 'Я помогу понять Коран, объясню аяты и отвечу на вопросы об Исламе.'
              })}
            </p>

            {/* Suggested Questions */}
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm font-semibold text-text-primary mb-3">
                {t('ai.suggestedQuestions', { defaultValue: 'Популярные вопросы:' })}
              </p>
              {[
                'Что означает Сура Аль-Фатиха?',
                'Сколько раз в день нужно молиться?',
                'Каковы столпы Ислама?',
                'Объясни концепцию Таухида',
              ].map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  className="w-full text-left p-3 text-sm glass hover:bg-card-hover rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-text-primary">{question}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <Card
                variant={message.role === 'user' ? 'gradient' : 'glass'}
                className="max-w-[85%]"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-white/20'
                      : 'bg-gradient-accent'
                  }`}>
                    {message.role === 'user'
                      ? <span className="text-white text-lg">👤</span>
                      : <Sparkles className="w-5 h-5 text-white" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                      message.role === 'user'
                        ? 'text-white'
                        : 'text-text-primary'
                    }`}>
                      {message.content || '[Empty message]'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <p className={`text-xs ${
                        message.role === 'user'
                          ? 'text-white/70'
                          : 'text-text-tertiary'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>

                      {/* Action buttons for AI responses */}
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                            }}
                            className="p-1.5 text-text-tertiary hover:text-accent rounded-md hover:bg-card-hover transition-colors"
                            title={t('common.copy', { defaultValue: 'Копировать' })}
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: t('ai.assistant'),
                                  text: message.content,
                                });
                              } else {
                                navigator.clipboard.writeText(message.content);
                              }
                            }}
                            className="p-1.5 text-text-tertiary hover:text-accent rounded-md hover:bg-card-hover transition-colors"
                            title={t('common.share', { defaultValue: 'Поделиться' })}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <Card variant="glass">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <Spinner size="sm" />
                <p className="text-sm text-text-secondary">
                  {t('ai.thinking', { defaultValue: 'Думаю...' })}
                </p>
              </div>
            </Card>
          </div>
        )}

        {error && (
          <div className="text-center">
            <Card variant="glass" className="inline-block">
              <p className="text-red-500 mb-2">{error}</p>
              {error.includes('limit') && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/settings/subscription')}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  {t('settings.upgrade')}
                </Button>
              )}
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="fixed left-0 right-0 glass border-t border-card-border z-40" style={{ bottom: '64px' }}>
        <div className="container-app py-4">
          {!canUseAI() ? (
            <Card variant="glass" className="text-center">
              <p className="text-sm text-text-secondary mb-3">
                {t('subscription.limitReached', { defaultValue: 'Достигнут лимит запросов' })}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/settings/subscription')}
              >
                <Crown className="w-4 h-4 mr-1" />
                {t('settings.upgrade')}
              </Button>
            </Card>
          ) : (
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('ai.placeholder', { defaultValue: 'Задайте вопрос об Исламе...' })}
                rows={2}
                className="flex-1 input resize-none"
              />
              <Button
                variant="primary"
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="self-end px-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
