import { describe, it, expect } from 'vitest';
import { LocalFallbackAIService } from '../ai/localFallback';
import { GeminiAIService } from '../ai/gemini';
import { AI_CONFIG } from '../../config/ai';

describe('Verviq AI Service Configuration & Providers', () => {
  it('initializes GeminiAIService with configured default model gemini-3.8-flash', () => {
    const geminiService = new GeminiAIService();
    expect(geminiService.getModelName()).toBe('gemini-3.8-flash');
    expect(AI_CONFIG.DEFAULT_GEMINI_MODEL).toBe('gemini-3.8-flash');
  });

  it('respects GEMINI_MODEL environment variable override when provided', () => {
    const originalEnv = process.env.GEMINI_MODEL;
    process.env.GEMINI_MODEL = 'gemini-3.8-pro';

    const customGemini = new GeminiAIService();
    expect(customGemini.getModelName()).toBe('gemini-3.8-pro');

    // Restore env
    process.env.GEMINI_MODEL = originalEnv;
  });

  it('runs LocalFallbackAIService cleanly for question and answer simulation', async () => {
    const service = new LocalFallbackAIService();
    const questions = await service.generateQuestions({
      category: 'technical',
      targetRole: 'Frontend Developer',
      experienceLevel: 'senior',
      difficulty: 'advanced',
      count: 2,
    });

    expect(questions.length).toBe(2);
    expect(questions[0].question_text).toBeDefined();

    const evaluation = await service.evaluateAnswer({
      questionText: 'Explain React render batching.',
      candidateAnswer: 'React 18 batches state updates automatically across timeouts and promises to prevent unnecessary renders.',
      category: 'technical',
      targetRole: 'Frontend Developer',
      experienceLevel: 'mid-level',
    });

    expect(evaluation.overall_score).toBeGreaterThan(50);
  });
});
