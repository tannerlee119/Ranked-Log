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

  console.log('\nMigration complete!');
  process.exit(0);
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
