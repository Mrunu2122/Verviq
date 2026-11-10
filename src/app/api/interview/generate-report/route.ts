import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai';
import { ReportGenOptions } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReportGenOptions;

    if (!body.evaluations || body.evaluations.length === 0) {
      return NextResponse.json(
        { error: 'At least one answer evaluation is required to compile a performance report.' },
        { status: 400 }
      );
    }

    const ai = getAIService();
    const report = await ai.generateFinalReport(body);

    return NextResponse.json({
      success: true,
      provider: ai.name,
      report,
    });
  } catch (error: any) {
    console.error('Report compilation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to synthesize interview report' },
      { status: 500 }
    );
  }
}
