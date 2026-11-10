'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { localDb } from '@/lib/database/localDb';
import { DashboardMetrics, UserProfile } from '@/types';
import { formatDate, getScoreColor } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  PlayCircle,
  Trophy,
  Activity,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    // Read local database
    const currentProfile = localDb.getProfile();
    const currentMetrics = localDb.getDashboardMetrics();
    setProfile(currentProfile);
    setMetrics(currentMetrics);
  }, []);

  if (!profile || !metrics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <UserCheck className="h-3.5 w-3.5" />
              <span>Target Role: {profile.target_role || 'Software Engineer'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready for your next simulation, {profile.full_name?.split(' ')[0] || 'Candidate'}?
            </h1>
            <p className="text-sm text-blue-100 max-w-xl">
              Sharpen your responses, review contextual follow-up debriefs, and monitor your speaking cadence.
            </p>
          </div>
          <Link href="/interview/new" className="shrink-0">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg">
              <PlayCircle className="h-5 w-5 mr-2" />
              Start New Mock Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Sessions</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.totalInterviews}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">interviews</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Score</span>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.averageScore > 0 ? metrics.averageScore : '—'}
            </span>
            {metrics.averageScore > 0 && <span className="text-xs text-slate-500">/ 100</span>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Highest Score</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.highestScore > 0 ? metrics.highestScore : '—'}
            </span>
            {metrics.highestScore > 0 && <span className="text-xs text-slate-500">/ 100</span>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Practice Time</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.totalTimeMinutes}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">minutes</span>
          </div>
        </Card>
      </div>

      {/* Main Content Layout: Skills Graph & Recent Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Interviews & Weak Spots */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Interview Activity</CardTitle>
                <CardDescription>Review past sessions, scores, and debrief reports</CardDescription>
              </div>
              <Link href="/history" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {metrics.recentSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
                  <PlayCircle className="mx-auto h-10 w-10 text-slate-400" />
                  <h4 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                    No interviews completed yet
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Configure your first personalized interview to start generating analytics and rubrics.
                  </p>
                  <Link href="/interview/new" className="mt-4 inline-block">
                    <Button size="sm">Launch First Interview</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {metrics.recentSessions.map((session) => {
                    const scoreObj = session.score ? getScoreColor(session.score) : null;
                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">
                              {session.title || `${session.target_role} (${session.category})`}
                            </span>
                            <Badge variant="secondary" className="capitalize text-[10px]">
                              {session.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{formatDate(session.created_at)}</span>
                            <span>•</span>
                            <span className="capitalize">{session.mode} mode</span>
                            <span>•</span>
                            <span>{session.question_count} questions</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {session.score !== undefined ? (
                            <span
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${scoreObj?.badge}`}
                            >
                              {session.score}/100
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 capitalize">{session.status}</span>
                          )}

                          <Link
                            href={
                              session.status === 'completed'
                                ? `/reports/${session.id}`
                                : `/interview/room/${session.id}`
                            }
                          >
                            <Button variant="outline" size="sm">
                              {session.status === 'completed' ? 'Report' : 'Resume'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weak Areas & Targeted Advice */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <CardTitle>Identified Focus & Growth Areas</CardTitle>
              </div>
              <CardDescription>
                Systemic points flagged across your recent AI debriefs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.weakAreas.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Complete more interviews to build a personalized gap analysis.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {metrics.weakAreas.map((area, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300"
                    >
                      <span className="font-semibold block mb-0.5">• Flagged Gap</span>
                      {area}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Skill Competency Breakdown */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Competency Scores</CardTitle>
              <CardDescription>Aggregate performance across key domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.skillPerformance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="skill" type="category" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val}/100`, 'Competency Score']}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Practice Tip */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pro Interview Strategy
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When answering situational questions, explicitly anchor with:
              <strong className="block text-slate-800 dark:text-slate-200 mt-1">
                &ldquo;Situation → Constraint → My Specific Action → Measurable Metric Outcome&rdquo;
              </strong>
              Verviq gives highest rubric weight to quantifiable engineering results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
