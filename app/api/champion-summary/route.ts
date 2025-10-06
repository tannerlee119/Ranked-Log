import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { champion, games } = await request.json();

    if (!games || games.length === 0) {
      return NextResponse.json({ error: 'No games provided' }, { status: 400 });
    }

    let summary: string;

    if (openai) {
      summary = await generateChampionSummary(champion, games);
    } else {
      summary = generateSimpleChampionSummary(champion, games);
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating champion summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

async function generateChampionSummary(champion: string, games: any[]): Promise<string> {
  try {
    // Prepare game data summary
    const gamesSummary = games.map((g, i) => {
      const result = g.win ? 'Won' : 'Lost';
      const kda = `${g.kills}/${g.deaths}/${g.assists}`;
      const notes = g.notes || 'No notes';
      const aiSummary = g.ai_summary || '';
      return `Game ${i + 1} (${result}): KDA ${kda}, KP ${g.kill_participation}%\nNotes: ${notes}\nAI Summary: ${aiSummary}`;
    }).join('\n\n');

    const wins = games.filter(g => g.win).length;
    const losses = games.length - wins;
    const winRate = Math.round((wins / games.length) * 100);

    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a League of Legends coach providing an overall performance summary for a player on a specific champion. Analyze their games and provide a 150-200 word summary covering:
- Overall performance trends and win rate context
- Key strengths they've demonstrated
- Common mistakes or patterns to improve
- Specific actionable advice for this champion

Use plain text with simple bullet points (dashes, not asterisks). Be concise and actionable.`
        },
        {
          role: 'user',
          content: `Champion: ${champion}
Record: ${wins}W-${losses}L (${winRate}% WR)
Total games: ${games.length}

${gamesSummary}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0].message.content || 'No summary generated.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateSimpleChampionSummary(champion, games);
  }
}

function generateSimpleChampionSummary(champion: string, games: any[]): string {
  const wins = games.filter(g => g.win).length;
  const losses = games.length - wins;
  const winRate = Math.round((wins / games.length) * 100);

  const avgKills = (games.reduce((sum, g) => sum + g.kills, 0) / games.length).toFixed(1);
  const avgDeaths = (games.reduce((sum, g) => sum + g.deaths, 0) / games.length).toFixed(1);
  const avgAssists = (games.reduce((sum, g) => sum + g.assists, 0) / games.length).toFixed(1);

  return `${champion} Performance Summary:\n\nRecord: ${wins}W-${losses}L (${winRate}% WR) across ${games.length} games\n\nAverage Stats:\n- KDA: ${avgKills}/${avgDeaths}/${avgAssists}\n- Kill Participation: ${(games.reduce((sum, g) => sum + g.kill_participation, 0) / games.length).toFixed(1)}%\n- CS/min: ${(games.reduce((sum, g) => sum + g.cs_per_min, 0) / games.length).toFixed(1)}\n\nKeep reviewing your game notes to identify patterns and areas for improvement.`;
}
