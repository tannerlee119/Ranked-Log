import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { notes } = await request.json();

    if (!notes) {
      return NextResponse.json({ error: 'No notes provided' }, { status: 400 });
    }

    let summary: string;

    // Use OpenAI if API key is available, otherwise fallback to keyword-based
    if (openai) {
      summary = await generateOpenAISummary(notes);
    } else {
      summary = generateKeywordSummary(notes);
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

async function generateOpenAISummary(notes: string): Promise<string> {
  try {
    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a League of Legends coach analyzing game notes. Provide a concise summary highlighting:
- Key strengths and good plays
- Areas for improvement or mistakes
- Specific action items to work on
Keep the summary brief (3-5 bullet points) and actionable.`
        },
        {
          role: 'user',
          content: notes
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content || 'No summary generated.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to keyword-based summary if OpenAI fails
    return generateKeywordSummary(notes);
  }
}

function generateKeywordSummary(notes: string): string {
  // Extract key points from notes
  const lines = notes.split('\n').filter(line => line.trim());

  if (lines.length === 0) return 'No notes to summarize.';

  // Extract action items and key insights
  const actionItems = lines.filter(line =>
    line.toLowerCase().includes('need to') ||
    line.toLowerCase().includes('should') ||
    line.toLowerCase().includes('improve') ||
    line.toLowerCase().includes('practice')
  );

  const mistakes = lines.filter(line =>
    line.toLowerCase().includes('mistake') ||
    line.toLowerCase().includes('died') ||
    line.toLowerCase().includes('bad') ||
    line.toLowerCase().includes('missed')
  );

  const positives = lines.filter(line =>
    line.toLowerCase().includes('good') ||
    line.toLowerCase().includes('well') ||
    line.toLowerCase().includes('won') ||
    line.toLowerCase().includes('outplayed')
  );

  let summary = '';

  if (positives.length > 0) {
    summary += '✅ Strengths: ' + positives[0] + '\n';
  }

  if (mistakes.length > 0) {
    summary += '⚠️ Areas to improve: ' + mistakes[0] + '\n';
  }

  if (actionItems.length > 0) {
    summary += '🎯 Action items: ' + actionItems[0];
  }

  return summary || 'Keep practicing and learning from each game!';
}
