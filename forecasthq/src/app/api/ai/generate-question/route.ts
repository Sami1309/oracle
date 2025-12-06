import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, context, department } = await req.json();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are an expert at creating prediction market questions for corporate decision-making.

Good prediction market questions are:
1. Binary (yes/no resolvable)
2. Specific with clear resolution criteria
3. Time-bound with explicit deadlines
4. Decision-relevant (the answer matters for business decisions)
5. Verifiable from objective sources

Bad questions: vague, subjective, impossible to verify, or irrelevant to decisions.`,
      messages: [
        {
          role: 'user',
          content: `Create 3 prediction market questions about: "${topic}"

Context: ${context || 'General corporate setting'}
Department: ${department || 'Strategy'}

For each question, provide:
1. The question itself
2. Resolution criteria (how we'll determine yes/no)
3. Suggested closing date
4. Why this question is decision-relevant

Return ONLY a JSON array with objects containing: question, resolution_criteria, closing_date, decision_relevance`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions', questions: [] },
      { status: 500 }
    );
  }
}
