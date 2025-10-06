'use client';

import { useState, useRef, useEffect } from 'react';
import ChampionIcon from './ChampionIcon';

interface ChampionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
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
  'Ivern', 'Janna', 'Jarvan IV', 'Jax', 'Jayce', 'Jhin', 'Jinx', "K'Sante", "Kai'Sa", 'Kalista', 'Karma',
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
  onSelect,
  label,
  placeholder,
  required = false,
}: ChampionAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredChampions, setFilteredChampions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isChampionSelected, setIsChampionSelected] = useState(false);
  const [showError, setShowError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setInputValue(value);
    // Only update selection state if value is empty (clearing) or if it's externally set
    if (value === '') {
      setIsChampionSelected(false);
    }
  }, [value]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        // Show error if field has text but no valid champion selected
        if (inputValue && !isChampionSelected && required) {
          setShowError(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, isChampionSelected, required]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsChampionSelected(false); // Reset when user types
    setShowError(false); // Clear error when user types

    if (val.length > 0) {
      // Normalize search (remove apostrophes and special chars)
      const normalizedSearch = val.toLowerCase().replace(/['\s]/g, '');

      // Champion abbreviations
      const abbreviations: { [key: string]: string } = {
        'mf': 'Miss Fortune',
        'tf': 'Twisted Fate',
        'j4': 'Jarvan IV',
      };

      const filtered = CHAMPIONS.filter((champ) => {
        const normalizedChamp = champ.toLowerCase().replace(/['\s]/g, '');
        // Check if search matches abbreviation
        if (abbreviations[normalizedSearch] && champ === abbreviations[normalizedSearch]) {
          return true;
        }
        return normalizedChamp.includes(normalizedSearch);
      }).sort((a, b) => {
        // Prioritize exact abbreviation matches first
        const isAAbbrev = abbreviations[normalizedSearch] === a;
        const isBAbbrev = abbreviations[normalizedSearch] === b;
        if (isAAbbrev && !isBAbbrev) return -1;
        if (!isAAbbrev && isBAbbrev) return 1;

        // Then prioritize champions that start with the search term
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
      setSelectedIndex(-1); // Reset selection when typing
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectChampion = (champion: string) => {
    setInputValue(champion);
    onChange(champion);
    setIsChampionSelected(true);
    setShowError(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onSelect) {
      onSelect(champion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredChampions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const newIndex = prev < filteredChampions.length - 1 ? prev + 1 : prev;
        // Scroll into view
        setTimeout(() => {
          if (selectedItemRef.current && dropdownRef.current) {
            selectedItemRef.current.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth'
            });
          }
        }, 0);
        return newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const newIndex = prev > 0 ? prev - 1 : 0;
        // Scroll into view
        setTimeout(() => {
          if (selectedItemRef.current && dropdownRef.current) {
            selectedItemRef.current.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth'
            });
          }
        }, 0);
        return newIndex;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSelectChampion(filteredChampions[selectedIndex]);
      } else if (filteredChampions.length > 0) {
        handleSelectChampion(filteredChampions[0]);
      }
    } else if (e.key === 'Tab' && filteredChampions.length > 0) {
      e.preventDefault();
      handleSelectChampion(filteredChampions[0]);
    }
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
        {/* Champion Icon Preview - only show if champion was explicitly selected */}
        {inputValue && isChampionSelected && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            <ChampionIcon championName={inputValue} size={28} />
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length > 0) {
              const normalizedSearch = inputValue.toLowerCase().replace(/['\s]/g, '');

              const abbreviations: { [key: string]: string } = {
                'mf': 'Miss Fortune',
                'tf': 'Twisted Fate',
                'j4': 'Jarvan IV',
              };

              const filtered = CHAMPIONS.filter((champ) => {
                const normalizedChamp = champ.toLowerCase().replace(/['\s]/g, '');
                if (abbreviations[normalizedSearch] && champ === abbreviations[normalizedSearch]) {
                  return true;
                }
                return normalizedChamp.includes(normalizedSearch);
              }).sort((a, b) => {
                const isAAbbrev = abbreviations[normalizedSearch] === a;
                const isBAbbrev = abbreviations[normalizedSearch] === b;
                if (isAAbbrev && !isBAbbrev) return -1;
                if (!isAAbbrev && isBAbbrev) return 1;

                const normalizedA = a.toLowerCase().replace(/['\s]/g, '');
                const normalizedB = b.toLowerCase().replace(/['\s]/g, '');
                const aStarts = normalizedA.startsWith(normalizedSearch);
                const bStarts = normalizedB.startsWith(normalizedSearch);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return a.localeCompare(b);
              }).slice(0, 8);
              setFilteredChampions(filtered);
              setShowSuggestions(true);
            }
          }}
          required={required}
          onInvalid={(e) => {
            if (!isChampionSelected) {
              e.preventDefault();
              setShowError(true);
              (e.target as HTMLInputElement).setCustomValidity('Please select a valid champion from the list');
            }
          }}
          onInput={(e) => {
            (e.target as HTMLInputElement).setCustomValidity('');
          }}
          onBlur={() => {
            if (inputValue && !isChampionSelected && required) {
              setShowError(true);
            }
          }}
          className={`w-full px-3 py-2 bg-gray-700 rounded border ${
            showError ? 'border-red-500' : 'border-gray-600'
          } focus:border-blue-500 focus:outline-none ${
            inputValue && isChampionSelected ? 'pl-12' : ''
          }`}
          placeholder={placeholder}
          autoComplete="off"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredChampions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {filteredChampions.map((champion, index) => (
              <button
                key={champion}
                ref={index === selectedIndex ? selectedItemRef : null}
                type="button"
                onClick={() => handleSelectChampion(champion)}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-600 transition-colors text-left cursor-pointer ${
                  index === selectedIndex ? 'bg-gray-600' : ''
                }`}
              >
                <ChampionIcon championName={champion} size={32} />
                <span className="text-white">{champion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <p className="text-red-500 text-sm mt-1">
            Please select a valid champion from the list
          </p>
        )}
      </div>
    </div>
  );
}
