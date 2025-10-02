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
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/stats');
      } else {
        alert('Failed to save game');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
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
          <h1 className="text-3xl font-bold">Log a Game - ADC</h1>
          <button
            onClick={() => setSelectedRole(null)}
            className="text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            ← Change Role
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-400">My Team</h2>
              <div className="space-y-4">
                <ChampionAutocomplete
                  label="My ADC"
                  value={formData.my_adc}
                  onChange={(value) => setFormData({ ...formData, my_adc: value })}
                  placeholder="e.g., Jinx"
                  required
                />
                <ChampionAutocomplete
                  label="My Support"
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

          <div className="grid md:grid-cols-2 gap-4">
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
