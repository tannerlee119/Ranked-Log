import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { notes } = body;
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const db = getDb();
    const stmt = db.prepare('UPDATE games SET notes = ? WHERE id = ?');
    stmt.run(notes || null, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ success: false, error: 'Failed to update game' }, { status: 500 });
  }
}
