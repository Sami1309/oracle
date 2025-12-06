import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { selectedMarkets, userQuery } = await req.json();

  const marketContext = selectedMarkets
    .map((m: { id: string; title: string; probability: number; position?: string }) =>
      `- "${m.title}" (${(m.probability * 100).toFixed(0)}% probability)${m.position ? ` [User position: ${m.position}]` : ''}`
    )
    .join('\n');

  const systemPrompt = `You are an expert financial analyst helping users create derivative prediction markets - markets that combine multiple underlying predictions into a single bet.

Your role is to:
1. Analyze the selected markets and understand their relationships
2. Suggest creative and meaningful derivative market combinations
3. Calculate approximate probabilities for combined outcomes
4. Help users understand the risk/reward profile

When suggesting derivative markets, consider:
- AND conditions (both A and B must happen)
- OR conditions (either A or B happens)
- Conditional probabilities (A given B)
- Timing relationships
- Correlated vs independent events

Format your response in clear sections:
1. **Analysis**: Brief analysis of the selected markets
2. **Suggested Derivatives**: 2-3 derivative market ideas with titles and reasoning
3. **Probability Estimates**: Rough probability calculations
4. **Risk Profile**: Explanation of the risk/reward

Be concise but thorough. Use markdown formatting.`;

  const userPrompt = userQuery
    ? `Selected markets:\n${marketContext}\n\nUser's request: ${userQuery}`
    : `Selected markets:\n${marketContext}\n\nPlease analyze these markets and suggest derivative market combinations.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
