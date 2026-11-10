'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { localDb } from '@/lib/database/localDb';
import {
  InterviewSession,
  InterviewReport,
  InterviewQuestion,
  InterviewAnswer,
  AnswerEvaluation,
  SpeechAnalytics,
} from '@/types';
import { getScoreColor, formatDate, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Trophy,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  Mic,
  MessageSquare,
  Zap,
  Target,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function InterviewReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [evaluations, setEvaluations] = useState<AnswerEvaluation[]>([]);
  const [speechList, setSpeechList] = useState<SpeechAnalytics[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  useEffect(() => {
    const s = localDb.getSessionById(sessionId);
    const r = localDb.getReportBySession(sessionId);
    const qs = localDb.getQuestionsBySession(sessionId);
    const ans = localDb.getAnswersBySession(sessionId);
    const evs = localDb.getEvaluationsBySession(sessionId);
    const sp = localDb.getSpeechAnalyticsBySession(sessionId);

    setSession(s || null);
    setReport(r || null);
    setQuestions(qs);
    setAnswers(ans);
    setEvaluations(evs);
    setSpeechList(sp);
  }, [sessionId]);

  if (!session || !report) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Loading interview intelligence report...</p>
      </div>
    );
  }

  const scoreTheme = getScoreColor(report.overall_score);

  // Radar chart data for 5 competency pillars
  const radarData = [
    { subject: 'Technical', score: report.technical_score, fullMark: 100 },
    { subject: 'Communication', score: report.communication_score, fullMark: 100 },
    { subject: 'Problem Solving', score: report.problem_solving_score, fullMark: 100 },
    { subject: 'Clarity', score: report.clarity_score, fullMark: 100 },
    { subject: 'Structure', score: report.structure_score, fullMark: 100 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <FileCheck className="h-4 w-4" /> Official Candidate Evaluation Debrief
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {session.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Completed on {formatDate(session.completed_at || session.created_at)} •{' '}
            <span className="capitalize">{session.experience_level}</span> level •{' '}
            <span className="capitalize">{session.difficulty}</span> difficulty
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/interview/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Practice Again
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Score Banner & Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <Card className={`flex flex-col items-center justify-center p-8 text-center border-2 ${scoreTheme.border} ${scoreTheme.bg}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md dark:bg-slate-800 mb-3">
            <Trophy className={`h-6 w-6 ${scoreTheme.text}`} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overall Interview Calibrated Score
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-6xl font-black tracking-tight ${scoreTheme.text}`}>
              {report.overall_score}
            </span>
            <span className="text-lg font-bold text-slate-400">/ 100</span>
          </div>
          <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${scoreTheme.badge}`}>
            {report.overall_score >= 85
              ? 'Strong Hire Rating'
              : report.overall_score >= 70
              ? 'Competitive Candidate'
              : 'Needs Practice & Remediation'}
          </span>
        </Card>

        {/* Executive Summary */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <CardTitle>Executive Debrief Summary</CardTitle>
            </div>
            <CardDescription>
              Comprehensive assessment calibrated against production engineering standards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {report.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Technical</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {report.technical_score}%
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Communication</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {report.communication_score}%
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Problem Solving</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {report.problem_solving_score}%
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Clarity & Depth</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {report.clarity_score}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Grid: Radar Competency & Speech Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Competency Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <CardTitle>Competency Profile</CardTitle>
            </div>
            <CardDescription>Multi-axis evaluation across 5 critical dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#cbd5e1" opacity={0.4} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Candidate" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Speech & Cadence Analytics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-indigo-600" />
              <CardTitle>Speech & Communication Analytics</CardTitle>
            </div>
            <CardDescription>
              Objective measurements captured during your live verbal responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Avg Speaking Rate</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {report.metrics_summary?.average_wpm || 135}{' '}
                  <span className="text-xs font-normal text-slate-400">WPM</span>
                </p>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Ideal range: 130-160 WPM</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Filler Words</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {report.metrics_summary?.total_fillers || 0}
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {report.metrics_summary?.filler_rate_percentage || 0}% of words
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Words</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {report.metrics_summary?.total_words || 180}
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">Across responses</span>
              </div>
            </div>

            {/* Speaking Guidance Alert */}
            <div className="rounded-xl bg-blue-50/60 border border-blue-200 p-4 text-xs text-blue-900 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
              <span className="font-bold block mb-1">Communication Insight</span>
              Your speaking pace was measured against industry standard clarity benchmarks. Keeping
              verbal fillers below 3% ensures you sound composed and authoritative during difficult
              system design trade-offs.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/60 dark:bg-emerald-950/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-emerald-900 dark:text-emerald-300">Key Strengths Demonstrated</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {report.top_strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200/80 bg-amber-50/20 dark:border-amber-900/60 dark:bg-amber-950/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-300">Priority Areas to Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {report.weak_areas.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Question-By-Question Deep Dive (Rubrics, Correct/Incorrect, Model Answers) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Question-by-Question Rubric Evaluation
          </h2>
          <span className="text-xs text-slate-500">
            {questions.length} questions evaluated
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = answers.find((a) => a.question_id === q.id);
            const ev = evaluations.find((e) => e.answer_id === ans?.id) || evaluations[idx];
            const isExpanded = expandedQuestion === idx;

            const qScoreColor = ev?.overall_score ? getScoreColor(ev.overall_score) : null;

            return (
              <Card key={q.id} className="overflow-hidden transition-all">
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="flex cursor-pointer items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Q{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {q.question_text}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {q.competency || 'Core Competency'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {ev && (
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${qScoreColor?.badge}`}>
                        {ev.overall_score}/100
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/40">
                    {/* Full Question Text */}
                    <div className="rounded-lg bg-white p-4 border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Interview Question Prompt
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white font-medium">
                        {q.question_text}
                      </p>
                    </div>

                    {/* Candidate's Actual Spoken / Typed Answer */}
                    <div className="rounded-lg bg-white p-4 border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Your Submitted Response
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        &ldquo;{ans?.transcript || 'No transcript recorded.'}&rdquo;
                      </p>
                    </div>

                    {/* Rubric Breakdown Points */}
                    {ev && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            What you did well
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                            {ev.strengths?.map((str, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Missing elements & improvements
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                            {ev.areas_for_improvement?.map((imp, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">!</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Exemplary Senior Answer */}
                    {ev?.exemplary_answer && (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
                        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                          Exemplary Senior Benchmark Response
                        </div>
                        <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                          {ev.exemplary_answer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Next Step Recommendations */}
      <Card className="bg-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Recommended Next Practice Phase
            </span>
            <h3 className="text-xl font-bold">
              Progress to {report.suggested_next_difficulty?.toUpperCase()} Difficulty
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Target topics: {report.recommended_topics?.join(', ') || 'System Design & STAR Behavioral Metrics'}
            </p>
          </div>

          <Link href="/interview/new">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 font-bold shadow-md">
              Start Next Simulation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
