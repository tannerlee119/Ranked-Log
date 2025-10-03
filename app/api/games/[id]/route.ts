import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { notes, youtube_url } = body;
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const db = getDb();

    // Build dynamic SQL based on what fields are being updated
    const updates: string[] = [];
    const values: any[] = [];

    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes || null);
    }

    if (youtube_url !== undefined) {
      updates.push('youtube_url = ?');
      values.push(youtube_url || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    const stmt = db.prepare(`UPDATE games SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ success: false, error: 'Failed to update game' }, { status: 500 });
  }
}
