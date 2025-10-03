'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Game {
  id: number;
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
  created_at: string;
}

interface DayGroup {
  date: string;
  games: Game[];
  wins: number;
  losses: number;
  winRate: number;
  notesWithSummaries: Array<{ gameId: number; notes: string; summary: string }>;
  daySummary: string;
}

export default function DailyLog() {
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyLog();
  }, []);

  const fetchDailyLog = async () => {
    try {
      // Fetch all games
      const gamesResponse = await fetch('/api/games');
      const games: Game[] = await gamesResponse.json();

      // Group games by day (PST timezone)
      const gamesByDay = new Map<string, Game[]>();
      games.forEach((game) => {
        const date = new Date(game.created_at).toLocaleDateString('en-US', {
          timeZone: 'America/Los_Angeles',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        if (!gamesByDay.has(date)) {
          gamesByDay.set(date, []);
        }
        gamesByDay.get(date)!.push(game);
      });

      // Process each day
      const processedDays: DayGroup[] = [];
      for (const [date, dayGames] of Array.from(gamesByDay.entries())) {
        const wins = dayGames.filter(g => g.win).length;
        const losses = dayGames.length - wins;
        const winRate = Math.round((wins / dayGames.length) * 100);

        // Get AI summaries for each game with notes
        const notesWithSummaries = await Promise.all(
          dayGames
            .filter(game => game.notes)
            .map(async (game) => {
              try {
                const summaryResponse = await fetch('/api/summarize', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ notes: game.notes }),
                });
                const summaryData = await summaryResponse.json();
                return {
                  gameId: game.id,
                  notes: game.notes || '',
                  summary: summaryData.summary || '',
                };
              } catch (error) {
                console.error('Failed to get summary for game:', error);
                return {
                  gameId: game.id,
                  notes: game.notes || '',
                  summary: '',
                };
              }
            })
        );

        // Get daily summary
        const allNotes = dayGames
          .filter(game => game.notes)
          .map(game => game.notes)
          .join('\n\n');

        let daySummary = '';
        if (allNotes) {
          try {
            const daySummaryResponse = await fetch('/api/summarize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notes: allNotes }),
            });
            const daySummaryData = await daySummaryResponse.json();
            daySummary = daySummaryData.summary || '';
          } catch (error) {
            console.error('Failed to get daily summary:', error);
          }
        }

        processedDays.push({
          date,
          games: dayGames,
          wins,
          losses,
          winRate,
          notesWithSummaries,
          daySummary,
        });
      }

      setDayGroups(processedDays);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch daily log:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Daily Log</h1>
          <Link
            href="/stats"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Stats
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading daily log...</div>
          </div>
        ) : dayGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">No games found</div>
          </div>
        ) : (
          <div className="space-y-6">
            {dayGroups.map((dayGroup) => (
              <div key={dayGroup.date} className="bg-gray-800 rounded-lg p-6">
                {/* Day Header */}
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <h2 className="text-2xl font-bold mb-2">{dayGroup.date}</h2>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-400">
                      {dayGroup.games.length} {dayGroup.games.length === 1 ? 'game' : 'games'}
                    </span>
                    <span className="text-green-400">{dayGroup.wins}W</span>
                    <span className="text-red-400">{dayGroup.losses}L</span>
                    <span className="text-blue-400">{dayGroup.winRate}% WR</span>
                  </div>
                </div>

                {/* Daily Summary */}
                {dayGroup.daySummary && (
                  <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
                    <h3 className="text-lg font-semibold mb-2 text-purple-300">📊 Daily Summary</h3>
                    <p className="text-gray-300 whitespace-pre-line">{dayGroup.daySummary}</p>
                  </div>
                )}

                {/* Game Notes with AI Summaries */}
                {dayGroup.notesWithSummaries.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300">Game Notes</h3>
                    {dayGroup.notesWithSummaries.map((item) => {
                      const game = dayGroup.games.find(g => g.id === item.gameId);
                      if (!game) return null;

                      return (
                        <div key={item.gameId} className="p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-gray-400">
                              Game #{item.gameId} • {game.my_adc || game.my_support} vs {game.enemy_adc} + {game.enemy_support} •
                              <span className={game.win ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>
                                {game.win ? 'Win' : 'Loss'}
                              </span>
                            </div>
                          </div>

                          {/* Original Notes */}
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-1">Notes:</div>
                            <p className="text-gray-300 whitespace-pre-line text-sm">{item.notes}</p>
                          </div>

                          {/* AI Summary */}
                          {item.summary && (
                            <div className="p-3 bg-blue-900/30 rounded border border-blue-700/50">
                              <div className="text-xs text-blue-300 mb-1">✨ AI Summary:</div>
                              <p className="text-gray-300 whitespace-pre-line text-sm">{item.summary}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
