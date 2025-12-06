import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { marketTitle, events, metrics, selectedTime, currentProb, marketDescription } = await req.json();

  const eventsContext = events.length > 0
    ? events.map((e: { timestamp: string; title: string; type: string; impact: string; value?: string; description: string }) =>
        `- [${new Date(e.timestamp).toLocaleDateString()}] **${e.title}** (${e.impact}): ${e.description}${e.value ? ` Value: ${e.value}` : ''}`
      ).join('\n')
    : 'No significant events in this time period.';

  const metricsContext = metrics.length > 0
    ? metrics.map((m: { name: string; value: number; unit: string; category: string }) =>
        `- **${m.name}**: ${m.value.toLocaleString()}${m.unit ? ` ${m.unit}` : ''} (${m.category})`
      ).join('\n')
    : 'No metrics data available.';

  const systemPrompt = `You are an expert prediction market analyst helping users understand forecast dynamics. Your role is to:

1. Analyze how internal company data points correlate with probability changes
2. Identify which events had the strongest impact on the forecast
3. Provide actionable insights for decision-making
4. Be specific - cite exact data points, dates, and values

Use markdown formatting. Be concise but insightful. Focus on causation and correlation between data and probability movements.`;

  const userPrompt = `Analyze this prediction market's forecast at a specific point in time:

**Market:** ${marketTitle}
${marketDescription ? `**Description:** ${marketDescription}` : ''}
**Selected Time:** ${new Date(selectedTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
**Probability at this time:** ${currentProb.toFixed(1)}%

**Internal Company Metrics at this time:**
${metricsContext}

**Recent Events (within ±7 days):**
${eventsContext}

Please provide:
1. **Key Drivers**: What internal data most strongly correlates with the current probability?
2. **Event Impact**: How did recent events influence the forecast?
3. **Signal Strength**: How confident should traders be given the data quality?
4. **Watch Points**: What upcoming data or events could shift the probability significantly?

Be specific and cite the actual values and dates from the data provided.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
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
        console.error('Backtest analysis error:', error);
        controller.enqueue(encoder.encode('Analysis unavailable. Please check API configuration.'));
        controller.close();
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
