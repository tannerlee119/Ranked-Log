import { NextRequest, NextResponse } from 'next/server';
import { updateGame, deleteGame, client } from '@/lib/db-turso';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const result = await client.execute({
      sql: 'SELECT * FROM games WHERE id = ?',
      args: [id]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, game: result.rows[0] });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    // Support both simple updates (notes/youtube) and full game updates
    await updateGame(id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ success: false, error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    await deleteGame(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete game' }, { status: 500 });
  }
}
