import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai';
import { QuestionGenOptions } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuestionGenOptions;

    if (!body.targetRole || !body.category || !body.experienceLevel || !body.difficulty) {
      return NextResponse.json(
        { error: 'Missing required configuration parameters for interview generation.' },
        { status: 400 }
      );
    }

    const ai = getAIService();
    const questions = await ai.generateQuestions({
      ...body,
      count: body.count || 5,
    });

    return NextResponse.json({
      success: true,
      provider: ai.name,
      questions,
    });
  } catch (error: any) {
    console.error('Question generation route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate questions with AI' },
      { status: 500 }
    );
  }
}
