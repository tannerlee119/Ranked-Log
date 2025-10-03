import { NextRequest, NextResponse } from 'next/server';
import { updateGame } from '@/lib/db-turso';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { notes, youtube_url } = body;
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const updates: { notes?: string; youtube_url?: string } = {};

    if (notes !== undefined) {
      updates.notes = notes;
    }

    if (youtube_url !== undefined) {
      updates.youtube_url = youtube_url;
    }

    await updateGame(id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ success: false, error: 'Failed to update game' }, { status: 500 });
  }
}
