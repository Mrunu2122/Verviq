'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { localDb } from '@/lib/database/localDb';
import {
  ExperienceLevel,
  InterviewCategory,
  DifficultyLevel,
  InterviewMode,
  InterviewSession,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
  Sparkles,
  Sliders,
  FileText,
  Building,
  Target,
  Clock,
  Mic,
  MessageSquare,
  ArrowRight,
  Info
} from 'lucide-react';

const POPULAR_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI/ML Engineer',
  'Data Analyst',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'Cybersecurity Analyst',
];

export default function NewInterviewConfigPage() {
  const router = useRouter();
  const profile = localDb.getProfile();

  const [category, setCategory] = useState<InterviewCategory>('technical');
  const [targetRole, setTargetRole] = useState(profile.target_role || 'Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experience_level || 'mid-level');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [questionCount, setQuestionCount] = useState(4);
  const [mode, setMode] = useState<InterviewMode>('voice');
  const [targetCompany, setTargetCompany] = useState('');
  const [focusSkills, setFocusSkills] = useState(profile.skills.join(', ') || 'React, TypeScript, System Design');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeContext, setResumeContext] = useState(profile.resume_text || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const parsedSkills = focusSkills.split(',').map((s) => s.trim()).filter(Boolean);

    const newSession: InterviewSession = {
      id: sessionId,
      user_id: profile.id,
      title: `${targetRole} — ${category.toUpperCase()} Simulation`,
      category,
      target_role: targetRole,
      experience_level: experienceLevel,
      difficulty,
      duration_minutes: durationMinutes,
      target_company: targetCompany || null,
      job_description: jobDescription || null,
      resume_context: resumeContext || null,
      focus_skills: parsedSkills,
      mode,
      status: 'in_progress',
      question_count: questionCount,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // 1. Save session record
      localDb.saveSession(newSession);

      // 2. Call AI Question Generation Route
      const res = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          targetRole,
          experienceLevel,
          difficulty,
          focusSkills: parsedSkills,
          resumeContext,
          jobDescription,
          targetCompany,
          count: questionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate tailored interview questions.');
      }

      // 3. Map into questions table
      const formattedQuestions = data.questions.map((q: any, idx: number) => ({
        id: `q_${Date.now()}_${idx}`,
        session_id: sessionId,
        question_order: idx + 1,
        question_text: q.question_text,
        category: q.category || category,
        difficulty: q.difficulty || difficulty,
        competency: q.competency,
        ideal_criteria: q.ideal_criteria || [],
        is_follow_up: false,
        created_at: new Date().toISOString(),
      }));

      localDb.saveQuestions(formattedQuestions);

      // 4. Redirect candidate directly to live interview room
      router.push(`/interview/room/${sessionId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to initialize session. Please check your configuration.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Configure Your Mock Interview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize role parameters, difficulty, resume context, and interview mode.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleLaunch} className="space-y-8">
        {/* Category & Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-600" />
              1. Interview Style & Medium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Interview Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['technical', 'hr', 'behavioral', 'mixed', 'domain-specific'] as InterviewCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      category === cat
                        ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="block text-xs font-bold capitalize">{cat}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {cat === 'technical' && 'Algorithms & Architecture'}
                      {cat === 'hr' && 'Culture & Fit'}
                      {cat === 'behavioral' && 'STAR Situations'}
                      {cat === 'mixed' && 'Tech + Behavioral'}
                      {cat === 'domain-specific' && 'Specialized Deep-Dive'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Interview Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setMode('voice')}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                    mode === 'voice'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                  }`}
                >
                  <div className="rounded-lg bg-blue-600 p-2 text-white">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Voice Interview (Recommended)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Speak your responses naturally. Measures speaking rate (WPM), pauses, and verbal fillers.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setMode('text')}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                    mode === 'text'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                  }`}
                >
                  <div className="rounded-lg bg-slate-800 p-2 text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Text-Based Interview</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Type your answers at your own cadence. Ideal for low-bandwidth or quiet study environments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Experience Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              2. Target Role & Calibrated Calibration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POPULAR_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Experience Tier
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['student', 'fresher', 'junior', 'mid-level', 'senior'] as ExperienceLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-all ${
                        experienceLevel === lvl
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300 ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Question Difficulty
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['beginner', 'intermediate', 'advanced', 'expert'] as DifficultyLevel[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-all ${
                        difficulty === d
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300 ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Session Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={10}>10 Minutes (Quick Sprint)</option>
                  <option value={20}>20 Minutes (Standard)</option>
                  <option value={30}>30 Minutes (Comprehensive)</option>
                  <option value={45}>45 Minutes (Full Loop Simulation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Core Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={3}>3 Questions</option>
                  <option value={4}>4 Questions (Recommended)</option>
                  <option value={5}>5 Questions</option>
                  <option value={6}>6 Questions</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tailored Personalization (Company, Skills, Resume & JD) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              3. Deep Personalization (Optional)
            </CardTitle>
            <CardDescription>
              Feed job descriptions, resume excerpts, or company specifics for hyper-targeted questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Focus Competencies & Technologies
              </label>
              <input
                type="text"
                value={focusSkills}
                onChange={(e) => setFocusSkills(e.target.value)}
                placeholder="e.g. Next.js App Router, Microservices, Caching, Event Sourcing"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Company (Optional)
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Stripe, Google, Datadog, or high-growth startup"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Paste Job Description Excerpt (Optional)
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or qualifications from the job posting..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Resume Context / Project Highlights (Optional)
              </label>
              <textarea
                rows={3}
                value={resumeContext}
                onChange={(e) => setResumeContext(e.target.value)}
                placeholder="Mention projects, architectural designs, or systems from your resume..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Launch Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            isLoading={isGenerating}
            className="w-full sm:w-auto px-8 shadow-md shadow-blue-500/20"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Initialize AI Interview Chamber
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
