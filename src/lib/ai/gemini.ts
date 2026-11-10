import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from '@/config/ai';
import {
  AIServiceProvider,
  QuestionGenOptions,
  GeneratedQuestionItem,
  AnswerEvalOptions,
  GeneratedAnswerEvaluation,
  ReportGenOptions,
  GeneratedReport,
} from './types';

export class GeminiAIService implements AIServiceProvider {
  name: string;
  private client: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    // Configurable via environment variable GEMINI_MODEL, defaults to gemini-3.8-flash
    this.modelName = process.env.GEMINI_MODEL || AI_CONFIG.DEFAULT_GEMINI_MODEL;
    this.name = `Google Gemini (${this.modelName})`;

    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  getModelName(): string {
    return this.modelName;
  }

  private cleanJson(raw: string): string {
    return raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
  }

  async generateQuestions(options: QuestionGenOptions): Promise<GeneratedQuestionItem[]> {
    if (!this.client) {
      throw new Error('Gemini API key is not configured.');
    }

    const prompt = `
You are an expert interviewer and principal hiring manager conducting a realistic job interview.
Generate ${options.count} targeted, non-generic interview questions tailored specifically to this candidate:

CANDIDATE & ROLE CONTEXT:
- Target Role: ${options.targetRole}
- Experience Level: ${options.experienceLevel}
- Interview Category: ${options.category}
- Target Difficulty: ${options.difficulty}
- Focus Skills/Topics: ${options.focusSkills?.join(', ') || 'Core competencies'}
${options.targetCompany ? `- Target Company Context: ${options.targetCompany}` : ''}
${options.jobDescription ? `- Job Description Excerpt: ${options.jobDescription}` : ''}
${options.resumeContext ? `- Resume Highlights: ${options.resumeContext}` : ''}

REQUIREMENTS:
1. Questions must reflect real-world depth expected for a ${options.experienceLevel} ${options.targetRole}.
2. Avoid generic textbook trivia (e.g. "What is React?"). Prefer architectural choices, edge-cases, system trade-offs, debugging scenarios, or concrete behavioral situations.
3. For behavioral/HR questions, require specific past experiences using the STAR methodology framework.
4. Output strictly valid JSON matching this schema:
[
  {
    "question_text": "The full interview question text",
    "category": "${options.category}",
    "difficulty": "${options.difficulty}",
    "competency": "The exact skill being evaluated (e.g., Concurrency, SQL Optimization, Conflict Resolution)",
    "ideal_criteria": [
      "Key technical concept that should be covered",
      "Real-world trade-off discussion expected",
      "Concrete example or methodology"
    ]
  }
]
`;

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    return JSON.parse(this.cleanJson(text));
  }

  async evaluateAnswer(options: AnswerEvalOptions): Promise<GeneratedAnswerEvaluation> {
    if (!this.client) {
      throw new Error('Gemini API key is not configured.');
    }

    const prompt = `
You are an exacting senior interviewer evaluating a candidate's answer for a ${options.experienceLevel} ${options.targetRole} interview.

QUESTION ASKED:
"${options.questionText}"

EVALUATED COMPETENCY: ${options.competency || 'General Core Competency'}
EXPECTED CRITERIA: ${options.idealCriteria?.join('; ') || 'Accuracy, depth, clarity, and practical experience'}
INTERVIEW CATEGORY: ${options.category}

CANDIDATE'S ACTUAL ANSWER:
"${options.candidateAnswer}"

EVALUATION RUBRIC:
1. Technical correctness and conceptual depth.
2. Structure, clarity, and communication effectiveness.
3. Concrete practical reasoning vs vague generalities.
4. Identification of specific incorrect statements or misconceptions.
5. Scores must be strict, honest, and calibrated to real hiring bars (do NOT award inflated 90+ scores for surface-level answers).

Output strictly valid JSON matching this schema:
{
  "overall_score": 78,
  "technical_accuracy_score": 80,
  "clarity_structure_score": 75,
  "depth_relevance_score": 78,
  "practical_examples_score": 70,
  "strengths": ["Clear explanation of X", "Mentioned trade-off of Y"],
  "areas_for_improvement": ["Could have detailed error handling", "Did not discuss concurrency"],
  "missing_points": ["Specific industry-standard pattern Z"],
  "incorrect_statements": ["Stated that A does B, whereas in reality A does C"],
  "exemplary_answer": "A concise, master-level answer demonstrating how an exceptional senior engineer would articulate this.",
  "suggested_follow_up": "A penetrating natural follow-up question to probe deeper into what the candidate just said."
}
`;

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return JSON.parse(this.cleanJson(text));
  }

  async generateFollowUp(question: string, answer: string, competency?: string): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API key is not configured.');
    }

    const prompt = `
You are an interviewer in the middle of a live conversation.
The previous question was: "${question}"
The candidate just responded: "${answer}"
Competency area: ${competency || 'General'}

Generate a single natural, conversational follow-up question that directly acknowledges their specific answer and probes deeper into their reasoning, an edge case, or a trade-off.
Do not include pleasantries like "Great answer". Formulate just the interviewer's direct spoken follow-up.
`;

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: prompt,
    });

    return response.text?.trim() || 'Could you elaborate on the trade-offs of that approach?';
  }

  async generateFinalReport(options: ReportGenOptions): Promise<GeneratedReport> {
    if (!this.client) {
      throw new Error('Gemini API key is not configured.');
    }

    const prompt = `
You are a Staff Interview Reviewer generating an official interview debrief report for a ${options.experienceLevel} ${options.targetRole} candidate.

SUMMARY OF EVALUATED QUESTIONS & CANDIDATE ANSWERS:
${options.evaluations
  .map(
    (e, idx) => `
Q${idx + 1}: ${options.questions[idx]?.question_text || 'Question'}
Competency: ${options.questions[idx]?.competency || 'Core'}
Answer: "${options.answers[idx] || 'N/A'}"
Score: ${e.overall_score}/100
Strengths: ${e.strengths.join(', ')}
Improvements: ${e.areas_for_improvement.join(', ')}
`
  )
  .join('\n')}

${
  options.speechMetrics
    ? `Communication Statistics: Total Words: ${options.speechMetrics.totalWords}, Avg WPM: ${options.speechMetrics.avgWpm}, Filler Words Count: ${options.speechMetrics.totalFillers}`
    : ''
}

Generate an executive performance report with realistic calibrated scores (0-100), concise critical feedback, high-value strengths, weak points, and tailored practice recommendations.

Output strictly valid JSON matching this schema:
{
  "overall_score": 82,
  "technical_score": 84,
  "communication_score": 80,
  "problem_solving_score": 85,
  "clarity_score": 78,
  "structure_score": 82,
  "summary": "Executive overview of candidate readiness, demeanor, and technical competence.",
  "top_strengths": ["Deep grasp of asynchronous patterns", "Crisp problem framing"],
  "weak_areas": ["Superficial answer on memory leak debugging", "Reluctance to quantify metrics"],
  "skills_to_improve": ["Distributed Caching", "STAR formatting for behavioral queries"],
  "recommended_topics": ["Redis Cache Invalidation Patterns", "Designing Resilient Webhooks"],
  "suggested_next_difficulty": "advanced"
}
`;

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return JSON.parse(this.cleanJson(text));
  }
}
