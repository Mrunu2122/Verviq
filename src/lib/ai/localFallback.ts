import {
  AIServiceProvider,
  QuestionGenOptions,
  GeneratedQuestionItem,
  AnswerEvalOptions,
  GeneratedAnswerEvaluation,
  ReportGenOptions,
  GeneratedReport,
} from './types';

export class LocalFallbackAIService implements AIServiceProvider {
  name = 'Verviq Smart Calibrated Engine (Offline / Local Mode)';

  isConfigured(): boolean {
    return true;
  }

  async generateQuestions(options: QuestionGenOptions): Promise<GeneratedQuestionItem[]> {
    const roleLower = options.targetRole.toLowerCase();

    // Contextual questions mapped dynamically by role & difficulty
    const roleQuestionBank: Record<string, GeneratedQuestionItem[]> = {
      frontend: [
        {
          question_text: `In a complex React application experiencing sluggish render cycles on large datasets, how do you identify render bottlenecks, and what architectural decisions do you make regarding memoization, state colocation, and virtualized lists?`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'Frontend Performance & Rendering Optimization',
          ideal_criteria: [
            'Use of React Profiler and Chrome Performance tools',
            'Understanding why premature useMemo/useCallback can harm performance',
            'Virtualization strategies for long lists (e.g., TanStack Virtual)',
            'State colocation vs global store overhead',
          ],
        },
        {
          question_text: `Explain how you would architect an optimistic UI update for an enterprise collaborative dashboard where network requests might fail midway. How do you roll back state cleanly without causing UI flicker?`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'Optimistic UI & Cache Management',
          ideal_criteria: [
            'Rollback snapshots in state caches (e.g. TanStack Query or custom store)',
            'Idempotency tokens or request versioning',
            'User notification and retry affordances without disorientation',
          ],
        },
        {
          question_text: `Walk me through how you approach micro-frontends or module federation versus an optimized monorepo. What are the operational costs and runtime trade-offs of each?`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'Frontend Architecture & System Design',
          ideal_criteria: [
            'Dependency version skew issues in runtime federation',
            'Build times vs runtime complexity',
            'Shared design tokens and global state isolation',
          ],
        },
        {
          question_text: `Describe a scenario where you had to debug an intermittent hydration mismatch or memory leak in a Next.js Server Components architecture. What was the root cause and resolution?`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'SSR / Next.js Hydration & Memory Diagnostics',
          ideal_criteria: [
            'Understanding client/server environment differences',
            'Unsubscribing event listeners and aborting fetch controllers',
            'Diagnosing node heap dumps or browser memory snapshots',
          ],
        },
      ],
      backend: [
        {
          question_text: `How do you handle database concurrency and avoid race conditions when two users attempt to purchase the last available seat or inventory item simultaneously? Compare pessimistic locking, optimistic locking, and distributed locks.`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'Database Concurrency & Isolation Levels',
          ideal_criteria: [
            'SELECT ... FOR UPDATE vs version column compare-and-swap',
            'Isolation levels (Read Committed vs Serializable) and performance costs',
            'Redis Redlock / distributed mutex caveats',
          ],
        },
        {
          question_text: `Design an idempotent payment webhook receiver that handles high-throughput asynchronous updates from Stripe or Adyen. How do you guarantee exactly-once processing semantics?`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'Idempotency & Event-Driven Reliability',
          ideal_criteria: [
            'Cryptographic signature verification before payload processing',
            'Idempotency keys table with transactional atomic state transition',
            'Dead letter queues and backoff retry policies',
          ],
        },
        {
          question_text: `When scaling a relational PostgreSQL database facing 90% read load and complex analytical joins, what sequence of optimizations do you implement before resorting to read replicas or sharding?`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'Database Performance & Query Tuning',
          ideal_criteria: [
            'EXPLAIN ANALYZE and buffer cache hit ratio evaluation',
            'Partial, composite, and covering indexes',
            'Connection pooling (PgBouncer) and vacuum tuning',
          ],
        },
      ],
      data: [
        {
          question_text: `Given an ETL pipeline that processes multi-gigabyte log batches, how do you handle schema drift and late-arriving event data without breaking downstream business intelligence dashboards?`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'Data Pipeline Robustness & Schema Evolution',
          ideal_criteria: [
            'Schema evolution policies in Parquet / Delta / Iceberg',
            'Watermarking in streaming or windowed batch partitions',
            'Quarantine tables for dead-letter records',
          ],
        },
        {
          question_text: `Explain how you evaluate whether an analytical query should be solved using SQL window functions, CTEs, or pre-aggregated materialized views. Give a real-world scenario from your experience.`,
          category: options.category,
          difficulty: options.difficulty,
          competency: 'SQL Optimization & Analytical Engineering',
          ideal_criteria: [
            'Partitioning and frame clauses in window functions',
            'Materialization fences in modern database query planners',
            'Refresh intervals and storage trade-offs',
          ],
        },
      ],
      behavioral: [
        {
          question_text: `Tell me about a high-stakes project where requirements abruptly shifted near the deadline, or an engineering trade-off sparked severe disagreement with product leadership. How did you resolve it?`,
          category: 'behavioral',
          difficulty: options.difficulty,
          competency: 'Stakeholder Conflict & Prioritization',
          ideal_criteria: [
            'Clear Situation, Task, Action, and Result (STAR)',
            'Empathy with business objectives while defending code quality',
            'Objective metrics demonstrating project success',
          ],
        },
        {
          question_text: `Describe a production incident or bug you introduced that caused significant downtime or user disruption. Walk through your immediate response, post-mortem, and systemic preventive measures.`,
          category: 'behavioral',
          difficulty: options.difficulty,
          competency: 'Accountability & Blameless Post-Mortem',
          ideal_criteria: [
            'Honest ownership without shifting blame',
            'Calm mitigation and rollback strategy',
            'Actionable root-cause remediation (runbooks, tests, alerts)',
          ],
        },
      ],
    };

    let selectedBank = roleQuestionBank.frontend;
    if (options.category === 'behavioral' || options.category === 'hr') {
      selectedBank = roleQuestionBank.behavioral;
    } else if (roleLower.includes('backend') || roleLower.includes('devops') || roleLower.includes('full stack')) {
      selectedBank = roleQuestionBank.backend;
    } else if (roleLower.includes('data') || roleLower.includes('ai') || roleLower.includes('machine learning')) {
      selectedBank = roleQuestionBank.data;
    }

    const items: GeneratedQuestionItem[] = [];
    for (let i = 0; i < options.count; i++) {
      const template = selectedBank[i % selectedBank.length];
      items.push({
        question_text: template.question_text,
        category: options.category,
        difficulty: options.difficulty,
        competency: template.competency,
        ideal_criteria: template.ideal_criteria,
      });
    }

    return items;
  }

  async evaluateAnswer(options: AnswerEvalOptions): Promise<GeneratedAnswerEvaluation> {
    const wordCount = options.candidateAnswer.trim().split(/\s+/).filter(Boolean).length;
    
    // Calibrated scoring based on depth and keyword density
    let score = 55;
    const strengths: string[] = [];
    const improvements: string[] = [];
    const missing: string[] = [];

    if (wordCount > 60) score += 15;
    if (wordCount > 120) score += 10;

    const lower = options.candidateAnswer.toLowerCase();
    if (lower.includes('trade-off') || lower.includes('because') || lower.includes('performance') || lower.includes('tested')) {
      score += 10;
      strengths.push('Articulated clear engineering rationale and trade-offs.');
    } else {
      improvements.push('Elaborate deeper on the trade-offs of your chosen design.');
    }

    if (lower.includes('example') || lower.includes('project') || lower.includes('production') || lower.includes('team')) {
      strengths.push('Grounded response in practical experiential context.');
    } else {
      missing.push('Concrete production scenario or measurable metrics from past projects.');
    }

    if (strengths.length === 0) {
      strengths.push('Addressed the core question directly.');
    }
    if (improvements.length === 0) {
      improvements.push('Consider highlighting monitoring, metrics, or telemetry in production.');
    }

    const calibratedScore = Math.min(94, Math.max(45, score));

    return {
      overall_score: calibratedScore,
      technical_accuracy_score: Math.min(95, calibratedScore + 2),
      clarity_structure_score: Math.min(95, calibratedScore - 2),
      depth_relevance_score: calibratedScore,
      practical_examples_score: Math.min(95, calibratedScore + 1),
      strengths,
      areas_for_improvement: improvements,
      missing_points: missing.length > 0 ? missing : ['Discussion of edge cases under high load'],
      incorrect_statements: [],
      exemplary_answer: `A top-percentile response would explicitly define the core constraints first, explain 2 competing approaches with quantitative trade-offs, and conclude with the exact implementation strategy vetted in production.`,
      suggested_follow_up: `What specific telemetry or observability metrics would you monitor in production to verify that this solution is performing as expected?`,
    };
  }

  async generateFollowUp(question: string, answer: string, competency?: string): Promise<string> {
    return `That provides good context. Could you dive deeper into how you verified this under load, and what specific edge cases you had to safeguard against?`;
  }

  async generateFinalReport(options: ReportGenOptions): Promise<GeneratedReport> {
    const avgScore =
      options.evaluations.length > 0
        ? Math.round(options.evaluations.reduce((sum, e) => sum + e.overall_score, 0) / options.evaluations.length)
        : 76;

    return {
      overall_score: avgScore,
      technical_score: Math.min(98, avgScore + 3),
      communication_score: Math.min(98, avgScore - 2),
      problem_solving_score: avgScore,
      clarity_score: Math.min(98, avgScore + 1),
      structure_score: Math.min(98, avgScore - 1),
      summary: `The candidate demonstrated solid foundational knowledge for the ${options.experienceLevel} ${options.targetRole} role with sound reasoning. Deepening edge-case analysis and incorporating explicit production metrics will elevate interview performance to staff level.`,
      top_strengths: [
        'Structured problem decomposition',
        'Direct and relevant answers to complex questions',
        'Clear experiential grounding in core technologies',
      ],
      weak_areas: [
        'Could provide deeper discussion of failure recovery patterns',
        'Occasional hesitation before explaining system trade-offs',
      ],
      skills_to_improve: [
        'High-concurrency failure modes',
        'STAR methodology quantification (mentioning % gains or latency figures)',
      ],
      recommended_topics: [
        'Resilient distributed transactions',
        'Browser & Server profiling techniques',
      ],
      suggested_next_difficulty: avgScore > 80 ? 'advanced' : 'intermediate',
    };
  }
}
