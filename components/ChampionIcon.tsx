'use client';

import { useState } from 'react';

interface ChampionIconProps {
  championName: string;
  size?: number;
  className?: string;
}

export default function ChampionIcon({ championName, size = 40, className = '' }: ChampionIconProps) {
  const [imgError, setImgError] = useState(false);

  // Format champion name for Data Dragon URL
  const formatChampionName = (name: string) => {
    // Handle special cases for Data Dragon
    const specialCases: { [key: string]: string } = {
      'aurelion sol': 'AurelionSol',
      'dr mundo': 'DrMundo',
      'dr. mundo': 'DrMundo',
      'jarvan iv': 'JarvanIV',
      "kha'zix": 'Khazix',
      'kha zix': 'Khazix',
      'lee sin': 'LeeSin',
      'master yi': 'MasterYi',
      'miss fortune': 'MissFortune',
      "rek'sai": 'RekSai',
      'rek sai': 'RekSai',
      'tahm kench': 'TahmKench',
      'twisted fate': 'TwistedFate',
      'xin zhao': 'XinZhao',
      "bel'veth": 'Belveth',
      'bel veth': 'Belveth',
      "kog'maw": 'KogMaw',
      'kog maw': 'KogMaw',
      "vel'koz": 'Velkoz',
      'vel koz': 'Velkoz',
      "cho'gath": 'Chogath',
      'cho gath': 'Chogath',
      "kai'sa": 'Kaisa',
      'kai sa': 'Kaisa',
      'kaisa': 'Kaisa',
      'renata glasc': 'Renata',
      'nunu & willump': 'Nunu',
      'wukong': 'MonkeyKing',
    };

    const lowerName = name.toLowerCase().trim();

    if (specialCases[lowerName]) {
      return specialCases[lowerName];
    }

    // Remove spaces and apostrophes, capitalize first letter
    const cleaned = name.replace(/[\s']/g, '');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const formattedName = formatChampionName(championName);
  // Using Data Dragon (Riot's official CDN) - latest version
  const imageUrl = `https://ddragon.leagueoflegends.com/cdn/15.19.1/img/champion/${formattedName}.png`;

  if (imgError) {
    // Fallback: show first letter in a circle
    return (
      <div
        className={`flex items-center justify-center bg-gray-700 rounded ${className}`}
        style={{ width: size, height: size }}
        title={championName}
      >
        <span className="text-white font-bold" style={{ fontSize: size / 2.5 }}>
          {championName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={championName}
        width={size}
        height={size}
        className="rounded"
        onError={() => setImgError(true)}
        title={championName}
      />
    </div>
  );
}
