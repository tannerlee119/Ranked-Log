'use client';

import { useState, useRef, useEffect } from 'react';
import ChampionIcon from './ChampionIcon';

interface ChampionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

// List of all League champions
const CHAMPIONS = [
  'Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Ambessa', 'Amumu', 'Anivia', 'Annie', 'Aphelios', 'Ashe', 'Aurora',
  'Aurelion Sol', 'Azir', 'Bard', "Bel'Veth", 'Blitzcrank', 'Brand', 'Braum', 'Briar', 'Caitlyn',
  'Camille', 'Cassiopeia', "Cho'Gath", 'Corki', 'Darius', 'Diana', 'Dr. Mundo', 'Draven',
  'Ekko', 'Elise', 'Evelynn', 'Ezreal', 'Fiddlesticks', 'Fiora', 'Fizz', 'Galio', 'Gangplank',
  'Garen', 'Gnar', 'Gragas', 'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Hwei', 'Illaoi', 'Irelia',
  'Ivern', 'Janna', 'Jarvan IV', 'Jax', 'Jayce', 'Jhin', 'Jinx', "K'Sante", 'Kaisa', 'Kalista', 'Karma',
  'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kayn', 'Kennen', "Kha'Zix", 'Kindred', 'Kled',
  "Kog'Maw", 'LeBlanc', 'Lee Sin', 'Leona', 'Lillia', 'Lissandra', 'Lucian', 'Lulu', 'Lux',
  'Malphite', 'Malzahar', 'Maokai', 'Master Yi', 'Mel', 'Milio', 'Miss Fortune', 'Mordekaiser', 'Morgana',
  'Naafiri', 'Nami', 'Nasus', 'Nautilus', 'Neeko', 'Nidalee', 'Nilah', 'Nocturne', 'Nunu & Willump',
  'Olaf', 'Orianna', 'Ornn', 'Pantheon', 'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan', 'Rammus',
  "Rek'Sai", 'Rell', 'Renata Glasc', 'Renekton', 'Rengar', 'Riven', 'Rumble', 'Ryze', 'Samira',
  'Sejuani', 'Senna', 'Seraphine', 'Sett', 'Shaco', 'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir',
  'Skarner', 'Smolder', 'Sona', 'Soraka', 'Swain', 'Sylas', 'Syndra', 'Tahm Kench', 'Taliyah', 'Talon',
  'Taric', 'Teemo', 'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'Twisted Fate', 'Twitch',
  'Udyr', 'Urgot', 'Varus', 'Vayne', 'Veigar', "Vel'Koz", 'Vex', 'Vi', 'Viego', 'Viktor',
  'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xayah', 'Xerath', 'Xin Zhao', 'Yasuo', 'Yone',
  'Yorick', 'Yuumi', 'Yunara', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean', 'Zoe', 'Zyra'
];

export default function ChampionAutocomplete({
  value,
  onChange,
  label,
  placeholder,
  required = false,
}: ChampionAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredChampions, setFilteredChampions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);

    if (val.length > 0) {
      // Normalize search (remove apostrophes and special chars)
      const normalizedSearch = val.toLowerCase().replace(/['\s]/g, '');

      const filtered = CHAMPIONS.filter((champ) => {
        const normalizedChamp = champ.toLowerCase().replace(/['\s]/g, '');
        return normalizedChamp.includes(normalizedSearch);
      }).sort((a, b) => {
        // Prioritize champions that start with the search term
        const normalizedA = a.toLowerCase().replace(/['\s]/g, '');
        const normalizedB = b.toLowerCase().replace(/['\s]/g, '');
        const aStarts = normalizedA.startsWith(normalizedSearch);
        const bStarts = normalizedB.startsWith(normalizedSearch);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      }).slice(0, 8); // Show max 8 suggestions

      setFilteredChampions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectChampion = (champion: string) => {
    setInputValue(champion);
    onChange(champion);
    setShowSuggestions(false);
  };

  // Check if input value is a valid champion name (normalize apostrophes and spaces)
  const isValidChampion = CHAMPIONS.some((champ) => {
    const normalizedChamp = champ.toLowerCase().replace(/['\s]/g, '');
    const normalizedInput = inputValue.toLowerCase().replace(/['\s]/g, '');
    return normalizedChamp === normalizedInput || champ.toLowerCase() === inputValue.toLowerCase();
  });

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        {/* Champion Icon Preview - only show if valid champion */}
        {inputValue && isValidChampion && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            <ChampionIcon championName={inputValue} size={28} />
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length > 0) {
              const filtered = CHAMPIONS.filter((champ) =>
                champ.toLowerCase().includes(inputValue.toLowerCase())
              ).slice(0, 8);
              setFilteredChampions(filtered);
              setShowSuggestions(true);
            }
          }}
          required={required}
          className={`w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none ${
            inputValue && isValidChampion ? 'pl-12' : ''
          }`}
          placeholder={placeholder}
          autoComplete="off"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredChampions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {filteredChampions.map((champion) => (
              <button
                key={champion}
                type="button"
                onClick={() => handleSelectChampion(champion)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-600 transition-colors text-left cursor-pointer"
              >
                <ChampionIcon championName={champion} size={32} />
                <span className="text-white">{champion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
