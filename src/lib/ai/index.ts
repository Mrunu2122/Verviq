import { GeminiAIService } from './gemini';
import { LocalFallbackAIService } from './localFallback';
import { AIServiceProvider } from './types';

let serviceInstance: AIServiceProvider | null = null;

export function getAIService(): AIServiceProvider {
  if (serviceInstance) return serviceInstance;

  const gemini = new GeminiAIService();
  if (gemini.isConfigured()) {
    console.log('[Verviq AI] Initialized Google Gemini Provider');
    serviceInstance = gemini;
  } else {
    console.log('[Verviq AI] Gemini API key not found in env. Using Verviq Calibrated Fallback Provider');
    serviceInstance = new LocalFallbackAIService();
  }

  return serviceInstance;
}
