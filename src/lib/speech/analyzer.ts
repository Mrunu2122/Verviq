import { SpeechAnalytics } from '@/types';

// Standard common filler words and verbal pauses
const FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'basically',
  'actually',
  'literally',
  'kind of',
  'sort of',
  'i mean',
  'right',
];

export interface AudioAnalysisInput {
  transcript: string;
  durationSeconds: number;
  answerId: string;
  sessionId: string;
}

export function analyzeSpeech(input: AudioAnalysisInput): SpeechAnalytics {
  const { transcript, durationSeconds, answerId, sessionId } = input;
  const normalizedText = transcript.toLowerCase();

  // 1. Calculate words
  const words = normalizedText
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const wordCount = words.length;

  // 2. Compute true Speaking Rate (Words Per Minute)
  const safeDurationMinutes = Math.max(durationSeconds / 60, 0.08); // minimum ~5s denominator
  const wordsPerMinute = Math.round((wordCount / safeDurationMinutes) * 10) / 10;

  // 3. Count filler words
  const fillerBreakdown: Record<string, number> = {};
  let totalFillers = 0;

  for (const filler of FILLER_WORDS) {
    if (filler.includes(' ')) {
      // Multi-word phrase regex
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches && matches.length > 0) {
        fillerBreakdown[filler] = matches.length;
        totalFillers += matches.length;
      }
    } else {
      // Single word counts
      const count = words.filter((w) => w === filler).length;
      if (count > 0) {
        fillerBreakdown[filler] = count;
        totalFillers += count;
      }
    }
  }

  // 4. Estimate pauses based on punctuation and duration-to-word ratio
  // Standard speech is ~130-160 WPM. If WPM is < 90, there are substantial hesitation pauses.
  const punctuationPauses = (transcript.match(/(\.\.\.|\. |, |; | - )/g) || []).length;
  let estimatedPauses = punctuationPauses;
  if (wordsPerMinute < 95 && durationSeconds > 10) {
    estimatedPauses += Math.floor((durationSeconds - wordCount * 0.4) / 3);
  }

  // 5. Hesitation Score (0.0 to 10.0 scale, where lower is smoother)
  const fillerRatio = wordCount > 0 ? (totalFillers / wordCount) * 100 : 0;
  let hesitation = (fillerRatio * 0.8) + (estimatedPauses * 0.2);
  hesitation = Math.min(10, Math.max(0, Math.round(hesitation * 10) / 10));

  return {
    id: `sa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    answer_id: answerId,
    session_id: sessionId,
    duration_seconds: Math.round(durationSeconds * 10) / 10,
    word_count: wordCount,
    words_per_minute: wordsPerMinute,
    filler_word_count: totalFillers,
    filler_word_breakdown: fillerBreakdown,
    pause_count: Math.max(0, estimatedPauses),
    hesitation_score: hesitation,
    is_estimated: true,
    created_at: new Date().toISOString(),
  };
}
