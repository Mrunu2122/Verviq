import {
  UserProfile,
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  AnswerEvaluation,
  SpeechAnalytics,
  InterviewReport,
  DashboardMetrics,
} from '@/types';

const STORAGE_KEYS = {
  PROFILE: 'verviq_user_profile',
  SESSIONS: 'verviq_interview_sessions',
  QUESTIONS: 'verviq_interview_questions',
  ANSWERS: 'verviq_interview_answers',
  EVALUATIONS: 'verviq_answer_evaluations',
  SPEECH: 'verviq_speech_analytics',
  REPORTS: 'verviq_interview_reports',
};

// Default seeded candidate for immediate first-run experience if empty
const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_verviq_demo_982',
  email: 'candidate@verviq.ai',
  full_name: 'Alex Morgan',
  avatar_url: null,
  headline: 'Full Stack & AI Engineer looking for Senior roles',
  education: 'B.S. in Computer Science',
  experience_level: 'mid-level',
  target_role: 'Full Stack Developer',
  preferred_industry: 'FinTech / High-Growth SaaS',
  skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'System Design', 'Next.js'],
  career_goals: 'Ace high-bar technical interviews at Tier-1 product companies.',
  resume_url: null,
  resume_text: 'Experienced Full Stack Engineer with 3+ years building scalable SaaS web applications with Next.js, TypeScript, PostgreSQL, and distributed AI microservices.',
  onboarding_completed: true,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing to local database [${key}]`, err);
  }
}

export const localDb = {
  getProfile: (): UserProfile => {
    return getItem<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },

  updateProfile: (updates: Partial<UserProfile>): UserProfile => {
    const current = localDb.getProfile();
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    setItem(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },

  getSessions: (): InterviewSession[] => {
    return getItem<InterviewSession[]>(STORAGE_KEYS.SESSIONS, []);
  },

  getSessionById: (id: string): InterviewSession | undefined => {
    return localDb.getSessions().find((s) => s.id === id);
  },

  saveSession: (session: InterviewSession): InterviewSession => {
    const sessions = localDb.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = { ...sessions[index], ...session, updated_at: new Date().toISOString() };
    } else {
      sessions.unshift(session);
    }
    setItem(STORAGE_KEYS.SESSIONS, sessions);
    return session;
  },

  getQuestionsBySession: (sessionId: string): InterviewQuestion[] => {
    const all = getItem<InterviewQuestion[]>(STORAGE_KEYS.QUESTIONS, []);
    return all.filter((q) => q.session_id === sessionId).sort((a, b) => a.question_order - b.question_order);
  },

  saveQuestions: (questions: InterviewQuestion[]): void => {
    const existing = getItem<InterviewQuestion[]>(STORAGE_KEYS.QUESTIONS, []);
    const incomingIds = new Set(questions.map((q) => q.id));
    const filtered = existing.filter((q) => !incomingIds.has(q.id));
    setItem(STORAGE_KEYS.QUESTIONS, [...filtered, ...questions]);
  },

  getAnswersBySession: (sessionId: string): InterviewAnswer[] => {
    const all = getItem<InterviewAnswer[]>(STORAGE_KEYS.ANSWERS, []);
    return all.filter((a) => a.session_id === sessionId);
  },

  saveAnswer: (answer: InterviewAnswer): void => {
    const existing = getItem<InterviewAnswer[]>(STORAGE_KEYS.ANSWERS, []);
    const filtered = existing.filter((a) => a.id !== answer.id);
    setItem(STORAGE_KEYS.ANSWERS, [...filtered, answer]);
  },

  getEvaluationsBySession: (sessionId: string): AnswerEvaluation[] => {
    const all = getItem<AnswerEvaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    return all.filter((e) => e.session_id === sessionId);
  },

  saveEvaluation: (evaluation: AnswerEvaluation): void => {
    const existing = getItem<AnswerEvaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    const filtered = existing.filter((e) => e.id !== evaluation.id);
    setItem(STORAGE_KEYS.EVALUATIONS, [...filtered, evaluation]);
  },

  getSpeechAnalyticsBySession: (sessionId: string): SpeechAnalytics[] => {
    const all = getItem<SpeechAnalytics[]>(STORAGE_KEYS.SPEECH, []);
    return all.filter((s) => s.session_id === sessionId);
  },

  saveSpeechAnalytics: (item: SpeechAnalytics): void => {
    const existing = getItem<SpeechAnalytics[]>(STORAGE_KEYS.SPEECH, []);
    const filtered = existing.filter((s) => s.id !== item.id);
    setItem(STORAGE_KEYS.SPEECH, [...filtered, item]);
  },

  getReportBySession: (sessionId: string): InterviewReport | undefined => {
    const all = getItem<InterviewReport[]>(STORAGE_KEYS.REPORTS, []);
    return all.find((r) => r.session_id === sessionId);
  },

  saveReport: (report: InterviewReport): void => {
    const existing = getItem<InterviewReport[]>(STORAGE_KEYS.REPORTS, []);
    const filtered = existing.filter((r) => r.id !== report.id && r.session_id !== report.session_id);
    setItem(STORAGE_KEYS.REPORTS, [report, ...filtered]);
  },

  getDashboardMetrics: (): DashboardMetrics => {
    const sessions = localDb.getSessions();
    const reports = getItem<InterviewReport[]>(STORAGE_KEYS.REPORTS, []);

    const completed = sessions.filter((s) => s.status === 'completed');
    const totalInterviews = completed.length;

    let averageScore = 0;
    let highestScore = 0;
    let totalMinutes = 0;

    if (reports.length > 0) {
      const sum = reports.reduce((acc, r) => acc + r.overall_score, 0);
      averageScore = Math.round(sum / reports.length);
      highestScore = Math.max(...reports.map((r) => r.overall_score));
      totalMinutes = reports.reduce((acc, r) => acc + (r.metrics_summary?.total_duration_minutes || 15), 0);
    }

    const recentSessions = sessions.slice(0, 5).map((s) => {
      const report = reports.find((r) => r.session_id === s.id);
      return {
        ...s,
        score: report?.overall_score,
      };
    });

    // Derive skill aggregates from reports
    const skillCounts: Record<string, { total: number; count: number }> = {};
    reports.forEach((r) => {
      r.top_strengths?.forEach((str) => {
        skillCounts[str] = skillCounts[str] || { total: 0, count: 0 };
        skillCounts[str].total += r.overall_score;
        skillCounts[str].count += 1;
      });
    });

    const skillPerformance = Object.entries(skillCounts)
      .slice(0, 5)
      .map(([skill, data]) => ({
        skill,
        score: Math.round(data.total / data.count),
      }));

    // Collect aggregate weak areas
    const weakSet = new Set<string>();
    reports.forEach((r) => {
      r.weak_areas?.forEach((w) => weakSet.add(w));
    });

    return {
      totalInterviews,
      averageScore,
      highestScore,
      totalTimeMinutes: Math.round(totalMinutes),
      recentSessions,
      skillPerformance: skillPerformance.length > 0 ? skillPerformance : [
        { skill: 'System Architecture', score: 82 },
        { skill: 'React State Management', score: 78 },
        { skill: 'SQL Optimization', score: 71 },
        { skill: 'Behavioral Impact (STAR)', score: 86 },
      ],
      weakAreas: Array.from(weakSet).slice(0, 4),
    };
  },
};
