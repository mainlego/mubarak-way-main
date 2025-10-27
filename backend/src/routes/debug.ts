import { Router, Request, Response } from 'express';
import { config } from '../config/env.js';
import OpenAI from 'openai';
import { elasticsearchService } from '../services/elasticsearchProxy.js';
import { analyzeUserQuery } from '../services/contextGathering.js';
import type { ApiResponse } from '@mubarak-way/shared';

const router = Router();

/**
 * GET /api/v1/debug/config
 * Check system configuration (masks sensitive data)
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const maskKey = (key: string | undefined) => {
      if (!key) return '❌ NOT SET';
      if (key.length < 10) return '❌ INVALID (too short)';
      return `✅ SET (${key.substring(0, 7)}...${key.substring(key.length - 4)})`;
    };

    const configStatus = {
      environment: config.nodeEnv,
      server: {
        port: config.port,
        allowedOrigins: config.allowedOrigins,
      },
      database: {
        mongodbUri: config.mongodbUri ? '✅ SET' : '❌ NOT SET',
      },
      telegram: {
        botToken: maskKey(config.telegramBotToken),
        webappUrl: config.webappUrl,
      },
      ai: {
        openaiApiKey: maskKey(config.openaiApiKey),
        anthropicApiKey: maskKey(config.anthropicApiKey),
      },
      elasticsearch: {
        url: config.elasticsearchUrl,
        apiUrl: config.elasticsearchApiUrl,
        apiToken: maskKey(config.elasticsearchApiToken),
      },
      jwt: {
        secret: config.jwtSecret === 'change-this-secret-in-production'
          ? '⚠️ USING DEFAULT (change in production!)'
          : '✅ SET',
        expiresIn: config.jwtExpiresIn,
      },
      rateLimit: {
        window: config.rateLimitWindow,
        maxRequests: config.rateLimitMaxRequests,
        aiMaxRequests: config.rateLimitAiMaxRequests,
      },
    };

    res.json({
      success: true,
      data: configStatus,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Config check error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONFIG_ERROR',
        message: error.message,
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/debug/ai/test
 * Test OpenAI connection
 */
router.post('/ai/test', async (req: Request, res: Response) => {
  try {
    const { message = 'Привет! Это тест.' } = req.body;

    if (!config.openaiApiKey) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: 'OPENAI_API_KEY not configured in environment',
          debug: {
            envVarName: 'OPENAI_API_KEY',
            currentValue: config.openaiApiKey || 'undefined',
            suggestion: 'Add OPENAI_API_KEY=sk-... to backend/.env file',
          },
        },
      } as ApiResponse);
    }

    const startTime = Date.now();

    const openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'Ты - помощник для тестирования API. Ответь кратко на сообщение пользователя.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        status: '✅ OpenAI API Working',
        model: 'gpt-4o-mini',
        duration: `${duration}ms`,
        request: {
          message,
          maxTokens: 100,
          temperature: 0.7,
        },
        response: {
          content: response.choices[0]?.message?.content || '',
          finishReason: response.choices[0]?.finish_reason,
          usage: response.usage,
        },
        apiKeyStatus: `Valid (${config.openaiApiKey.substring(0, 7)}...${config.openaiApiKey.substring(config.openaiApiKey.length - 4)})`,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('OpenAI test error:', error);

    let errorDetails = {
      type: error.constructor.name,
      message: error.message,
      status: error.status,
      code: error.code,
    };

    // Check for common errors
    if (error.status === 401 || error.message?.includes('Incorrect API key')) {
      errorDetails = {
        ...errorDetails,
        type: 'AUTHENTICATION_ERROR',
        message: 'Invalid OpenAI API key',
      };
    } else if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      errorDetails = {
        ...errorDetails,
        type: 'NETWORK_ERROR',
        message: 'Cannot reach OpenAI servers (network error)',
      };
    } else if (error.status === 429) {
      errorDetails = {
        ...errorDetails,
        type: 'RATE_LIMIT_ERROR',
        message: 'OpenAI rate limit exceeded',
      };
    }

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: 'AI_TEST_FAILED',
        message: 'OpenAI API test failed',
        debug: errorDetails,
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/debug/ai/analyze
 * Test query analysis
 */
router.post('/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { query = 'Что говорит Коран о терпении?' } = req.body;

    if (!config.openaiApiKey) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: 'OPENAI_API_KEY not configured',
        },
      } as ApiResponse);
    }

    const startTime = Date.now();
    const analysis = await analyzeUserQuery(query);
    const duration = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        status: '✅ Query Analysis Working',
        duration: `${duration}ms`,
        input: query,
        analysis: {
          intent: analysis.intent,
          topics: analysis.topics,
          keywords: analysis.keywords,
          synonyms: analysis.synonyms,
          arabicKeywords: analysis.arabicKeywords,
          mentionedSurahs: analysis.mentioned_surahs,
          mentionedAyahs: analysis.mentioned_ayahs,
          language: analysis.language,
        },
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Query analysis test error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_TEST_FAILED',
        message: error.message,
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/debug/elasticsearch/test
 * Test Elasticsearch connection
 */
router.get('/elasticsearch/test', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const isHealthy = await elasticsearchService.healthCheck();
    const healthDuration = Date.now() - startTime;

    if (!isHealthy) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'ELASTICSEARCH_UNAVAILABLE',
          message: 'Elasticsearch health check failed',
          debug: {
            url: config.elasticsearchApiUrl,
            tokenStatus: config.elasticsearchApiToken ? 'SET' : 'NOT SET',
            healthCheckDuration: `${healthDuration}ms`,
          },
        },
      } as ApiResponse);
    }

    // Test search
    const searchStartTime = Date.now();
    const searchResults = await elasticsearchService.search('терпение', 'ru', 3);
    const searchDuration = Date.now() - searchStartTime;

    res.json({
      success: true,
      data: {
        status: '✅ Elasticsearch Working',
        healthCheck: {
          healthy: true,
          duration: `${healthDuration}ms`,
        },
        searchTest: {
          query: 'терпение',
          language: 'ru',
          resultsCount: searchResults.length,
          duration: `${searchDuration}ms`,
          sampleResults: searchResults.slice(0, 2).map(r => ({
            surah: r.surahNumber,
            ayah: r.ayahNumber,
            translation: r.translation.substring(0, 100) + '...',
          })),
        },
        config: {
          url: config.elasticsearchApiUrl,
          tokenStatus: config.elasticsearchApiToken ? '✅ SET' : '❌ NOT SET',
        },
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Elasticsearch test error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ELASTICSEARCH_TEST_FAILED',
        message: error.message,
        debug: {
          url: config.elasticsearchApiUrl,
          errorType: error.constructor.name,
        },
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/debug/ai/full-test
 * Full AI pipeline test (analysis + context + response)
 */
router.post('/ai/full-test', async (req: Request, res: Response) => {
  try {
    const { question = 'Что говорит Коран о терпении?' } = req.body;

    if (!config.openaiApiKey) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: 'OPENAI_API_KEY not configured',
        },
      } as ApiResponse);
    }

    const steps: any[] = [];
    const overallStart = Date.now();

    // Step 1: Query Analysis
    const analysisStart = Date.now();
    const analysis = await analyzeUserQuery(question);
    steps.push({
      step: 1,
      name: 'Query Analysis',
      duration: `${Date.now() - analysisStart}ms`,
      status: '✅',
      data: analysis,
    });

    // Step 2: Elasticsearch Search
    const searchStart = Date.now();
    let searchResults: any[] = [];
    try {
      const allTerms = [
        ...analysis.keywords,
        ...analysis.synonyms,
        ...analysis.arabicKeywords,
      ].filter(Boolean);
      const searchQuery = allTerms.join(' ');
      searchResults = await elasticsearchService.search(searchQuery, analysis.language || 'ru', 5);
      steps.push({
        step: 2,
        name: 'Elasticsearch Search',
        duration: `${Date.now() - searchStart}ms`,
        status: '✅',
        data: {
          query: searchQuery,
          resultsCount: searchResults.length,
          sampleResults: searchResults.slice(0, 2).map(r => ({
            surah: r.surahNumber,
            ayah: r.ayahNumber,
            score: r.score,
          })),
        },
      });
    } catch (error: any) {
      steps.push({
        step: 2,
        name: 'Elasticsearch Search',
        duration: `${Date.now() - searchStart}ms`,
        status: '⚠️',
        error: error.message,
      });
    }

    // Step 3: AI Response Generation
    const responseStart = Date.now();
    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    const contextText = searchResults.length > 0
      ? searchResults.slice(0, 3).map((r, idx) =>
          `${idx + 1}. Сура ${r.surahNumber}, аят ${r.ayahNumber}\n${r.translation}`
        ).join('\n\n')
      : 'Релевантные аяты не найдены.';

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'Ты - исламский наставник. Отвечай на основе предоставленных аятов.\n\nАяты:\n' + contextText,
        },
        {
          role: 'user',
          content: question,
        },
      ],
    });

    steps.push({
      step: 3,
      name: 'AI Response Generation',
      duration: `${Date.now() - responseStart}ms`,
      status: '✅',
      data: {
        model: 'gpt-4o-mini',
        response: aiResponse.choices[0]?.message?.content?.substring(0, 200) + '...',
        usage: aiResponse.usage,
      },
    });

    const overallDuration = Date.now() - overallStart;

    res.json({
      success: true,
      data: {
        status: '✅ Full AI Pipeline Working',
        totalDuration: `${overallDuration}ms`,
        question,
        steps,
        summary: {
          analysisWorking: steps[0].status === '✅',
          searchWorking: steps[1].status === '✅',
          aiResponseWorking: steps[2].status === '✅',
          versesFound: searchResults.length,
          totalSteps: steps.length,
        },
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Full AI test error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FULL_AI_TEST_FAILED',
        message: error.message,
        stack: config.nodeEnv === 'development' ? error.stack : undefined,
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/debug/env
 * Show environment variables (development only)
 */
router.get('/env', async (req: Request, res: Response) => {
  if (config.nodeEnv !== 'development') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'This endpoint is only available in development mode',
      },
    } as ApiResponse);
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? '✅ SET' : '❌ NOT SET',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `✅ SET (${process.env.OPENAI_API_KEY?.substring(0, 10)}...)` : '❌ NOT SET',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ SET' : '❌ NOT SET',
    ELASTICSEARCH_API_URL: process.env.ELASTICSEARCH_API_URL,
    ELASTICSEARCH_API_TOKEN: process.env.ELASTICSEARCH_API_TOKEN ? '✅ SET' : '❌ NOT SET',
    JWT_SECRET: process.env.JWT_SECRET === 'change-this-secret-in-production' ? '⚠️ DEFAULT' : '✅ SET',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  };

  res.json({
    success: true,
    data: envVars,
  } as ApiResponse);
});

export default router;
