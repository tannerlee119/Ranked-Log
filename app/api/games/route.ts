import { NextRequest, NextResponse } from 'next/server';
import { addGame, getGames } from '@/lib/db-turso';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate AI summary if notes are provided
    let aiSummary = undefined;
    if (body.notes) {
      try {
        const summaryResponse = await fetch(`${request.nextUrl.origin}/api/summarize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: body.notes }),
        });
        const summaryData = await summaryResponse.json();
        aiSummary = summaryData.summary;
      } catch (error) {
        console.error('Failed to generate AI summary:', error);
        // Continue without summary
      }
    }

    const id = await addGame({
      role: body.role || 'adc',
      my_adc: body.my_adc,
      my_support: body.my_support,
      enemy_adc: body.enemy_adc,
      enemy_support: body.enemy_support,
      kills: body.kills,
      deaths: body.deaths,
      assists: body.assists,
      kill_participation: body.kill_participation,
      cs_per_min: body.cs_per_min,
      win: body.win,
      notes: body.notes,
      youtube_url: body.youtube_url,
      game_type: body.game_type,
      game_date: body.game_date,
      ai_summary: aiSummary,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error adding game:', error);
    return NextResponse.json({ success: false, error: 'Failed to add game' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const champion = searchParams.get('champion');
    const role = searchParams.get('role');
    const enemyChampion = searchParams.get('enemyChampion');
    const gameType = searchParams.get('gameType');

    const games = await getGames(
      limit ? parseInt(limit) : undefined,
      champion || undefined,
      role || undefined,
      enemyChampion || undefined,
      gameType || undefined
    );

    return NextResponse.json({ success: true, games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch games' }, { status: 500 });
  }
}
