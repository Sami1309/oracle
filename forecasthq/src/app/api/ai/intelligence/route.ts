import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { dataPoints, marketQuestion, mode } = await req.json();

    const dataContext = dataPoints
      .map((dp: { label: string; value: string }) => `- ${dp.label}: ${dp.value}`)
      .join('\n');

    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'analyze') {
      systemPrompt = `You are an intelligence analyst helping users make informed predictions on internal prediction markets. You analyze data points to provide insights on likelihood and key factors.

Be concise and actionable. Use bullet points. Highlight the most important factors.`;

      userPrompt = `Analyze the following data points to help predict: "${marketQuestion}"

Data Points:
${dataContext}

Provide:
1. Key insights from the data (3-4 bullets)
2. Factors that suggest YES (higher probability)
3. Factors that suggest NO (lower probability)
4. Recommended probability range based on the data
5. What additional data would be helpful

Keep response under 300 words.`;
    } else if (mode === 'create-market') {
      systemPrompt = `You are an expert at creating prediction market questions for corporate decision-making based on available data.

Good questions are: binary (yes/no), specific, time-bound, and decision-relevant.`;

      userPrompt = `Based on these data points, suggest 3 prediction market questions:

Data Points:
${dataContext}

For each question provide:
1. The question
2. Resolution criteria
3. Suggested closing date
4. Why it matters based on the data

Return as JSON array with keys: question, resolution_criteria, closing_date, relevance`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    if (mode === 'create-market') {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return NextResponse.json({ suggestions, raw: text });
    }

    return NextResponse.json({ analysis: text });
  } catch (error) {
    console.error('Error in intelligence analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze data', analysis: 'Unable to generate analysis. Please check API configuration.' },
      { status: 500 }
    );
  }
}
