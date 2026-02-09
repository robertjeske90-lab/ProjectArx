import { useState } from 'react';

export default function SlideRace({ data, updateData, gameData, parent }) {
  const raceKey = parent === 'father' ? 'fatherRace' : 'motherRace';
  const nameKey = parent === 'father' ? 'fatherName' : 'motherName';
  const selectedRace = data[raceKey];
  
  const title = parent === 'father' 
    ? 'Welcher Rasse war dein Vater?' 
    : 'Welcher Rasse war deine Mutter?';
  
  const races = Object.values(gameData.backgrounds.races);

  const handleSelect = (raceId) => {
    updateData({ [raceKey]: raceId });
  };

  const getBoniPreview = (race) => {
    const preview = [];
    race.boni?.forEach(b => {
      if (b.typ === 'Attribut') {
        const sign = b.wert > 0 ? '+' : '';
        preview.push(`${sign}${Math.round(b.wert * 0.5)} ${b.ziel}`);
      }
      if (b.typ === 'Exp') {
        const sign = b.wert > 0 ? '+' : '';
        preview.push(`${sign}${Math.round(b.wert * 0.5)} EP`);
      }
      if (b.typ === 'ExpMod' && b.wert !== 1.0) {
        preview.push(`EP ×${b.wert}`);
      }
    });
    return preview.join(', ');
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        {title}
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Dein Erbe prägt deine natürlichen Fähigkeiten. 
        <span className="text-arx-purple"> (Boni werden zwischen Eltern geteilt)</span>
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {races.map(race => (
          <button
            key={race.id}
            onClick={() => handleSelect(race.id)}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              selectedRace === race.id
                ? 'bg-arx-purple/30 border-arx-gold'
                : 'bg-arx-dark border-arx-purple/20 hover:border-arx-purple/50'
            }`}
          >
            <div className="text-3xl mb-2">{race.icon}</div>
            <div className="text-white font-semibold text-sm">{race.name}</div>
            <div className="text-gray-500 text-xs mt-1 h-8 overflow-hidden">
              {getBoniPreview(race) || 'Ausgeglichen'}
            </div>
          </button>
        ))}
      </div>

      {selectedRace && (
        <div className="bg-arx-dark rounded-xl p-4 border border-arx-purple/20">
          <label className="block text-gray-300 mb-2 text-sm">
            {parent === 'father' ? 'Name des Vaters' : 'Name der Mutter'}
            <span className="text-gray-500"> (optional, für Backstory)</span>
          </label>
          <input
            type="text"
            value={data[nameKey]}
            onChange={(e) => updateData({ [nameKey]: e.target.value })}
            placeholder={parent === 'father' ? 'Wie hieß dein Vater?' : 'Wie hieß deine Mutter?'}
            maxLength={50}
            className="w-full px-4 py-2 bg-arx-darker border border-arx-purple/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple transition-colors"
          />
        </div>
      )}
    </div>
  );
}
