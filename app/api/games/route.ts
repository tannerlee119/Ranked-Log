import { NextRequest, NextResponse } from 'next/server';
import { addGame, getGames } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const id = addGame({
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

    const games = getGames(
      limit ? parseInt(limit) : undefined,
      champion || undefined,
      role || undefined,
      enemyChampion || undefined
    );

    return NextResponse.json({ success: true, games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch games' }, { status: 500 });
  }
}
