import { NextResponse } from 'next/server';
import { getAllGames } from '@/lib/db-turso';

export async function GET() {
  try {
    const games = await getAllGames();

    // Group games by day
    const gamesByDay = new Map<string, typeof games>();

    games.forEach((game) => {
      const date = new Date(game.created_at || '').toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
      if (!gamesByDay.has(date)) {
        gamesByDay.set(date, []);
      }
      gamesByDay.get(date)!.push(game);
    });

    // Generate summaries for each day
    const summaries = Array.from(gamesByDay.entries()).map(([date, dayGames]) => {
      const allNotes = dayGames
        .filter(game => game.notes)
        .map(game => game.notes)
        .join('\n\n');

      const wins = dayGames.filter(g => g.win).length;
      const losses = dayGames.length - wins;
      const winRate = Math.round((wins / dayGames.length) * 100);

      return {
        date,
        gamesPlayed: dayGames.length,
        wins,
        losses,
        winRate,
        notes: allNotes,
        summary: generateDailySummary(dayGames, allNotes),
      };
    }).slice(0, 7); // Last 7 days

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return NextResponse.json({ error: 'Failed to generate daily summary' }, { status: 500 });
  }
}

function generateDailySummary(games: any[], notes: string): string {
  const wins = games.filter(g => g.win).length;
  const losses = games.length - wins;
  const winRate = Math.round((wins / games.length) * 100);

  let summary = `Played ${games.length} game${games.length > 1 ? 's' : ''}: ${wins}W-${losses}L (${winRate}% WR)\n\n`;

  // Extract key themes from notes
  if (notes) {
    const hasImprovement = notes.toLowerCase().includes('improve') || notes.toLowerCase().includes('practice');
    const hasMistakes = notes.toLowerCase().includes('mistake') || notes.toLowerCase().includes('died');
    const hasPositives = notes.toLowerCase().includes('good') || notes.toLowerCase().includes('well');

    if (hasPositives) summary += '✅ Had some strong performances\n';
    if (hasMistakes) summary += '⚠️ Identified areas for improvement\n';
    if (hasImprovement) summary += '🎯 Set practice goals\n';
  }

  return summary;
}
