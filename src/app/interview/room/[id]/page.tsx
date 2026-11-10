'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { localDb } from '@/lib/database/localDb';
import { analyzeSpeech } from '@/lib/speech/analyzer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  AnswerEvaluation,
} from '@/types';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Brain,
  RotateCcw,
  Volume2
} from 'lucide-react';

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Video Preview State
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  // Audio Hook
  const {
    isRecording,
    transcript,
    durationSeconds,
    isSupported,
    hasPermission,
    volumeLevel,
    error: audioError,
    startRecording,
    stopRecording,
    resetTranscript,
    setManualTranscript,
  } = useAudioRecorder();

  // Status & Processing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluatingMessage, setEvaluatingMessage] = useState<string | null>(null);
  const [currentFollowUp, setCurrentFollowUp] = useState<string | null>(null);
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState(false);

  useEffect(() => {
    // 1. Fetch Session
    const sess = localDb.getSessionById(sessionId);
    if (!sess) {
      router.push('/dashboard');
      return;
    }
    setSession(sess);

    // 2. Fetch Questions
    const qs = localDb.getQuestionsBySession(sessionId);
    setQuestions(qs);
  }, [sessionId, router]);

  // Handle optional webcam preview toggle
  const toggleWebcam = async () => {
    if (isWebcamOn) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }
      setIsWebcamOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsWebcamOn(true);
      } catch (e) {
        console.warn('Webcam permission denied or unavailable', e);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;

    if (isRecording) {
      stopRecording();
    }

    setIsSubmitting(true);
    setEvaluatingMessage('Transcribing & running senior-calibrated evaluation rubric...');

    try {
      const activeQ = currentQuestion;
      const answerId = `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // 1. Save Answer record
      const answerRecord: InterviewAnswer = {
        id: answerId,
        session_id: sessionId,
        question_id: activeQ.id,
        user_id: session?.user_id || 'usr_demo',
        transcript: transcript.trim(),
        raw_audio_duration_seconds: durationSeconds,
        created_at: new Date().toISOString(),
      };
      localDb.saveAnswer(answerRecord);

      // 2. Compute speech analytics
      const speechStats = analyzeSpeech({
        transcript: transcript.trim(),
        durationSeconds: Math.max(durationSeconds, 6),
        answerId,
        sessionId,
      });
      localDb.saveSpeechAnalytics(speechStats);

      // 3. Request AI Evaluation
      const evalRes = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: isAnsweringFollowUp && currentFollowUp ? currentFollowUp : activeQ.question_text,
          competency: activeQ.competency,
          idealCriteria: activeQ.ideal_criteria,
          candidateAnswer: transcript.trim(),
          category: activeQ.category,
          targetRole: session?.target_role || 'Software Engineer',
          experienceLevel: session?.experience_level || 'mid-level',
        }),
      });

      const evalData = await evalRes.json();
      if (evalRes.ok && evalData.evaluation) {
        const evalRecord: AnswerEvaluation = {
          id: `eval_${Date.now()}`,
          answer_id: answerId,
          session_id: sessionId,
          ...evalData.evaluation,
          created_at: new Date().toISOString(),
        };
        localDb.saveEvaluation(evalRecord);

        // Decide if we should trigger an intelligent contextual follow-up (on Question 1 or 2)
        if (!isAnsweringFollowUp && currentIndex === 0 && evalData.evaluation.suggested_follow_up) {
          setCurrentFollowUp(evalData.evaluation.suggested_follow_up);
          setIsAnsweringFollowUp(true);
          resetTranscript();
          setIsSubmitting(false);
          setEvaluatingMessage(null);
          return;
        }
      }

      // Progress to next question or complete
      if (isAnsweringFollowUp) {
        setIsAnsweringFollowUp(false);
        setCurrentFollowUp(null);
      }

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        resetTranscript();
        setIsSubmitting(false);
        setEvaluatingMessage(null);
      } else {
        // Complete the interview!
        setEvaluatingMessage('Synthesizing comprehensive post-interview performance report...');
        await finalizeInterviewReport();
      }
    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setEvaluatingMessage(null);
    }
  };

  const finalizeInterviewReport = async () => {
    try {
      const evaluations = localDb.getEvaluationsBySession(sessionId);
      const answers = localDb.getAnswersBySession(sessionId);
      const speechItems = localDb.getSpeechAnalyticsBySession(sessionId);

      const totalWords = speechItems.reduce((acc, s) => acc + s.word_count, 0);
      const totalFillers = speechItems.reduce((acc, s) => acc + s.filler_word_count, 0);
      const totalSeconds = speechItems.reduce((acc, s) => acc + s.duration_seconds, 0);
      const avgWpm =
        totalSeconds > 0 ? Math.round((totalWords / (totalSeconds / 60)) * 10) / 10 : 130;

      const reportRes = await fetch('/api/interview/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: session?.target_role || 'Software Engineer',
          experienceLevel: session?.experience_level || 'mid-level',
          evaluations,
          questions: questions.map((q) => ({ question_text: q.question_text, competency: q.competency })),
          answers: answers.map((a) => a.transcript),
          speechMetrics: {
            totalDurationMinutes: Math.round(totalSeconds / 60) || 10,
            totalWords,
            avgWpm,
            totalFillers,
          },
        }),
      });

      const reportData = await reportRes.json();
      if (reportRes.ok && reportData.report) {
        const fullReport = {
          id: `rep_${Date.now()}`,
          session_id: sessionId,
          user_id: session?.user_id || 'usr_demo',
          ...reportData.report,
          metrics_summary: {
            total_duration_minutes: Math.round(totalSeconds / 60) || 12,
            total_words: totalWords,
            average_wpm: avgWpm,
            total_fillers: totalFillers,
            filler_rate_percentage: totalWords > 0 ? Math.round((totalFillers / totalWords) * 1000) / 10 : 0,
          },
          created_at: new Date().toISOString(),
        };

        localDb.saveReport(fullReport);

        // Mark session completed
        if (session) {
          localDb.saveSession({
            ...session,
            status: 'completed',
            completed_at: new Date().toISOString(),
          });
        }

        router.push(`/reports/${sessionId}`);
      } else {
        router.push(`/dashboard`);
      }
    } catch (e) {
      console.error(e);
      router.push(`/dashboard`);
    }
  };

  if (!session || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">Entering Verviq Chamber...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow">
            V
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">{session.title}</h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
              <span className="capitalize">{session.experience_level}</span>
              <span>•</span>
              <span className="capitalize">{session.difficulty}</span>
              <span>•</span>
              <span className="capitalize">{session.mode} response mode</span>
            </div>
          </div>
        </div>

        {/* Question Tracker Progress */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-300">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="w-32 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            End Early
          </Button>
        </div>
      </header>

      {/* Main Interview Stage */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: AI Interviewer & Active Question */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Interviewer Avatar Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                  <Brain className="h-7 w-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-900 ring-2 ring-emerald-500/20" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">Verviq AI Interviewer</span>
                  <Badge variant="default" className="text-[10px] bg-blue-900/40 text-blue-300 border-blue-800">
                    Live Session
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Evaluating: {currentQuestion.competency || 'Core Competency'}
                </p>
              </div>
            </div>

            {/* Prompt Box */}
            <div className="mt-6 rounded-xl bg-slate-950/70 border border-slate-800/80 p-5">
              {isAnsweringFollowUp && currentFollowUp ? (
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Contextual Follow-Up Question
                  </div>
                  <p className="text-lg font-medium text-slate-100 leading-relaxed">
                    &ldquo;{currentFollowUp}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Probing your previous statement directly. Answer with your practical reasoning.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Question {currentIndex + 1}
                  </div>
                  <p className="text-lg font-medium text-slate-100 leading-relaxed">
                    {currentQuestion.question_text}
                  </p>
                </div>
              )}
            </div>

            {/* Criteria Hint Pill */}
            {currentQuestion.ideal_criteria && currentQuestion.ideal_criteria.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Key focus areas:</span>
                {currentQuestion.ideal_criteria.slice(0, 2).map((crit, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-300 border border-slate-700/60"
                  >
                    {crit}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Candidate Response Capture Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Answer Submission
              </span>

              {session.mode === 'voice' && (
                <div className="flex items-center gap-3">
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {formatDuration(durationSeconds)}
                      </span>
                      {/* Audio visualizer bar */}
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-75"
                          style={{ width: `${Math.min(100, volumeLevel * 1.5)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Editable Transcript / Text Box */}
            <div className="relative">
              <textarea
                rows={6}
                value={transcript}
                onChange={(e) => setManualTranscript(e.target.value)}
                placeholder={
                  session.mode === 'voice'
                    ? isRecording
                      ? 'Listening to your speech in real-time... (Feel free to correct or edit text before submitting)'
                      : 'Click "Start Recording" below to speak, or type your answer directly here...'
                    : 'Type your comprehensive answer here...'
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 leading-relaxed"
              />
            </div>

            {audioError && (
              <div className="rounded-lg bg-rose-950/40 border border-rose-900/60 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{audioError}</span>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                {session.mode === 'voice' && (
                  <>
                    {!isRecording ? (
                      <Button
                        type="button"
                        onClick={startRecording}
                        className="bg-blue-600 hover:bg-blue-700 font-semibold"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Start Speaking
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={stopRecording}
                        className="font-semibold"
                      >
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                  </>
                )}

                {transcript && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetTranscript}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!transcript.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md shadow-emerald-600/20"
              >
                Submit Answer
                <Send className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {evaluatingMessage && (
              <div className="flex items-center gap-2.5 rounded-lg bg-blue-950/40 border border-blue-900 p-3 text-xs text-blue-300 animate-pulse">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-400" />
                <span>{evaluatingMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Video & Telemetry Station */}
        <div className="space-y-6">
          {/* Webcam Preview (Optional) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Self Cam Preview
              </span>
              <button
                type="button"
                onClick={toggleWebcam}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 text-xs flex items-center gap-1.5"
              >
                {isWebcamOn ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                {isWebcamOn ? 'Turn Off' : 'Enable Camera'}
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
              {isWebcamOn ? (
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover mirror" />
              ) : (
                <div className="text-center p-4">
                  <VideoOff className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Camera is disabled</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Optional practice mirror. Video is strictly local and never stored.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Communication Telemetry */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Speech Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Words Spoken</span>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean).length : 0}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Speaking Time</span>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {formatDuration(durationSeconds)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">Candidate Guidelines</span>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Ground answers in specific production engineering trade-offs.</li>
                <li>Avoid rushing; brief thoughtful pauses are favored over filler words.</li>
                <li>You can edit the speech transcript text box at any time prior to submission.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
