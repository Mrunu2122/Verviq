# Verviq — Production AI Interview Intelligence Platform

> **Verviq** is a modern, full-stack AI interview intelligence platform engineered to simulate realistic, senior-calibrated job interviews. It features voice/video simulation, intelligent contextual follow-up probing, speech and verbal filler analytics, and rubric-driven debrief reports.

---

## 🌟 Key Highlights & Features

1. **Contextual AI Interview Engine**
   - Welcomes the candidate and introduces the interview scope.
   - Poses questions one at a time across technical, behavioral (STAR), HR, and domain-specific roles.
   - Listens to candidate responses and generates **real-time contextual follow-ups** probing into specific engineering choices and trade-offs.

2. **Real Speech & Communication Analytics**
   - Web Audio API real-time microphone stream visualizer.
   - Live Speech-to-Text transcription with real-time text correction and fallback.
   - Measures **Words Per Minute (WPM)**, verbal filler word counts (`um`, `uh`, `like`, `you know`, `basically`), pause analysis, and cadence hesitation scoring.

3. **Senior-Calibrated Rubrics & Evaluation**
   - Replaces generic compliments with strict 0–100 calibrated evaluations.
   - Breaks down technical correctness, clarity & structure, depth of explanation, and practical reasoning.
   - Identifies incorrect misconceptions, missing production considerations, and provides exemplary benchmark answers.

4. **Multi-Axis Performance Analytics & Visual Reports**
   - Radar charts visualizing 5 core competency pillars.
   - Post-interview executive summary with strengths, priority growth areas, and recommended next practice difficulties.
   - Persistent session history with search and categorization.

5. **Self-Contained Dual Persistence & Zero-Friction Setup**
   - Native Supabase PostgreSQL schema with complete Row-Level Security (RLS) policies and automatic auth triggers.
   - Seamless offline-capable resilient local database architecture that works out of the box without blocking first runs.

---

## 🏗️ Architecture & Folder Structure

```
Verviq/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql         # Supabase PostgreSQL schema & RLS policies
├── src/
│   ├── app/
│   │   ├── api/interview/
│   │   │   ├── generate-questions/route.ts # AI Question Generation Endpoint
│   │   │   ├── evaluate-answer/route.ts    # Rubric Evaluation Endpoint
│   │   │   ├── follow-up/route.ts          # Contextual Follow-Up Engine Endpoint
│   │   │   └── generate-report/route.ts    # Performance Report Synthesis Endpoint
│   │   ├── dashboard/page.tsx             # Candidate Analytics & Dashboard
│   │   ├── interview/
│   │   │   ├── new/page.tsx               # Interview Setup & Personalization Config
│   │   │   └── room/[id]/page.tsx         # Live Voice/Video Interview Chamber
│   │   ├── reports/[id]/page.tsx          # Comprehensive Performance Report Debrief
│   │   ├── history/page.tsx               # Filterable Interview Archives
│   │   ├── onboarding/page.tsx            # Candidate Setup Experience
│   │   ├── profile/page.tsx               # User Profile & Preferences
│   │   ├── login/page.tsx                 # Authentication Sign In
│   │   ├── signup/page.tsx                # Authentication Sign Up
│   │   ├── forgot-password/page.tsx       # Password Recovery
│   │   ├── page.tsx                       # Landing Page
│   │   └── layout.tsx                     # Main App Layout with Navbar
│   ├── components/
│   │   ├── Navbar.tsx                     # Global Header Navigation
│   │   └── ui/                            # Atomic Design System (Button, Card, Badge)
│   ├── hooks/
│   │   └── useAudioRecorder.ts            # Web Speech & Web Audio Media Stream Hook
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── types.ts                   # Provider Interface & Schemas
│   │   │   ├── gemini.ts                  # Google Gemini 2.5 Provider
│   │   │   ├── localFallback.ts           # Calibrated Offline AI Service
│   │   │   └── index.ts                   # Modular AI Provider Resolver
│   │   ├── database/
│   │   │   ├── client.ts                  # Supabase Client
│   │   │   └── localDb.ts                 # Resilient Local Storage Database
│   │   ├── speech/
│   │   │   └── analyzer.ts                # Speech Telemetry & Filler Word Engine
│   │   └── __tests__/                     # Automated Test Suites (Vitest)
│   └── types/
│       └── index.ts                       # Shared TypeScript Interfaces
├── .env.example
├── README.md
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher

### 2. Installation
Navigate into the newly created folder:
```bash
cd Verviq
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your keys:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Optional for full remote DB synchronization)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

*(Note: If `GEMINI_API_KEY` is not provided, Verviq seamlessly utilizes its internal Smart Calibrated Engine so that candidate simulations, evaluations, follow-ups, and reports remain 100% operational).*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Tests
Run the automated test suite with Vitest:
```bash
npx vitest run
```

### 6. Production Build
```bash
npm run build
npm run start
```

---

## 🗄️ Database & Supabase Migrations
The complete PostgreSQL schema is in:
`supabase/migrations/001_initial_schema.sql`

To apply this to your Supabase project:
1. Log into your Supabase Dashboard.
2. Go to the **SQL Editor**.
3. Paste the contents of `001_initial_schema.sql` and click **Run**.
4. All tables (`profiles`, `user_preferences`, `interview_sessions`, `interview_questions`, `interview_answers`, `answer_evaluations`, `speech_analytics`, `interview_reports`) along with Row Level Security (RLS) policies and user creation triggers will be configured automatically.
