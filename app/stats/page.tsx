'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LineChart, Trophy, Plus, FileText } from 'lucide-react';
import ChampionIcon from '@/components/ChampionIcon';
import ChampionAutocomplete from '@/components/ChampionAutocomplete';
import StatsCharts from '@/components/StatsCharts';
import TopChampions from '@/components/TopChampions';
import Modal from '@/components/Modal';

interface Game {
  id: number;
  role: string;
  my_top?: string;
  my_mid?: string;
  my_adc?: string;
  my_support?: string;
  my_jungle?: string;
  enemy_top?: string;
  enemy_mid?: string;
  enemy_adc?: string;
  enemy_support?: string;
  enemy_jungle?: string;
  kills: number;
  deaths: number;
  assists: number;
  kill_participation: number;
  cs_per_min: number;
  win: number;
  notes?: string;
  youtube_url?: string;
  game_type?: string;
  created_at: string;
}

interface Stats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKDA: number;
  avgKP: number;
  avgCS: number;
}

export default function Stats() {
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<'20' | '40' | 'all'>('20');
  const [championFilter, setChampionFilter] = useState<string>('');
  const [championInput, setChampionInput] = useState<string>('');
  const [enemyChampionFilter, setEnemyChampionFilter] = useState<string>('');
  const [enemyChampionInput, setEnemyChampionInput] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [gameTypeFilter, setGameTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showGraphs, setShowGraphs] = useState(false);
  const [showTopChampions, setShowTopChampions] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedYoutubeUrl, setEditedYoutubeUrl] = useState<string>('');
  const [isEditingYoutube, setIsEditingYoutube] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const gamesPerPage = 20;

  const getGameTypeInfo = (gameType?: string) => {
    switch (gameType) {
      case 'flex':
        return { label: 'Flex', color: 'bg-teal-900 text-teal-300' };
      case 'scrim':
        return { label: 'Scrim', color: 'bg-yellow-900 text-yellow-300' };
      case 'official_match':
        return { label: 'Official', color: 'bg-purple-900 text-purple-300' };
      case 'solo_queue':
      default:
        return { label: 'Solo Q', color: 'bg-blue-900 text-blue-300' };
    }
  };

  const getKPColor = (kp: number) => {
    if (kp >= 60) return 'text-green-400';
    if (kp >= 35.1) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCSColor = (cs: number) => {
    if (cs >= 8.0) return 'text-green-400';
    if (cs >= 6.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getKDAColor = (kda: number) => {
    if (kda > 3.75) return 'text-green-400';
    if (kda >= 2.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'top': return 'Top';
      case 'jungle': return 'Jungle';
      case 'mid': return 'Mid';
      case 'adc': return 'ADC';
      case 'support': return 'Support';
      default: return role;
    }
  };

  // Get champion data based on role
  const getRoleChampions = (game: Game) => {
    switch (game.role) {
      case 'top':
        return {
          myChampions: [
            { name: game.my_top!, label: 'Top', isPlayer: true },
            { name: game.my_jungle!, label: 'Jungle', isPlayer: false },
          ],
          enemyChampions: [
            { name: game.enemy_top!, label: 'Top', isPlayer: false },
            { name: game.enemy_jungle!, label: 'Jungle', isPlayer: false },
          ],
        };
      case 'jungle':
        return {
          myChampions: [
            { name: game.my_jungle!, label: 'Jungle', isPlayer: true },
            { name: game.my_mid!, label: 'Mid', isPlayer: false },
            { name: game.my_support!, label: 'Support', isPlayer: false },
          ],
          enemyChampions: [
            { name: game.enemy_jungle!, label: 'Jungle', isPlayer: false },
            { name: game.enemy_mid!, label: 'Mid', isPlayer: false },
            { name: game.enemy_support!, label: 'Support', isPlayer: false },
          ],
        };
      case 'mid':
        return {
          myChampions: [
            { name: game.my_mid!, label: 'Mid', isPlayer: true },
            { name: game.my_jungle!, label: 'Jungle', isPlayer: false },
          ],
          enemyChampions: [
            { name: game.enemy_mid!, label: 'Mid', isPlayer: false },
            { name: game.enemy_jungle!, label: 'Jungle', isPlayer: false },
          ],
        };
      case 'adc':
        return {
          myChampions: [
            { name: game.my_adc!, label: 'ADC', isPlayer: true },
            { name: game.my_support!, label: 'Support', isPlayer: false },
          ],
          enemyChampions: [
            { name: game.enemy_adc!, label: 'ADC', isPlayer: false },
            { name: game.enemy_support!, label: 'Support', isPlayer: false },
          ],
        };
      case 'support':
        return {
          myChampions: [
            { name: game.my_support!, label: 'Support', isPlayer: true },
            { name: game.my_adc!, label: 'ADC', isPlayer: false },
            { name: game.my_jungle!, label: 'Jungle', isPlayer: false },
          ],
          enemyChampions: [
            { name: game.enemy_support!, label: 'Support', isPlayer: false },
            { name: game.enemy_adc!, label: 'ADC', isPlayer: false },
            { name: game.enemy_jungle!, label: 'Jungle', isPlayer: false },
          ],
        };
      default:
        return {
          myChampions: [],
          enemyChampions: [],
        };
    }
  };

  // Clear filter when input is cleared
  useEffect(() => {
    if (championInput === '') {
      setChampionFilter('');
    }
  }, [championInput]);

  useEffect(() => {
    if (enemyChampionInput === '') {
      setEnemyChampionFilter('');
    }
  }, [enemyChampionInput]);

  useEffect(() => {
    fetchGames();
  }, [filter, championFilter, enemyChampionFilter, roleFilter, gameTypeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, championFilter, enemyChampionFilter, roleFilter, gameTypeFilter]);

  // Refetch games when window regains focus (e.g., after editing in another tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchGames();
      // If a game is selected in the modal, refresh its data
      if (selectedGame) {
        fetch(`/api/games/${selectedGame.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.game) {
              setSelectedGame(data.game);
              setEditedNotes(data.game.notes || '');
              setEditedYoutubeUrl(data.game.youtube_url || '');
            }
          })
          .catch(err => console.error('Error refreshing game data:', err));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [filter, championFilter, enemyChampionFilter, roleFilter, gameTypeFilter, selectedGame]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const limit = filter === 'all' ? '' : filter;
      const champion = championFilter || '';
      const enemyChampion = enemyChampionFilter || '';
      const role = roleFilter || 'all';
      const gameType = gameTypeFilter || 'all';
      const response = await fetch(`/api/games?limit=${limit}&champion=${champion}&enemyChampion=${enemyChampion}&role=${role}&gameType=${gameType}`);
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
        wins: 0,
        losses: 0,
        winRate: 0,
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
    const wins = games.reduce((sum, g) => sum + g.win, 0);
    const losses = games.length - wins;

    const avgKills = totalKills / games.length;
    const avgDeaths = totalDeaths / games.length;
    const avgAssists = totalAssists / games.length;
    const avgKDA = avgDeaths === 0 ? avgKills + avgAssists : (avgKills + avgAssists) / avgDeaths;

    return {
      gamesPlayed: games.length,
      wins,
      losses,
      winRate: Math.round((wins / games.length) * 100),
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

  // Pagination
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(games.length / gamesPerPage);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Ranked Log</h1>
          <div className="flex gap-3">
            <Link
              href="/daily-log"
              className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors"
            >
              <FileText size={18} />
              <span>Notes</span>
            </Link>
            <Link
              href="/log"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus size={18} />
              <span>Log Game</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid md:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`w-12 h-12 rounded cursor-pointer flex items-center justify-center p-2 ${
                    roleFilter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="All Roles"
                >
                  <Image src="/roles/all.png" alt="All Roles" width={32} height={32} />
                </button>
                <button
                  onClick={() => setRoleFilter('top')}
                  className={`w-12 h-12 rounded cursor-pointer flex items-center justify-center p-2 ${
                    roleFilter === 'top' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="Top"
                >
                  <Image src="/roles/top.png" alt="Top" width={32} height={32} />
                </button>
                <button
                  onClick={() => setRoleFilter('jungle')}
                  className={`w-12 h-12 rounded cursor-pointer flex items-center justify-center p-2 ${
                    roleFilter === 'jungle' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="Jungle"
                >
                  <Image src="/roles/jungle.png" alt="Jungle" width={32} height={32} />
                </button>
                <button
                  onClick={() => setRoleFilter('mid')}
                  className={`w-12 h-12 rounded cursor-pointer flex items-center justify-center p-2 ${
                    roleFilter === 'mid' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="Mid"
                >
                  <Image src="/roles/mid.png" alt="Mid" width={32} height={32} />
                </button>
                <button
                  onClick={() => setRoleFilter('adc')}
                  className={`w-12 h-12 rounded cursor-pointer flex items-center justify-center p-2 ${
                    roleFilter === 'adc' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="ADC"
                >
                  <Image src="/roles/adc.png" alt="ADC" width={32} height={32} />
                </button>
                <button
                  onClick={() => setRoleFilter('support')}
                  className={`w-12 h-12 rounded cursor-pointer flex items-center justify-center p-2 ${
                    roleFilter === 'support' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="Support"
                >
                  <Image src="/roles/support.png" alt="Support" width={32} height={32} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Game Range</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('20')}
                    className={`px-4 py-2 rounded cursor-pointer ${
                      filter === '20' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Last 20
                  </button>
                  <button
                    onClick={() => setFilter('40')}
                    className={`px-4 py-2 rounded cursor-pointer ${
                      filter === '40' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Last 40
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
                <label className="block text-sm font-medium mb-1">Game Type</label>
                <select
                  value={gameTypeFilter}
                  onChange={(e) => setGameTypeFilter(e.target.value)}
                  className="w-full h-[42px] px-3 py-2 pr-10 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="solo_queue">Solo Queue</option>
                  <option value="flex">Flex</option>
                  <option value="scrim">Scrim</option>
                  <option value="official_match">Official Match</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <ChampionAutocomplete
                  label="My Champion"
                  value={championInput}
                  onChange={(value) => setChampionInput(value)}
                  onSelect={(value) => setChampionFilter(value)}
                  placeholder="Filter by your champion"
                />
                {championFilter && (
                  <button
                    onClick={() => {
                      setChampionInput('');
                      setChampionFilter('');
                    }}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div>
                <ChampionAutocomplete
                  label="Enemy Champion"
                  value={enemyChampionInput}
                  onChange={(value) => setEnemyChampionInput(value)}
                  onSelect={(value) => setEnemyChampionFilter(value)}
                  placeholder="Filter by enemy champion"
                />
                {enemyChampionFilter && (
                  <button
                    onClick={() => {
                      setEnemyChampionInput('');
                      setEnemyChampionFilter('');
                    }}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {/* Summary Stats Cards */}
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Games Played</div>
                <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className={`text-3xl font-bold ${stats.winRate > 53 ? 'text-green-400' : stats.winRate >= 47 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.winRate}%</div>
                <div className="text-sm text-gray-500">
                  {stats.wins}W - {stats.losses}L
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Avg KDA</div>
                <div className={`text-3xl font-bold ${getKDAColor(stats.avgKDA)}`}>
                  {stats.avgKDA.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {stats.avgKills} / {stats.avgDeaths} / {stats.avgAssists}
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Avg KP</div>
                <div className={`text-3xl font-bold ${getKPColor(stats.avgKP)}`}>{stats.avgKP}%</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Avg CS/min</div>
                <div className={`text-3xl font-bold ${getCSColor(stats.avgCS)}`}>{stats.avgCS}</div>
              </div>
            </div>

            {/* View Toggles */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowGraphs(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <LineChart size={18} />
                <span>Performance Graphs</span>
              </button>
              <button
                onClick={() => setShowTopChampions(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <Trophy size={18} />
                <span>Most Played</span>
              </button>
            </div>

            {/* Modals */}
            <Modal
              isOpen={showGraphs}
              onClose={() => setShowGraphs(false)}
              title="Performance Graphs"
            >
              <StatsCharts games={games} />
            </Modal>

            <Modal
              isOpen={showTopChampions}
              onClose={() => setShowTopChampions(false)}
              title="Most Played Champions"
            >
              <TopChampions games={games} />
            </Modal>

            {/* Game Details Modal */}
            {selectedGame && (
              <Modal
                isOpen={!!selectedGame}
                onClose={() => {
                  setSelectedGame(null);
                  setEditedNotes('');
                  setIsEditingNotes(false);
                  setShowDeleteConfirm(false);
                }}
                title="Game Details"
              >
                <div className="space-y-6">
                  {/* Game Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Date</div>
                      <div className="font-semibold">{new Date(selectedGame.created_at).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Result</div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        selectedGame.win ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {selectedGame.win ? 'Win' : 'Loss'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Game Type</div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getGameTypeInfo(selectedGame.game_type).color}`}>
                        {getGameTypeInfo(selectedGame.game_type).label}
                      </span>
                    </div>
                  </div>

                  {/* Champions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">My Team</div>
                      <div className="space-y-2">
                        {getRoleChampions(selectedGame).myChampions.map((champ, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <ChampionIcon championName={champ.name} size={40} />
                            <div className={champ.isPlayer ? 'text-blue-400' : ''}>
                              {champ.name} <span className="text-xs text-gray-500">({champ.label})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Enemy Team</div>
                      <div className="space-y-2">
                        {getRoleChampions(selectedGame).enemyChampions.map((champ, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <ChampionIcon championName={champ.name} size={40} />
                            <div className={idx === 0 ? 'text-red-400' : ''}>
                              {champ.name} <span className="text-xs text-gray-500">({champ.label})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-sm text-gray-400">KDA</div>
                      <div className="text-xl font-bold">
                        {selectedGame.deaths === 0
                          ? (selectedGame.kills + selectedGame.assists).toFixed(2)
                          : ((selectedGame.kills + selectedGame.assists) / selectedGame.deaths).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedGame.kills}/{selectedGame.deaths}/{selectedGame.assists}
                      </div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-sm text-gray-400">Kill Participation</div>
                      <div className="text-xl font-bold">{selectedGame.kill_participation}%</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-sm text-gray-400">CS/min</div>
                      <div className="text-xl font-bold">{selectedGame.cs_per_min}</div>
                    </div>
                  </div>

                  {/* YouTube VOD */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">VOD Replay</div>
                    {editedYoutubeUrl ? (
                      <div className="space-y-2">
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <iframe
                            width="100%"
                            height="100%"
                            src={editedYoutubeUrl.replace('watch?v=', 'embed/')}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        {isEditingYoutube && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editedYoutubeUrl}
                              onChange={(e) => setEditedYoutubeUrl(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                              placeholder="YouTube URL"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (selectedGame) {
                                    try {
                                      const response = await fetch(`/api/games/${selectedGame.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ youtube_url: editedYoutubeUrl }),
                                      });
                                      if (response.ok) {
                                        setIsEditingYoutube(false);
                                        fetchGames();
                                      }
                                    } catch (error) {
                                      console.error('Failed to update YouTube URL:', error);
                                    }
                                  }
                                }}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditedYoutubeUrl(selectedGame?.youtube_url || '');
                                  setIsEditingYoutube(false);
                                }}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                        {!isEditingYoutube && (
                          <button
                            onClick={() => setIsEditingYoutube(true)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Edit URL
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={editedYoutubeUrl}
                          onChange={(e) => setEditedYoutubeUrl(e.target.value)}
                          onFocus={() => setIsEditingYoutube(true)}
                          className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          placeholder="Add YouTube URL..."
                        />
                        {isEditingYoutube && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={async () => {
                                if (selectedGame) {
                                  try {
                                    const response = await fetch(`/api/games/${selectedGame.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ youtube_url: editedYoutubeUrl }),
                                    });
                                    if (response.ok) {
                                      setIsEditingYoutube(false);
                                      fetchGames();
                                    }
                                  } catch (error) {
                                    console.error('Failed to update YouTube URL:', error);
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditedYoutubeUrl(selectedGame?.youtube_url || '');
                                setIsEditingYoutube(false);
                              }}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Notes</div>
                    <textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      onFocus={() => setIsEditingNotes(true)}
                      rows={6}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      placeholder="Add notes about this game..."
                    />
                    {isEditingNotes && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={async () => {
                            if (selectedGame) {
                              try {
                                const response = await fetch(`/api/games/${selectedGame.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ notes: editedNotes }),
                                });
                                if (response.ok) {
                                  setIsEditingNotes(false);
                                  fetchGames();
                                }
                              } catch (error) {
                                console.error('Failed to update notes:', error);
                              }
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditedNotes(selectedGame?.notes || '');
                            setIsEditingNotes(false);
                          }}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-700 flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedGame) {
                          // Navigate to edit page or open in new tab
                          window.open(`/log?edit=${selectedGame.id}`, '_blank');
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm cursor-pointer transition-colors"
                    >
                      Edit Game
                    </button>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded text-sm cursor-pointer transition-colors"
                      >
                        Delete Game
                      </button>
                    ) : (
                      <div className="flex-1">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-300">Are you sure you want to delete this game? This action cannot be undone.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (selectedGame) {
                                  try {
                                    const response = await fetch(`/api/games/${selectedGame.id}`, {
                                      method: 'DELETE',
                                    });
                                    if (response.ok) {
                                      setSelectedGame(null);
                                      setShowDeleteConfirm(false);
                                      fetchGames();
                                    }
                                  } catch (error) {
                                    console.error('Failed to delete game:', error);
                                  }
                                }
                              }}
                              className="px-3 py-1.5 bg-red-900/60 hover:bg-red-900/80 text-red-200 rounded text-sm cursor-pointer transition-colors"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Modal>
            )}

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
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Result</th>
                      <th className="px-4 py-3 text-left">My Team</th>
                      <th className="px-4 py-3 text-left">Enemy Team</th>
                      <th className="px-4 py-3 text-left">KDA</th>
                      <th className="px-4 py-3 text-left">KP</th>
                      <th className="px-4 py-3 text-left">CS/min</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {games.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                          No games logged yet. <Link href="/log" className="text-blue-400 hover:underline">Log your first game!</Link>
                        </td>
                      </tr>
                    ) : (
                      currentGames.map((game) => {
                        const kda = game.deaths === 0
                          ? (game.kills + game.assists).toFixed(2)
                          : ((game.kills + game.assists) / game.deaths).toFixed(2);
                        const gameTypeInfo = getGameTypeInfo(game.game_type);
                        const roleChampions = getRoleChampions(game);

                        return (
                          <tr
                            key={game.id}
                            className="hover:bg-gray-750 cursor-pointer"
                            onClick={() => {
                              setSelectedGame(game);
                              setEditedNotes(game.notes || '');
                              setEditedYoutubeUrl(game.youtube_url || '');
                            }}
                          >
                            <td className="px-4 py-3">
                              {new Date(game.created_at).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                <Image src={`/roles/${game.role}.png`} alt={getRoleLabel(game.role)} width={32} height={32} title={getRoleLabel(game.role)} />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`px-2 py-1 rounded text-xs font-semibold text-center inline-block w-20 ${
                                  game.win ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                }`}>
                                  {game.win ? 'Win' : 'Loss'}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold text-center inline-block w-20 ${gameTypeInfo.color}`}>
                                  {gameTypeInfo.label}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {roleChampions.myChampions.map((champ, idx) => (
                                <div key={idx} className={`flex items-center gap-2 ${idx > 0 ? 'mt-2' : ''}`}>
                                  <ChampionIcon championName={champ.name} size={32} />
                                  <div className={`text-sm ${champ.isPlayer ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {champ.name}
                                  </div>
                                </div>
                              ))}
                            </td>
                            <td className="px-4 py-3">
                              {roleChampions.enemyChampions.map((champ, idx) => (
                                <div key={idx} className={`flex items-center gap-2 ${idx > 0 ? 'mt-2' : ''}`}>
                                  <ChampionIcon championName={champ.name} size={32} />
                                  <div className={`text-sm ${idx === 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {champ.name}
                                  </div>
                                </div>
                              ))}
                            </td>
                            <td className="px-4 py-3">
                              <div className={`font-semibold ${getKDAColor(parseFloat(kda))}`}>{kda}</div>
                              <div className="text-xs text-gray-500">
                                {game.kills}/{game.deaths}/{game.assists}
                              </div>
                            </td>
                            <td className={`px-4 py-3 font-semibold ${getKPColor(game.kill_participation)}`}>{game.kill_participation}%</td>
                            <td className={`px-4 py-3 font-semibold ${getCSColor(game.cs_per_min)}`}>{game.cs_per_min}</td>
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

              {/* Pagination */}
              {games.length > gamesPerPage && (
                <div className="mt-6 mb-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
