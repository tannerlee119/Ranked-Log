'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ChampionAutocomplete from '@/components/ChampionAutocomplete';

type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support' | null;

export default function LogGame() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  // Get current date in PST and format as YYYY-MM-DD
  const getCurrentPSTDate = () => {
    const now = new Date();
    const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    return pstDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    my_adc: '',
    my_support: '',
    enemy_adc: '',
    enemy_support: '',
    kills: '',
    deaths: '',
    assists: '',
    kill_participation: '',
    cs_per_min: '',
    win: '',
    notes: '',
    youtube_url: '',
    game_date: getCurrentPSTDate(),
    game_type: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          ...formData,
          kills: parseInt(formData.kills),
          deaths: parseInt(formData.deaths),
          assists: parseInt(formData.assists),
          kill_participation: parseFloat(formData.kill_participation),
          cs_per_min: parseFloat(formData.cs_per_min),
          win: parseInt(formData.win),
        }),
      });

      console.log('Response status:', response.status, response.ok);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setSuccess(true);
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          router.push('/stats');
        }, 1000);
      } else {
        console.error('Save failed:', { status: response.status, data });
        setError(data.error || 'Failed to save game. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Select Your Role</h1>
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← Back
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {/* Top Lane */}
            <button
              onClick={() => setSelectedRole('top')}
              disabled
              className="aspect-square bg-gray-700 opacity-50 cursor-not-allowed p-6 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <Image src="/roles/top.png" alt="Top" width={64} height={64} className="mb-3 opacity-60" />
              <div className="font-semibold">Top</div>
              <div className="text-xs text-gray-500 mt-2">Coming Soon</div>
            </button>

            {/* Jungle */}
            <button
              onClick={() => setSelectedRole('jungle')}
              disabled
              className="aspect-square bg-gray-700 opacity-50 cursor-not-allowed p-6 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <Image src="/roles/jungle.png" alt="Jungle" width={64} height={64} className="mb-3 opacity-60" />
              <div className="font-semibold">Jungle</div>
              <div className="text-xs text-gray-500 mt-2">Coming Soon</div>
            </button>

            {/* Mid Lane */}
            <button
              onClick={() => setSelectedRole('mid')}
              disabled
              className="aspect-square bg-gray-700 opacity-50 cursor-not-allowed p-6 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <Image src="/roles/mid.png" alt="Mid" width={64} height={64} className="mb-3 opacity-60" />
              <div className="font-semibold">Mid</div>
              <div className="text-xs text-gray-500 mt-2">Coming Soon</div>
            </button>

            {/* ADC */}
            <button
              onClick={() => setSelectedRole('adc')}
              className="aspect-square bg-gray-700 hover:bg-blue-600 p-6 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer"
            >
              <Image src="/roles/adc.png" alt="ADC" width={64} height={64} className="mb-3" />
              <div className="font-semibold">ADC</div>
            </button>

            {/* Support */}
            <button
              onClick={() => setSelectedRole('support')}
              disabled
              className="aspect-square bg-gray-700 opacity-50 cursor-not-allowed p-6 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <Image src="/roles/support.png" alt="Support" width={64} height={64} className="mb-3 opacity-60" />
              <div className="font-semibold">Support</div>
              <div className="text-xs text-gray-500 mt-2">Coming Soon</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ADC</h1>
          <button
            onClick={() => setSelectedRole(null)}
            className="text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            ← Change Role
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
          {/* Game Info Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Game Info</h2>
            <div className="grid md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Game Date</label>
                <input
                  type="date"
                  name="game_date"
                  value={formData.game_date}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Game Type</label>
                <select
                  name="game_type"
                  value={formData.game_type}
                  onChange={handleChange as any}
                  required
                  className="w-full h-10 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="">Select...</option>
                  <option value="solo_queue">Solo Queue</option>
                  <option value="scrim">Scrim</option>
                  <option value="official_match">Official Match</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-400">My Team</h2>
              <div className="space-y-4">
                <ChampionAutocomplete
                  label="ADC"
                  value={formData.my_adc}
                  onChange={(value) => setFormData({ ...formData, my_adc: value })}
                  placeholder="e.g., Jinx"
                  required
                />
                <ChampionAutocomplete
                  label="Support"
                  value={formData.my_support}
                  onChange={(value) => setFormData({ ...formData, my_support: value })}
                  placeholder="e.g., Thresh"
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-red-400">Enemy Team</h2>
              <div className="space-y-4">
                <ChampionAutocomplete
                  label="Enemy ADC"
                  value={formData.enemy_adc}
                  onChange={(value) => setFormData({ ...formData, enemy_adc: value })}
                  placeholder="e.g., Caitlyn"
                  required
                />
                <ChampionAutocomplete
                  label="Enemy Support"
                  value={formData.enemy_support}
                  onChange={(value) => setFormData({ ...formData, enemy_support: value })}
                  placeholder="e.g., Lux"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Performance Stats</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kills</label>
                <input
                  type="number"
                  name="kills"
                  value={formData.kills}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deaths</label>
                <input
                  type="number"
                  name="deaths"
                  value={formData.deaths}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assists</label>
                <input
                  type="number"
                  name="assists"
                  value={formData.assists}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kill Participation (%)</label>
              <input
                type="number"
                name="kill_participation"
                value={formData.kill_participation}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                // placeholder="e.g., 65.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CS per Minute</label>
              <input
                type="number"
                name="cs_per_min"
                value={formData.cs_per_min}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                // placeholder="e.g., 7.5"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Result</label>
              <select
                name="win"
                value={formData.win}
                onChange={handleChange as any}
                required
                className="w-full px-3 py-2 pr-10 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                <option value="1">Win</option>
                <option value="0">Loss</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">YouTube VOD Link (Optional)</label>
            <input
              type="url"
              name="youtube_url"
              value={formData.youtube_url}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes / Improvement Points</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="What did you learn? What can you improve?"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">
              <p className="font-semibold">Success!</p>
              <p className="text-sm">Game saved successfully. Redirecting...</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed cursor-pointer px-6 py-3 rounded font-semibold transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
