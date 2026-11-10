export interface QuestionGenOptions {
  category: string;
  targetRole: string;
  experienceLevel: string;
  difficulty: string;
  focusSkills?: string[];
  resumeContext?: string;
  jobDescription?: string;
  targetCompany?: string;
  count: number;
}

export interface GeneratedQuestionItem {
  question_text: string;
  category: string;
  difficulty: string;
  competency: string;
  ideal_criteria: string[];
}

export interface AnswerEvalOptions {
  questionText: string;
  competency?: string;
  idealCriteria?: string[];
  candidateAnswer: string;
  category: string;
  targetRole: string;
  experienceLevel: string;
}

export interface GeneratedAnswerEvaluation {
  overall_score: number;
  technical_accuracy_score: number;
  clarity_structure_score: number;
  depth_relevance_score: number;
  practical_examples_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  missing_points: string[];
  incorrect_statements: string[];
  exemplary_answer: string;
  suggested_follow_up?: string;
}

export interface ReportGenOptions {
  targetRole: string;
  experienceLevel: string;
  evaluations: GeneratedAnswerEvaluation[];
  questions: { question_text: string; competency?: string }[];
  answers: string[];
  speechMetrics?: {
    totalDurationMinutes: number;
    totalWords: number;
    avgWpm: number;
    totalFillers: number;
  };
}

export interface GeneratedReport {
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
  suggested_next_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface AIServiceProvider {
  name: string;
  isConfigured(): boolean;
  generateQuestions(options: QuestionGenOptions): Promise<GeneratedQuestionItem[]>;
  evaluateAnswer(options: AnswerEvalOptions): Promise<GeneratedAnswerEvaluation>;
  generateFollowUp(question: string, answer: string, competency?: string): Promise<string>;
  generateFinalReport(options: ReportGenOptions): Promise<GeneratedReport>;
}
