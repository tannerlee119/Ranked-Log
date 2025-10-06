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
  ai_summary?: string;
  created_at: string;
}

interface ChampionGroup {
  champion: string;
  games: Array<{
    game: Game;
    notes: string;
    summary: string;
  }>;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  championSummary: string;
}

export default function DailyLog() {
  const [championGroups, setChampionGroups] = useState<ChampionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChampions, setExpandedChampions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDailyLog();
  }, []);

  const fetchDailyLog = async () => {
    try {
      // Fetch all games
      const gamesResponse = await fetch('/api/games');
      const data = await gamesResponse.json();
      const games: Game[] = data.games || data;

      // Filter games with notes only
      const gamesWithNotes = games.filter(game => game.notes);

      // Group games by champion (my_adc or my_support)
      const gamesByChampion = new Map<string, Game[]>();
      gamesWithNotes.forEach((game) => {
        const champion = game.my_adc || game.my_support;
        if (!gamesByChampion.has(champion)) {
          gamesByChampion.set(champion, []);
        }
        gamesByChampion.get(champion)!.push(game);
      });

      // Process each champion group
      const processedChampions: ChampionGroup[] = [];
      for (const [champion, championGames] of Array.from(gamesByChampion.entries())) {
        // Sort games by date (most recent first)
        championGames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const wins = championGames.filter(g => g.win).length;
        const losses = championGames.length - wins;
        const winRate = Math.round((wins / championGames.length) * 100);

        // Use stored AI summaries (already in database)
        const gamesWithSummaries = championGames.map((game) => ({
          game,
          notes: game.notes || '',
          summary: game.ai_summary || '',
        }));

        // Get champion-level summary
        let championSummary = '';
        try {
          const summaryResponse = await fetch('/api/champion-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              champion,
              games: championGames
            }),
          });
          const summaryData = await summaryResponse.json();
          championSummary = summaryData.summary || '';
        } catch (error) {
          console.error('Failed to get champion summary:', error);
        }

        processedChampions.push({
          champion,
          games: gamesWithSummaries,
          totalGames: championGames.length,
          wins,
          losses,
          winRate,
          championSummary,
        });
      }

      // Sort champions by most recent game
      processedChampions.sort((a, b) => {
        const aLatest = new Date(a.games[0].game.created_at).getTime();
        const bLatest = new Date(b.games[0].game.created_at).getTime();
        return bLatest - aLatest;
      });

      setChampionGroups(processedChampions);
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
          <h1 className="text-3xl font-bold">Notes</h1>
          <Link
            href="/stats"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Stats
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading notes...</div>
          </div>
        ) : championGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">No notes found</div>
          </div>
        ) : (
          <div className="space-y-6">
            {championGroups.map((championGroup) => {
              const isExpanded = expandedChampions.has(championGroup.champion);

              return (
                <div key={championGroup.champion} className="bg-gray-800 rounded-lg p-6">
                  {/* Champion Header */}
                  <div
                    className="mb-4 pb-4 border-b border-gray-700 cursor-pointer"
                    onClick={() => {
                      setExpandedChampions(prev => {
                        const next = new Set(prev);
                        if (next.has(championGroup.champion)) {
                          next.delete(championGroup.champion);
                        } else {
                          next.add(championGroup.champion);
                        }
                        return next;
                      });
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">{championGroup.champion}</h2>
                      <button className="text-gray-400 hover:text-gray-200">
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>
                    <div className="flex gap-4 text-sm mt-2">
                      <span className="text-gray-400">
                        {championGroup.totalGames} {championGroup.totalGames === 1 ? 'game' : 'games'} with notes
                      </span>
                      <span className="text-green-400">{championGroup.wins}W</span>
                      <span className="text-red-400">{championGroup.losses}L</span>
                      <span className="text-blue-400">{championGroup.winRate}% WR</span>
                    </div>
                  </div>

                  {/* Champion Summary (Always Visible) */}
                  {championGroup.championSummary && (
                    <div className="mb-4 p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
                      <h3 className="text-lg font-semibold mb-2 text-purple-300">📊 Overall Performance Summary</h3>
                      <p className="text-gray-300 whitespace-pre-line">{championGroup.championSummary}</p>
                    </div>
                  )}

                  {/* Game Notes with AI Summaries (Expandable) */}
                  {isExpanded && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-300 mt-4">Individual Game Notes</h3>
                      {championGroup.games.map((item) => {
                        const game = item.game;
                        const date = new Date(game.created_at).toLocaleDateString('en-US', {
                          timeZone: 'America/Los_Angeles',
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });

                        return (
                          <div key={game.id} className="p-4 bg-gray-700/50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm text-gray-400">
                                {date} • vs {game.enemy_adc} + {game.enemy_support} •
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
