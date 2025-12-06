import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { question, currentProbability, userMessage, conversationHistory } = await req.json();

    const systemPrompt = `You are a forecasting assistant helping employees make better predictions. You're helping analyze this prediction market question:

"${question}"

Current market probability: ${(currentProbability * 100).toFixed(1)}%

Your role:
1. Help users think through base rates and reference classes
2. Identify key factors that would move the probability up or down
3. Point out potential biases (anchoring, optimism bias, availability bias)
4. Suggest information sources to consult
5. Ask probing questions to refine their thinking

Be concise but insightful. Don't tell them what to predict—help them think better. Keep responses under 150 words.`;

    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in forecast assist:', error);
    return NextResponse.json(
      { response: 'Sorry, I encountered an error. Please try again.' },
      { status: 500 }
    );
  }
}
