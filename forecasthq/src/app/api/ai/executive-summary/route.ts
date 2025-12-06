import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { markets } = await req.json();

    const marketsContext = markets
      .map(
        (m: { title: string; currentProbability: number; trades: number; closesAt: string }) =>
          `- "${m.title}": ${(m.currentProbability * 100).toFixed(0)}% YES (${m.trades} traders, closes ${m.closesAt})`
      )
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are an executive briefing assistant summarizing prediction market insights for senior leadership. Be concise, actionable, and highlight what matters most.`,
      messages: [
        {
          role: 'user',
          content: `Generate an executive summary of these active prediction markets:

${marketsContext}

Include:
1. Key takeaways (2-3 bullets)
2. Markets requiring attention (low confidence or surprising)
3. Recommended actions
4. Risks to monitor

Keep it under 200 words. Write for a busy executive.`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { summary: 'Unable to generate executive summary. Please ensure the API key is configured.' },
      { status: 500 }
    );
  }
}
