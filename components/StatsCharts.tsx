'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  notes?: string;
  created_at: string;
}

interface StatsChartsProps {
  games: Game[];
}

export default function StatsCharts({ games }: StatsChartsProps) {
  // Group games by day and calculate daily averages
  const gamesByDay = new Map<string, Game[]>();

  games.forEach((game) => {
    const dateKey = new Date(game.created_at).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', year: 'numeric' });
    if (!gamesByDay.has(dateKey)) {
      gamesByDay.set(dateKey, []);
    }
    gamesByDay.get(dateKey)!.push(game);
  });

  // Calculate daily averages
  const chartData = Array.from(gamesByDay.entries())
    .map(([date, dayGames]) => {
      const totalKills = dayGames.reduce((sum, g) => sum + g.kills, 0);
      const totalDeaths = dayGames.reduce((sum, g) => sum + g.deaths, 0);
      const totalAssists = dayGames.reduce((sum, g) => sum + g.assists, 0);
      const totalCS = dayGames.reduce((sum, g) => sum + g.cs_per_min, 0);
      const totalKP = dayGames.reduce((sum, g) => sum + g.kill_participation, 0);
      const numGames = dayGames.length;

      const avgKDA = totalDeaths === 0
        ? totalKills + totalAssists
        : (totalKills + totalAssists) / totalDeaths;

      return {
        date,
        dateObj: new Date(dayGames[0].created_at),
        cs_per_min: parseFloat((totalCS / numGames).toFixed(2)),
        kill_participation: parseFloat((totalKP / numGames).toFixed(1)),
        kda: parseFloat(avgKDA.toFixed(2)),
        games: numGames,
      };
    })
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .map(({ dateObj, ...rest }) => rest); // Remove dateObj after sorting

  if (games.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data to display. Log some games to see charts!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KDA Chart */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">KDA Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Line type="monotone" dataKey="kda" stroke="#3B82F6" strokeWidth={2} name="KDA" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CS/min and KP Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">CS per Minute</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="cs_per_min" stroke="#10B981" strokeWidth={2} name="CS/min" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Kill Participation %</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="kill_participation" stroke="#F59E0B" strokeWidth={2} name="KP %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
