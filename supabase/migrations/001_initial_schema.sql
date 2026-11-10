-- ==============================================================================
-- VERVIQ PRODUCTION DATABASE SCHEMA
-- Normalized, RLS-Enforced, Scalable Architecture for AI Interview Intelligence
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    headline text,
    education text,
    experience_level text check (experience_level in ('student', 'fresher', 'junior', 'mid-level', 'senior')),
    target_role text,
    preferred_industry text,
    skills text[] default array[]::text[],
    career_goals text,
    resume_url text,
    resume_text text,
    onboarding_completed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. USER PREFERENCES
create table if not exists public.user_preferences (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    theme text default 'light' check (theme in ('light', 'dark', 'system')),
    auto_record boolean default true,
    speech_rate_target integer default 135, -- Target words per minute
    enable_webcam_preview boolean default false,
    email_notifications boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INTERVIEW SESSIONS
create table if not exists public.interview_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    category text not null check (category in ('technical', 'hr', 'behavioral', 'mixed', 'domain-specific')),
    target_role text not null,
    experience_level text not null check (experience_level in ('student', 'fresher', 'junior', 'mid-level', 'senior')),
    difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'expert')),
    duration_minutes integer not null default 20,
    target_company text,
    job_description text,
    resume_context text,
    focus_skills text[] default array[]::text[],
    mode text not null default 'voice' check (mode in ('voice', 'text')),
    status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed', 'abandoned')),
    question_count integer not null default 5,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. INTERVIEW QUESTIONS
create table if not exists public.interview_questions (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid not null references public.interview_sessions(id) on delete cascade,
    question_order integer not null,
    question_text text not null,
    category text not null,
    difficulty text not null,
    competency text, -- e.g., 'React Hooks', 'Conflict Resolution', 'SQL Joins'
    ideal_criteria text[] default array[]::text[],
    is_follow_up boolean default false,
    parent_question_id uuid references public.interview_questions(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. INTERVIEW ANSWERS
create table if not exists public.interview_answers (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid not null references public.interview_sessions(id) on delete cascade,
    question_id uuid not null references public.interview_questions(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    transcript text not null,
    raw_audio_duration_seconds numeric(6, 2) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ANSWER EVALUATIONS (Deep rubric-based evaluation)
create table if not exists public.answer_evaluations (
    id uuid primary key default uuid_generate_v4(),
    answer_id uuid not null references public.interview_answers(id) on delete cascade,
    session_id uuid not null references public.interview_sessions(id) on delete cascade,
    overall_score integer not null check (overall_score >= 0 and overall_score <= 100),
    technical_accuracy_score integer check (technical_accuracy_score >= 0 and technical_accuracy_score <= 100),
    clarity_structure_score integer check (clarity_structure_score >= 0 and clarity_structure_score <= 100),
    depth_relevance_score integer check (depth_relevance_score >= 0 and depth_relevance_score <= 100),
    practical_examples_score integer check (practical_examples_score >= 0 and practical_examples_score <= 100),
    strengths text[] default array[]::text[],
    areas_for_improvement text[] default array[]::text[],
    missing_points text[] default array[]::text[],
    incorrect_statements text[] default array[]::text[],
    exemplary_answer text,
    suggested_follow_up text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SPEECH ANALYTICS
create table if not exists public.speech_analytics (
    id uuid primary key default uuid_generate_v4(),
    answer_id uuid not null references public.interview_answers(id) on delete cascade,
    session_id uuid not null references public.interview_sessions(id) on delete cascade,
    duration_seconds numeric(6,2) not null default 0,
    word_count integer not null default 0,
    words_per_minute numeric(6,2) not null default 0,
    filler_word_count integer not null default 0,
    filler_word_breakdown jsonb default '{}'::jsonb, -- e.g., {"um": 3, "uh": 2, "like": 4}
    pause_count integer default 0,
    hesitation_score numeric(4,2) default 0, -- 0-10 scale
    is_estimated boolean default false, -- True if estimated from transcription timestamps/words
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. INTERVIEW REPORTS (Aggregated comprehensive performance report)
create table if not exists public.interview_reports (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid not null unique references public.interview_sessions(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    overall_score integer not null check (overall_score >= 0 and overall_score <= 100),
    technical_score integer not null,
    communication_score integer not null,
    problem_solving_score integer not null,
    clarity_score integer not null,
    structure_score integer not null,
    summary text not null,
    top_strengths text[] default array[]::text[],
    weak_areas text[] default array[]::text[],
    skills_to_improve text[] default array[]::text[],
    recommended_topics text[] default array[]::text[],
    suggested_next_difficulty text check (suggested_next_difficulty in ('beginner', 'intermediate', 'advanced', 'expert')),
    metrics_summary jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_sessions_user_id on public.interview_sessions(user_id);
create index if not exists idx_sessions_status on public.interview_sessions(status);
create index if not exists idx_sessions_created_at on public.interview_sessions(created_at desc);
create index if not exists idx_questions_session_id on public.interview_questions(session_id);
create index if not exists idx_answers_session_id on public.interview_answers(session_id);
create index if not exists idx_evaluations_session_id on public.answer_evaluations(session_id);
create index if not exists idx_reports_user_id on public.interview_reports(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_answers enable row level security;
alter table public.answer_evaluations enable row level security;
alter table public.speech_analytics enable row level security;
alter table public.interview_reports enable row level security;

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
    for insert with check (auth.uid() = id);

-- Preferences: Users manage own preferences
create policy "Users can view own preferences" on public.user_preferences
    for select using (auth.uid() = user_id);
create policy "Users can update own preferences" on public.user_preferences
    for update using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.user_preferences
    for insert with check (auth.uid() = user_id);

-- Sessions: Users manage own sessions
create policy "Users can manage own sessions" on public.interview_sessions
    for all using (auth.uid() = user_id);

-- Questions: Users can view questions belonging to their sessions
create policy "Users can view questions in own sessions" on public.interview_questions
    for select using (
        exists (
            select 1 from public.interview_sessions
            where interview_sessions.id = interview_questions.session_id
            and interview_sessions.user_id = auth.uid()
        )
    );
create policy "Users can insert questions in own sessions" on public.interview_questions
    for insert with check (
        exists (
            select 1 from public.interview_sessions
            where interview_sessions.id = interview_questions.session_id
            and interview_sessions.user_id = auth.uid()
        )
    );

-- Answers: Users manage answers in own sessions
create policy "Users can manage answers in own sessions" on public.interview_answers
    for all using (auth.uid() = user_id);

-- Evaluations: Users view evaluations in own sessions
create policy "Users can view evaluations in own sessions" on public.answer_evaluations
    for select using (
        exists (
            select 1 from public.interview_sessions
            where interview_sessions.id = answer_evaluations.session_id
            and interview_sessions.user_id = auth.uid()
        )
    );
create policy "Users can insert evaluations in own sessions" on public.answer_evaluations
    for insert with check (
        exists (
            select 1 from public.interview_sessions
            where interview_sessions.id = answer_evaluations.session_id
            and interview_sessions.user_id = auth.uid()
        )
    );

-- Speech Analytics
create policy "Users can manage speech analytics in own sessions" on public.speech_analytics
    for all using (
        exists (
            select 1 from public.interview_sessions
            where interview_sessions.id = speech_analytics.session_id
            and interview_sessions.user_id = auth.uid()
        )
    );

-- Interview Reports
create policy "Users can manage own reports" on public.interview_reports
    for all using (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON AUTH SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
