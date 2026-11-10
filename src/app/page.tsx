import Link from 'next/link';
import { 
  Sparkles, 
  Mic, 
  BrainCircuit, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  MessageSquareCode,
  Zap,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-800 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Introducing Verviq 1.0 — Real Interview Intelligence</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white leading-[1.15]">
            Master your job interviews with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              intelligent AI debriefs
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Stop practicing with scripted chatbots. Verviq personalizes technical & behavioral
            mock interviews to your resume, probes with contextual follow-ups, and analyzes
            speech metrics with senior-calibrated rubrics.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/interview/new">
              <Button size="lg" className="shadow-lg shadow-blue-500/20 text-base">
                Start Mock Interview Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-base">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>

          {/* Social Proof / Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-8 sm:grid-cols-4 dark:border-slate-800">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Contextual Follow-Ups</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">STAR</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Behavioral Rubrics</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">0-100</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Calibrated Evidence Scores</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Live WPM</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Speech & Filler Analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Why Verviq Outperforms Basic Chatbots
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Simulating how actual engineering leads and hiring panels interview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-5">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Contextual Follow-Up Engine
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                If you mention using Redis for caching, Verviq doesn't jump to an unrelated trivia
                question. It probes into cache invalidation, race conditions, and TTL strategies.
              </p>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mb-5">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Real Speech & Filler Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track your actual Words Per Minute (WPM), verbal filler rate (um, uh, like), and pause
                hesitations in real time, with immediate text correction fallback.
              </p>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 mb-5">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Rubric-Calibrated Feedback
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No fluffy, generic compliments. Receive line-by-line breakdowns of technical
                omissions, misconceptions, and senior exemplary answers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Roles Carousel / Grid */}
      <section className="py-16 bg-white dark:bg-slate-950 border-y border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Engineered for High-Standard Roles
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                From undergraduate campus placements to principal engineering loops.
              </p>
            </div>
            <Link href="/interview/new" className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2 md:mt-0 flex items-center gap-1">
              Configure Custom Role <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { role: 'Frontend Engineer', icon: MessageSquareCode, diff: 'Junior to Senior' },
              { role: 'Backend Engineer', icon: Terminal, diff: 'Distributed Systems' },
              { role: 'Full Stack Dev', icon: Zap, diff: 'End-to-End Apps' },
              { role: 'AI / ML Engineer', icon: BrainCircuit, diff: 'LLMs & Eval' },
              { role: 'Data Analyst', icon: TrendingUp, diff: 'SQL & Business Insights' },
              { role: 'Behavioral & HR', icon: ShieldCheck, diff: 'STAR & Culture' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-center hover:border-blue-300 hover:bg-white transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                >
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.role}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.diff}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ace your next interview before you walk into the room
          </h2>
          <p className="mt-4 text-slate-300 text-base max-w-xl mx-auto">
            Build unshakeable confidence, eliminate filler words, and master your technical trade-offs with Verviq.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/interview/new">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                Launch Free Mock Session
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Verviq AI Intelligence. Production Grade Interview Platform.</p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">Dashboard</Link>
            <Link href="/interview/new" className="hover:text-slate-900 dark:hover:text-white">Practice</Link>
            <Link href="/profile" className="hover:text-slate-900 dark:hover:text-white">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
