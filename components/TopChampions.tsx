'use client';

import ChampionIcon from './ChampionIcon';

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
  created_at: string;
}

interface TopChampionsProps {
  games: Game[];
}

interface ChampionStats {
  name: string;
  games: number;
  wins: number;
  winRate: number;
  avgKDA: number;
  avgCS: number;
  avgKP: number;
}

export default function TopChampions({ games }: TopChampionsProps) {
  // Calculate champion stats
  const championMap = new Map<string, { games: number; wins: number; totalKills: number; totalDeaths: number; totalAssists: number; totalCS: number; totalKP: number }>();

  games.forEach((game) => {
    const champion = game.my_adc; // For ADC role

    if (!championMap.has(champion)) {
      championMap.set(champion, {
        games: 0,
        wins: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        totalCS: 0,
        totalKP: 0,
      });
    }

    const stats = championMap.get(champion)!;
    stats.games += 1;
    stats.wins += game.win;
    stats.totalKills += game.kills;
    stats.totalDeaths += game.deaths;
    stats.totalAssists += game.assists;
    stats.totalCS += game.cs_per_min;
    stats.totalKP += game.kill_participation;
  });

  // Convert to array and calculate averages
  const championStats: ChampionStats[] = Array.from(championMap.entries()).map(([name, stats]) => {
    const avgKDA = stats.totalDeaths === 0
      ? stats.totalKills + stats.totalAssists
      : (stats.totalKills + stats.totalAssists) / stats.totalDeaths;

    return {
      name,
      games: stats.games,
      wins: stats.wins,
      winRate: Math.round((stats.wins / stats.games) * 100),
      avgKDA: parseFloat(avgKDA.toFixed(2)),
      avgCS: parseFloat((stats.totalCS / stats.games).toFixed(1)),
      avgKP: parseFloat((stats.totalKP / stats.games).toFixed(1)),
    };
  });

  // Sort by games played and take top 10
  const topChampions = championStats
    .sort((a, b) => b.games - a.games)
    .slice(0, 10);

  if (topChampions.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Most Played Champions</h3>
        <div className="text-center py-8 text-gray-500">
          No champions played yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Most Played Champions</h3>
      <div className="space-y-3">
        {topChampions.map((champ, index) => (
          <div
            key={champ.name}
            className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors"
          >
            <div className="text-gray-400 font-bold w-6">{index + 1}</div>
            <ChampionIcon championName={champ.name} size={40} />
            <div className="flex-1">
              <div className="font-semibold text-white">{champ.name}</div>
              <div className="text-sm text-gray-400">
                {champ.games} game{champ.games > 1 ? 's' : ''} · <span className={champ.winRate > 50 ? 'text-green-400' : champ.winRate === 50 ? 'text-yellow-400' : 'text-red-400'}>{champ.winRate}% WR</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-400">{champ.avgKDA} KDA</div>
              <div className="text-xs text-gray-400">{champ.avgCS} CS/m · {champ.avgKP}% KP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
