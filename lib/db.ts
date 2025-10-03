import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'games.db');

let db: Database.Database;

export function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);

    // Create tables
    db.exec(`
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

    // Migrations
    try {
      const tableInfo = db.prepare("PRAGMA table_info(games)").all() as any[];

      // Add role column if it doesn't exist
      const hasRoleColumn = tableInfo.some((col: any) => col.name === 'role');
      if (!hasRoleColumn) {
        db.exec("ALTER TABLE games ADD COLUMN role TEXT NOT NULL DEFAULT 'adc'");
      }

      // Add win column if it doesn't exist
      const hasWinColumn = tableInfo.some((col: any) => col.name === 'win');
      if (!hasWinColumn) {
        db.exec('ALTER TABLE games ADD COLUMN win INTEGER NOT NULL DEFAULT 0');
      }

      // Add youtube_url column if it doesn't exist
      const hasYoutubeColumn = tableInfo.some((col: any) => col.name === 'youtube_url');
      if (!hasYoutubeColumn) {
        db.exec('ALTER TABLE games ADD COLUMN youtube_url TEXT');
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  return db;
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
  created_at?: string;
}

export function addGame(game: Omit<Game, 'id' | 'created_at'>) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO games (role, my_adc, my_support, enemy_adc, enemy_support, kills, deaths, assists, kill_participation, cs_per_min, win, notes, youtube_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
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
    game.youtube_url || null
  );

  return result.lastInsertRowid;
}

export function getGames(limit?: number, championFilter?: string, roleFilter?: string): Game[] {
  const db = getDb();
  let query = 'SELECT * FROM games';
  const params: any[] = [];
  const conditions: string[] = [];

  if (roleFilter && roleFilter !== 'all') {
    conditions.push('role = ?');
    params.push(roleFilter);
  }

  if (championFilter) {
    conditions.push('(my_adc = ? OR my_support = ?)');
    params.push(championFilter, championFilter);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  if (limit) {
    query += ' LIMIT ?';
    params.push(limit);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as Game[];
}

export function getAllGames(): Game[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM games ORDER BY created_at DESC');
  return stmt.all() as Game[];
}
