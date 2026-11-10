import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.question || !body.answer) {
      return NextResponse.json(
        { error: 'Question and answer context are required to craft follow up.' },
        { status: 400 }
      );
    }

    const ai = getAIService();
    const followUp = await ai.generateFollowUp(body.question, body.answer, body.competency);

    return NextResponse.json({
      success: true,
      provider: ai.name,
      followUp,
    });
  } catch (error: any) {
    console.error('Follow-up generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate follow-up question' },
      { status: 500 }
    );
  }
}
