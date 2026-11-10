import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai';
import { AnswerEvalOptions } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnswerEvalOptions;

    if (!body.questionText || !body.candidateAnswer) {
      return NextResponse.json(
        { error: 'Both question and answer are required for evaluation.' },
        { status: 400 }
      );
    }

    const ai = getAIService();
    const evaluation = await ai.evaluateAnswer(body);

    return NextResponse.json({
      success: true,
      provider: ai.name,
      evaluation,
    });
  } catch (error: any) {
    console.error('Answer evaluation route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
