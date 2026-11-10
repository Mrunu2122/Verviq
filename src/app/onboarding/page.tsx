'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { localDb } from '@/lib/database/localDb';
import { ExperienceLevel } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const COMMON_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI / ML Engineer',
  'Data Analyst',
  'Product Manager',
  'DevOps Engineer',
];

export default function OnboardingPage() {
  const router = useRouter();
  const profile = localDb.getProfile();

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experience_level || 'fresher');
  const [targetRole, setTargetRole] = useState(profile.target_role || 'Full Stack Developer');
  const [education, setEducation] = useState(profile.education || 'B.Tech in Computer Science');
  const [skills, setSkills] = useState(profile.skills.join(', ') || 'React, TypeScript, Node.js, SQL');
  const [careerGoals, setCareerGoals] = useState(profile.career_goals || 'Land a high-impact engineering role.');

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    localDb.updateProfile({
      experience_level: experienceLevel,
      target_role: targetRole,
      education,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      career_goals: careerGoals,
      onboarding_completed: true,
    });
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="shadow-lg border-slate-200/80">
        <CardHeader>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="h-4 w-4" /> Quick Onboarding
          </div>
          <CardTitle className="text-2xl">Personalize Your Interview Intelligence</CardTitle>
          <CardDescription>
            Verviq tailors every technical question, difficulty scale, and rubric to your background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFinish} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Current Experience Level
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['student', 'fresher', 'junior', 'mid-level', 'senior'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all ${
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Job Role
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMMON_ROLES.map((role) => (
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Core Skills & Technologies (Comma-Separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Next.js, Node.js, PostgreSQL, Docker"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Education or Academic Background
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.S. Computer Science / Self-Taught"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Skip for now
              </button>
              <Button type="submit" size="lg">
                Complete Setup & Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
