export type ExperienceLevel = 'student' | 'fresher' | 'junior' | 'mid-level' | 'senior';
export type InterviewCategory = 'technical' | 'hr' | 'behavioral' | 'mixed' | 'domain-specific';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type InterviewMode = 'voice' | 'text';
export type InterviewStatus = 'draft' | 'in_progress' | 'completed' | 'abandoned';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  education?: string | null;
  experience_level?: ExperienceLevel;
  target_role?: string;
  preferred_industry?: string;
  skills: string[];
  career_goals?: string;
  resume_url?: string | null;
  resume_text?: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  auto_record: boolean;
  speech_rate_target: number;
  enable_webcam_preview: boolean;
  email_notifications: boolean;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  title: string;
  category: InterviewCategory;
  target_role: string;
  experience_level: ExperienceLevel;
  difficulty: DifficultyLevel;
  duration_minutes: number;
  target_company?: string | null;
  job_description?: string | null;
  resume_context?: string | null;
  focus_skills: string[];
  mode: InterviewMode;
  status: InterviewStatus;
  question_count: number;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewQuestion {
  id: string;
  session_id: string;
  question_order: number;
  question_text: string;
  category: string;
  difficulty: string;
  competency?: string;
  ideal_criteria?: string[];
  is_follow_up: boolean;
  parent_question_id?: string | null;
  created_at: string;
}

export interface InterviewAnswer {
  id: string;
  session_id: string;
  question_id: string;
  user_id: string;
  transcript: string;
  raw_audio_duration_seconds: number;
  created_at: string;
}

export interface AnswerEvaluation {
  id: string;
  answer_id: string;
  session_id: string;
  overall_score: number;
  technical_accuracy_score?: number;
  clarity_structure_score?: number;
  depth_relevance_score?: number;
  practical_examples_score?: number;
  strengths: string[];
  areas_for_improvement: string[];
  missing_points: string[];
  incorrect_statements: string[];
  exemplary_answer: string;
  suggested_follow_up?: string | null;
  created_at: string;
}

export interface SpeechAnalytics {
  id: string;
  answer_id: string;
  session_id: string;
  duration_seconds: number;
  word_count: number;
  words_per_minute: number;
  filler_word_count: number;
  filler_word_breakdown: Record<string, number>;
  pause_count: number;
  hesitation_score: number;
  is_estimated: boolean;
  created_at: string;
}

export interface InterviewReport {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  clarity_score: number;
  structure_score: number;
  summary: string;
  top_strengths: string[];
  weak_areas: string[];
  skills_to_improve: string[];
  recommended_topics: string[];
  suggested_next_difficulty: DifficultyLevel;
  metrics_summary: {
    total_duration_minutes: number;
    total_words: number;
    average_wpm: number;
    total_fillers: number;
    filler_rate_percentage: number;
  };
  created_at: string;
}

export interface DashboardMetrics {
  totalInterviews: number;
  averageScore: number;
  highestScore: number;
  totalTimeMinutes: number;
  recentSessions: (InterviewSession & { score?: number })[];
  skillPerformance: { skill: string; score: number }[];
  weakAreas: string[];
}
