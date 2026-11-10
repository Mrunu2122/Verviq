import { describe, it, expect } from 'vitest';
import { analyzeSpeech } from '../speech/analyzer';

describe('Verviq Speech Analyzer Suite', () => {
  it('correctly calculates word count and words per minute', () => {
    // "I architected an asynchronous event queue using Redis streams and consumer groups" -> 12 words
    const transcript = 'I architected an asynchronous event queue using Redis streams and consumer groups.';
    const stats = analyzeSpeech({
      transcript,
      durationSeconds: 10,
      answerId: 'ans_1',
      sessionId: 'ses_1',
    });

    expect(stats.word_count).toBe(12);
    expect(stats.words_per_minute).toBeGreaterThan(50);
    expect(stats.filler_word_count).toBe(0);
  });

  it('accurately identifies common filler words and hesitation scores', () => {
    const transcript = 'Um, basically like we used React, uh, you know, for state management.';
    const stats = analyzeSpeech({
      transcript,
      durationSeconds: 15,
      answerId: 'ans_2',
      sessionId: 'ses_1',
    });

    expect(stats.filler_word_count).toBeGreaterThanOrEqual(4);
    expect(stats.filler_word_breakdown['um']).toBe(1);
    expect(stats.filler_word_breakdown['basically']).toBe(1);
    expect(stats.filler_word_breakdown['like']).toBe(1);
    expect(stats.filler_word_breakdown['uh']).toBe(1);
    expect(stats.hesitation_score).toBeGreaterThan(0);
  });
});
