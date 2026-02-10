import { useMemo } from 'react';

export default function SlidePhysical({ data, updateData, gameData }) {
  // Berechne Hybrid-Werte basierend auf beiden Eltern-Rassen
  const physicalBounds = useMemo(() => {
    const fatherRace = gameData.backgrounds.races[data.fatherRace];
    const motherRace = gameData.backgrounds.races[data.motherRace];
    
    const fatherPhys = fatherRace?.physical || { minHeight: 160, maxHeight: 190, bmiMod: 1.0, maxAge: 80 };
    const motherPhys = motherRace?.physical || { minHeight: 160, maxHeight: 190, bmiMod: 1.0, maxAge: 80 };
    
    // Durchschnitt beider Eltern
    return {
      minHeight: Math.round((fatherPhys.minHeight + motherPhys.minHeight) / 2),
      maxHeight: Math.round((fatherPhys.maxHeight + motherPhys.maxHeight) / 2),
      bmiMod: (fatherPhys.bmiMod + motherPhys.bmiMod) / 2,
      maxAge: Math.round((fatherPhys.maxAge + motherPhys.maxAge) / 2),
      // Kombinierte Altersstufen (Durchschnitt)
      ageCategories: mergeAgeCategories(fatherPhys.ageCategories, motherPhys.ageCategories)
    };
  }, [data.fatherRace, data.motherRace, gameData]);

  // Merge Age Categories von beiden Eltern
  function mergeAgeCategories(cat1, cat2) {
    if (!cat1 && !cat2) return getDefaultAgeCategories();
    if (!cat1) return cat2;
    if (!cat2) return cat1;
    
    const merged = {};
    const categories = ['baby', 'kleinkind', 'jugendlicher', 'jungerErwachsener', 'erwachsen', 'alternd', 'alt', 'greis', 'verfallend'];
    
    categories.forEach(cat => {
      const c1 = cat1[cat] || [0, 0];
      const c2 = cat2[cat] || [0, 0];
      merged[cat] = [
        Math.round((c1[0] + c2[0]) / 2),
        Math.round((c1[1] + c2[1]) / 2)
      ];
    });
    
    return merged;
  }

  function getDefaultAgeCategories() {
    return {
      baby: [0, 1], kleinkind: [2, 5], jugendlicher: [6, 15],
      jungerErwachsener: [16, 25], erwachsen: [26, 45], alternd: [46, 60],
      alt: [61, 75], greis: [76, 85], verfallend: [86, 100]
    };
  }

  // Altersstufe basierend auf Alter ermitteln
  const getAgeCategory = (age) => {
    const cats = physicalBounds.ageCategories || getDefaultAgeCategories();
    
    for (const [category, [min, max]] of Object.entries(cats)) {
      if (age >= min && age <= max) {
        return category;
      }
    }
    return 'verfallend';
  };

  // Altersstufe Labels
  const ageCategoryLabels = {
    baby: { label: 'Baby', icon: '👒', color: 'text-pink-300' },
    kleinkind: { label: 'Kleinkind', icon: '💒', color: 'text-pink-400' },
    jugendlicher: { label: 'Jugendlicher', icon: '🧒', color: 'text-blue-400' },
    jungerErwachsener: { label: 'Junger Erwachsener', icon: '✨', color: 'text-emerald-400' },
    erwachsen: { label: 'Erwachsen', icon: '🧑', color: 'text-white' },
    alternd: { label: 'Alternd', icon: '🧓', color: 'text-yellow-400' },
    alt: { label: 'Alt', icon: '👴', color: 'text-orange-400' },
    greis: { label: 'Greis', icon: '🏚', color: 'text-red-400' },
    verfallend: { label: 'Verfallend', icon: '💀', color: 'text-gray-500' }
  };

  // Gewicht berechnen (BMI-basiert)
  const calculateWeight = (heightCm, statureSlider, bmiMod) => {
    const heightM = heightCm / 100;
    // Base BMI 21.5, Slider -1 bis +1 verändert um ±5
    const baseBMI = 21.5 * bmiMod;
    const adjustedBMI = baseBMI + (statureSlider * 5);
    return Math.round(adjustedBMI * heightM * heightM);
  };

  // Statur Labels
  const getStatureLabel = (value) => {
    if (value < -0.6) return 'Dürr';
    if (value < -0.2) return 'Schlank';
    if (value < 0.2) return 'Normal';
    if (value < 0.6) return 'Kräftig';
    return 'Stämmig';
  };

  // Current values (mit Defaults)
  const age = data.age ?? Math.round(physicalBounds.maxAge * 0.2); // Default: 20% des Max-Alters
  const height = data.height ?? Math.round((physicalBounds.minHeight + physicalBounds.maxHeight) / 2);
  const stature = data.stature ?? 0;
  
  const currentAgeCategory = getAgeCategory(age);
  const ageCatInfo = ageCategoryLabels[currentAgeCategory];
  const weight = calculateWeight(height, stature, physicalBounds.bmiMod);
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

  // Beschreibung generieren
  const generateDescription = () => {
    const ageLabel = ageCatInfo.label.toLowerCase();
    const statureLabel = getStatureLabel(stature).toLowerCase();
    
    const fatherRace = gameData.backgrounds.races[data.fatherRace];
    const motherRace = gameData.backgrounds.races[data.motherRace];
    
    let raceStr = '';
    if (fatherRace?.id === motherRace?.id) {
      raceStr = fatherRace?.name || 'Wesen';
    } else {
      raceStr = `Halb-${fatherRace?.name || '?'}`;
    }
    
    return `Ein ${ageLabel} ${raceStr}, ${height}cm groß, von ${statureLabel}er Statur.`;
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Wie sieht dein Held aus?
      </h2>
      <p className="text-gray-400 text-center mb-8 text-sm">
        Körperliche Eigenschaften beeinflussen Gameplay und Rollenspiel.
      </p>

      <div className="space-y-8">
        {/* ALTER */}
        <div className="bg-arx-dark rounded-xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Alter</span>
            <span className="text-arx-gold font-bold text-xl">{age} Jahre</span>
          </div>
          
          <input
            type="range"
            min="0"
            max={physicalBounds.maxAge}
            value={age}
            onChange={(e) => updateData({ age: parseInt(e.target.value) })}
            className="w-full h-3 bg-arx-darker rounded-lg appearance-none cursor-pointer accent-arx-gold"
          />
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-gray-600 text-sm">👒 Baby</span>
            <span className={`font-semibold ${ageCatInfo.color}`}>
              {ageCatInfo.icon} {ageCatInfo.label}
            </span>
            <span className="text-gray-600 text-sm">💀 Verfallend</span>
          </div>
          
          {/* Altersstufen-Warnung */}
          {(currentAgeCategory === 'baby' || currentAgeCategory === 'kleinkind') && (
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-xs">
              ⚠️ Kinder können eingeschränkte Fähigkeiten haben
            </div>
          )}
          {(currentAgeCategory === 'greis' || currentAgeCategory === 'verfallend') && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              ⚠️ Hohes Alter kann Mali auf körperliche Attribute verursachen
            </div>
          )}
        </div>

        {/* GRÖSSE */}
        <div className="bg-arx-dark rounded-xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Größe</span>
            <span className="text-arx-gold font-bold text-xl">{height} cm</span>
          </div>
          
          <input
            type="range"
            min={physicalBounds.minHeight}
            max={physicalBounds.maxHeight}
            value={height}
            onChange={(e) => updateData({ height: parseInt(e.target.value) })}
            className="w-full h-3 bg-arx-darker rounded-lg appearance-none cursor-pointer accent-arx-gold"
          />
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600 text-sm">{physicalBounds.minHeight} cm</span>
            <span className="text-gray-600 text-sm">{physicalBounds.maxHeight} cm</span>
          </div>
        </div>

        {/* STATUR / GEWICHT */}
        <div className="bg-arx-dark rounded-xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Statur</span>
            <span className="text-arx-gold font-bold">{getStatureLabel(stature)}</span>
          </div>
          
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={stature}
            onChange={(e) => updateData({ stature: parseFloat(e.target.value) })}
            className="w-full h-3 bg-arx-darker rounded-lg appearance-none cursor-pointer accent-arx-gold"
          />
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600 text-sm">🦴 Dürr</span>
            <span className="text-gray-600 text-sm">🐻 Stämmig</span>
          </div>
          
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Gewicht</div>
              <div className="text-white font-bold">{weight} kg</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">BMI</div>
              <div className={`font-bold ${bmi < 18.5 ? 'text-yellow-400' : bmi > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                {bmi}
              </div>
            </div>
          </div>
        </div>

        {/* VORSCHAU */}
        <div className="bg-arx-purple/10 border border-arx-purple/30 rounded-xl p-4 text-center">
          <span className="text-gray-400 text-sm">Vorschau:</span>
          <p className="text-white mt-1 italic">"{generateDescription()}"</p>
        </div>
      </div>
    </div>
  );
}
