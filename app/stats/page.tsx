'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Game {
  id: number;
  my_adc: string;
  my_support: string;
  enemy_adc: string;
  enemy_support: string;
  kills: number;
  deaths: number;
  assists: number;
  kill_participation: number;
  cs_per_min: number;
  notes?: string;
  created_at: string;
}

interface Stats {
  gamesPlayed: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKDA: number;
  avgKP: number;
  avgCS: number;
}

export default function Stats() {
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<'10' | '20' | 'all'>('10');
  const [championFilter, setChampionFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, [filter, championFilter]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const limit = filter === 'all' ? '' : filter;
      const champion = championFilter || '';
      const response = await fetch(`/api/games?limit=${limit}&champion=${champion}`);
      const data = await response.json();

      if (data.success) {
        setGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (): Stats => {
    if (games.length === 0) {
      return {
        gamesPlayed: 0,
        avgKills: 0,
        avgDeaths: 0,
        avgAssists: 0,
        avgKDA: 0,
        avgKP: 0,
        avgCS: 0,
      };
    }

    const totalKills = games.reduce((sum, g) => sum + g.kills, 0);
    const totalDeaths = games.reduce((sum, g) => sum + g.deaths, 0);
    const totalAssists = games.reduce((sum, g) => sum + g.assists, 0);
    const totalKP = games.reduce((sum, g) => sum + g.kill_participation, 0);
    const totalCS = games.reduce((sum, g) => sum + g.cs_per_min, 0);

    const avgKills = totalKills / games.length;
    const avgDeaths = totalDeaths / games.length;
    const avgAssists = totalAssists / games.length;
    const avgKDA = avgDeaths === 0 ? avgKills + avgAssists : (avgKills + avgAssists) / avgDeaths;

    return {
      gamesPlayed: games.length,
      avgKills: Math.round(avgKills * 10) / 10,
      avgDeaths: Math.round(avgDeaths * 10) / 10,
      avgAssists: Math.round(avgAssists * 10) / 10,
      avgKDA: Math.round(avgKDA * 100) / 100,
      avgKP: Math.round((totalKP / games.length) * 10) / 10,
      avgCS: Math.round((totalCS / games.length) * 10) / 10,
    };
  };

  const stats = calculateStats();

  const uniqueChampions = Array.from(
    new Set(games.flatMap((g) => [g.my_adc, g.my_support]))
  ).sort();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Ranked Log</h1>
          <Link
            href="/log"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Log a Game
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Game Range</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('10')}
                  className={`px-4 py-2 rounded cursor-pointer ${
                    filter === '10' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Last 10
                </button>
                <button
                  onClick={() => setFilter('20')}
                  className={`px-4 py-2 rounded cursor-pointer ${
                    filter === '20' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Last 20
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded cursor-pointer ${
                    filter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Champion Filter</label>
              <select
                value={championFilter}
                onChange={(e) => setChampionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="">All Champions</option>
                {uniqueChampions.map((champ) => (
                  <option key={champ} value={champ}>
                    {champ}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Games Played</div>
                <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Avg KDA</div>
                <div className="text-3xl font-bold">
                  {stats.avgKDA.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {stats.avgKills} / {stats.avgDeaths} / {stats.avgAssists}
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Avg KP</div>
                <div className="text-3xl font-bold">{stats.avgKP}%</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Avg CS/min</div>
                <div className="text-3xl font-bold">{stats.avgCS}</div>
              </div>
            </div>

            {/* Game History */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Game History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">My Duo</th>
                      <th className="px-4 py-3 text-left">Enemy Duo</th>
                      <th className="px-4 py-3 text-left">KDA</th>
                      <th className="px-4 py-3 text-left">KP</th>
                      <th className="px-4 py-3 text-left">CS/min</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {games.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No games logged yet. <Link href="/log" className="text-blue-400 hover:underline">Log your first game!</Link>
                        </td>
                      </tr>
                    ) : (
                      games.map((game) => {
                        const kda = game.deaths === 0
                          ? (game.kills + game.assists).toFixed(2)
                          : ((game.kills + game.assists) / game.deaths).toFixed(2);

                        return (
                          <tr key={game.id} className="hover:bg-gray-750">
                            <td className="px-4 py-3">
                              {new Date(game.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <div className="text-blue-400">{game.my_adc}</div>
                                <div className="text-gray-400">{game.my_support}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <div className="text-red-400">{game.enemy_adc}</div>
                                <div className="text-gray-400">{game.enemy_support}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold">{kda}</div>
                              <div className="text-xs text-gray-500">
                                {game.kills}/{game.deaths}/{game.assists}
                              </div>
                            </td>
                            <td className="px-4 py-3">{game.kill_participation}%</td>
                            <td className="px-4 py-3">{game.cs_per_min}</td>
                            <td className="px-4 py-3 max-w-xs">
                              <div className="text-sm text-gray-400 truncate">
                                {game.notes || '-'}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
