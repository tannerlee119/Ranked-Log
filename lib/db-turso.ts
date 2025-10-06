import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export async function initDb() {
  try {
    // Create tables
    await client.execute(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL DEFAULT 'adc',
        my_adc TEXT NOT NULL,
        my_support TEXT NOT NULL,
        enemy_adc TEXT NOT NULL,
        enemy_support TEXT NOT NULL,
        kills INTEGER NOT NULL,
        deaths INTEGER NOT NULL,
        assists INTEGER NOT NULL,
        kill_participation REAL NOT NULL,
        cs_per_min REAL NOT NULL,
        win INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        youtube_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export interface Game {
  id?: number;
  role: string;
  my_adc: string;
  my_support: string;
  enemy_adc: string;
  enemy_support: string;
  kills: number;
  deaths: number;
  assists: number;
  kill_participation: number;
  cs_per_min: number;
  win: number;
  notes?: string;
  youtube_url?: string;
  game_type?: string;
  game_date?: string;
  ai_summary?: string;
  created_at?: string;
}

export async function addGame(game: Omit<Game, 'id' | 'created_at'>) {
  // Use provided game_date or get current time in PST/PDT
  let created_at: string;
  if (game.game_date) {
    // If game_date is provided, use it with midnight PST time
    created_at = `${game.game_date} 00:00:00`;
  } else {
    const now = new Date();
    const pstTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    created_at = pstTime.toISOString().replace('T', ' ').substring(0, 19);
  }

  const result = await client.execute({
    sql: `
      INSERT INTO games (role, my_adc, my_support, enemy_adc, enemy_support, kills, deaths, assists, kill_participation, cs_per_min, win, notes, youtube_url, game_type, ai_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      game.role,
      game.my_adc,
      game.my_support,
      game.enemy_adc,
      game.enemy_support,
      game.kills,
      game.deaths,
      game.assists,
      game.kill_participation,
      game.cs_per_min,
      game.win,
      game.notes || null,
      game.youtube_url || null,
      game.game_type || 'solo_queue',
      game.ai_summary || null,
      created_at
    ]
  });

  return result.lastInsertRowid;
}

export async function getGames(limit?: number, championFilter?: string, roleFilter?: string, enemyChampionFilter?: string, gameTypeFilter?: string): Promise<Game[]> {
  let query = 'SELECT * FROM games';
  const args: any[] = [];
  const conditions: string[] = [];

  if (roleFilter && roleFilter !== 'all') {
    conditions.push('role = ?');
    args.push(roleFilter);
  }

  if (championFilter) {
    conditions.push('(my_adc = ? OR my_support = ?)');
    args.push(championFilter, championFilter);
  }

  if (enemyChampionFilter) {
    conditions.push('(enemy_adc = ? OR enemy_support = ?)');
    args.push(enemyChampionFilter, enemyChampionFilter);
  }

  if (gameTypeFilter && gameTypeFilter !== 'all') {
    conditions.push('game_type = ?');
    args.push(gameTypeFilter);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  if (limit) {
    query += ' LIMIT ?';
    args.push(limit);
  }

  const result = await client.execute({
    sql: query,
    args: args
  });

  return result.rows as unknown as Game[];
}

export async function getAllGames(): Promise<Game[]> {
  const result = await client.execute('SELECT * FROM games ORDER BY created_at DESC');
  return result.rows as unknown as Game[];
}

export async function updateGame(id: number, updates: { notes?: string; youtube_url?: string }) {
  const updateFields: string[] = [];
  const args: any[] = [];

  if (updates.notes !== undefined) {
    updateFields.push('notes = ?');
    args.push(updates.notes || null);
  }

  if (updates.youtube_url !== undefined) {
    updateFields.push('youtube_url = ?');
    args.push(updates.youtube_url || null);
  }

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  args.push(id);

  await client.execute({
    sql: `UPDATE games SET ${updateFields.join(', ')} WHERE id = ?`,
    args: args
  });
}

export { client };
