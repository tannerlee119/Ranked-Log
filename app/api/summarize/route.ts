import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { notes } = await request.json();

    if (!notes) {
      return NextResponse.json({ error: 'No notes provided' }, { status: 400 });
    }

    // Simple AI-like summarization logic
    // In production, you would call an actual AI API like OpenAI
    const summary = generateSummary(notes);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

function generateSummary(notes: string): string {
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
