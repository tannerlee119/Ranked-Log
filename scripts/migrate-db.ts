import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

const client = createClient({
  url: envVars.TURSO_DATABASE_URL || '',
  authToken: envVars.TURSO_AUTH_TOKEN || '',
});

async function migrate() {
  console.log('Starting database migration...');

  // Step 1: Add new columns
  const columnsToAdd = [
    { name: 'my_top', type: 'TEXT' },
    { name: 'my_jungle', type: 'TEXT' },
    { name: 'my_mid', type: 'TEXT' },
    { name: 'enemy_top', type: 'TEXT' },
    { name: 'enemy_jungle', type: 'TEXT' },
    { name: 'enemy_mid', type: 'TEXT' },
    { name: 'game_type', type: 'TEXT' },
    { name: 'game_date', type: 'TEXT' },
    { name: 'ai_summary', type: 'TEXT' },
  ];

  console.log('\n--- Adding new columns ---');
  for (const column of columnsToAdd) {
    try {
      console.log(`Adding column: ${column.name}`);
      await client.execute(`ALTER TABLE games ADD COLUMN ${column.name} ${column.type}`);
      console.log(`✓ Added column: ${column.name}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate column name')) {
        console.log(`⊘ Column ${column.name} already exists, skipping`);
      } else {
        console.error(`✗ Error adding column ${column.name}:`, error.message);
      }
    }
  }

  // Step 2: Recreate table without NOT NULL constraints
  console.log('\n--- Recreating table to remove NOT NULL constraints ---');

  try {
    // Create new table with all fields nullable
    console.log('Creating new table schema...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS games_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL DEFAULT 'adc',
        my_top TEXT,
        my_jungle TEXT,
        my_mid TEXT,
        my_adc TEXT,
        my_support TEXT,
        enemy_top TEXT,
        enemy_jungle TEXT,
        enemy_mid TEXT,
        enemy_adc TEXT,
        enemy_support TEXT,
        kills INTEGER NOT NULL,
        deaths INTEGER NOT NULL,
        assists INTEGER NOT NULL,
        kill_participation REAL NOT NULL,
        cs_per_min REAL NOT NULL,
        win INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        youtube_url TEXT,
        game_type TEXT,
        game_date TEXT,
        ai_summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created new table');

    // Copy data from old table to new table
    console.log('Copying data to new table...');
    await client.execute(`
      INSERT INTO games_new (
        id, role, my_top, my_jungle, my_mid, my_adc, my_support,
        enemy_top, enemy_jungle, enemy_mid, enemy_adc, enemy_support,
        kills, deaths, assists, kill_participation, cs_per_min, win,
        notes, youtube_url, game_type, game_date, ai_summary, created_at
      )
      SELECT
        id, role, my_top, my_jungle, my_mid, my_adc, my_support,
        enemy_top, enemy_jungle, enemy_mid, enemy_adc, enemy_support,
        kills, deaths, assists, kill_participation, cs_per_min, win,
        notes, youtube_url, game_type, game_date, ai_summary, created_at
      FROM games
    `);
    console.log('✓ Copied data');

    // Drop old table
    console.log('Dropping old table...');
    await client.execute('DROP TABLE games');
    console.log('✓ Dropped old table');

    // Rename new table to games
    console.log('Renaming new table...');
    await client.execute('ALTER TABLE games_new RENAME TO games');
    console.log('✓ Renamed table');

  } catch (error: any) {
    console.error('✗ Error recreating table:', error.message);
  }

  console.log('\n✅ Migration complete!');
  process.exit(0);
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
