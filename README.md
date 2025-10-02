# League Bot Lane Tracker

A web application to track and analyze your League of Legends bot lane performance.

## Features

- **Game Logging**: Record your bot lane games with:
  - Champion picks (your ADC/Support and enemy ADC/Support)
  - Performance stats (K/D/A, Kill Participation, CS per minute)
  - Personal notes for improvement points

- **Statistics Dashboard**: View your performance with:
  - Filters for last 10, 20, or all-time games
  - Champion-specific filtering
  - Average KDA, Kill Participation, and CS/min stats
  - Complete game history table

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **SQLite (better-sqlite3)** - Local database

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Deployment

This app is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy (Vercel will auto-detect Next.js)

**Note**: For production, consider migrating to a cloud database like Vercel Postgres or PlanetScale for persistent data storage across deployments.

## Project Structure

- `/app` - Next.js app directory
  - `/api/games` - API routes for game data
  - `/log` - Game logging form
  - `/stats` - Statistics dashboard
- `/lib/db.ts` - Database functions
- `/data` - SQLite database file (git-ignored)