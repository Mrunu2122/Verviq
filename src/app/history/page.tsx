'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { localDb } from '@/lib/database/localDb';
import { InterviewSession, InterviewReport } from '@/types';
import { formatDate, getScoreColor } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, PlayCircle, History, ArrowRight, Filter } from 'lucide-react';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const all = localDb.getSessions();
    setSessions(all);
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.target_role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Interview History & Archives
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, and review every past simulation debrief and performance score.
          </p>
        </div>

        <Link href="/interview/new">
          <Button size="sm">
            <PlayCircle className="h-4 w-4 mr-1.5" />
            New Interview
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="hr">HR</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No interview records found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'Launch your first mock interview to build your performance archive.'}
          </p>
          <Link href="/interview/new" className="mt-4 inline-block">
            <Button size="sm">Start Mock Interview</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const report = localDb.getReportBySession(session.id);
            const scoreObj = report ? getScoreColor(report.overall_score) : null;

            return (
              <Card
                key={session.id}
                className="p-5 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {session.title}
                    </span>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {session.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {session.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>{formatDate(session.created_at)}</span>
                    <span>•</span>
                    <span className="capitalize">{session.mode} response</span>
                    <span>•</span>
                    <span>{session.question_count} questions</span>
                    {session.target_company && (
                      <>
                        <span>•</span>
                        <span>Company: {session.target_company}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {report ? (
                    <div className="text-right">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${scoreObj?.badge}`}>
                        {report.overall_score}/100
                      </span>
                    </div>
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
                      {session.status === 'completed' ? 'View Debrief' : 'Resume'}
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
