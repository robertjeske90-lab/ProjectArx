import { useState } from 'react';

// Vordefinierte Optionen
const COSMETIC_OPTIONS = {
  titles: [
    { id: 'none', label: 'Kein Titel' },
    { id: 'sir', label: 'Sir' },
    { id: 'lady', label: 'Lady' },
    { id: 'lord', label: 'Lord' },
    { id: 'freiherr', label: 'Freiherr' },
    { id: 'graf', label: 'Graf' },
    { id: 'baron', label: 'Baron' },
    { id: 'ritter', label: 'Ritter' },
    { id: 'meister', label: 'Meister' },
    { id: 'magister', label: 'Magister' },
    { id: 'elder', label: 'Ältester' },
    { id: 'custom', label: '✏️ Eigener...' }
  ],
  
  hairColors: [
    { id: 'black', label: 'Schwarz', color: '#1C1C1C' },
    { id: 'brown', label: 'Braun', color: '#4A3728' },
    { id: 'lightbrown', label: 'Hellbraun', color: '#8B7355' },
    { id: 'blonde', label: 'Blond', color: '#D4A76A' },
    { id: 'lightblonde', label: 'Hellblond', color: '#F4E3C1' },
    { id: 'red', label: 'Rot', color: '#8B2500' },
    { id: 'copper', label: 'Kupfer', color: '#B87333' },
    { id: 'gray', label: 'Grau', color: '#808080' },
    { id: 'white', label: 'Weiß', color: '#F5F5F5' },
    { id: 'blue', label: 'Blau', color: '#1E88E5' },
    { id: 'green', label: 'Grün', color: '#43A047' },
    { id: 'purple', label: 'Lila', color: '#8E24AA' },
    { id: 'pink', label: 'Pink', color: '#E91E63' },
    { id: 'silver', label: 'Silber', color: '#C0C0C0' }
  ],
  
  eyeColors: [
    { id: 'brown', label: 'Braun', color: '#5D4037' },
    { id: 'lightbrown', label: 'Hellbraun', color: '#8D6E63' },
    { id: 'blue', label: 'Blau', color: '#1E88E5' },
    { id: 'lightblue', label: 'Hellblau', color: '#64B5F6' },
    { id: 'green', label: 'Grün', color: '#43A047' },
    { id: 'gray', label: 'Grau', color: '#757575' },
    { id: 'amber', label: 'Bernstein', color: '#FFB300' },
    { id: 'hazel', label: 'Haselnuss', color: '#7C5C3E' },
    { id: 'red', label: 'Rot', color: '#E53935' },
    { id: 'purple', label: 'Lila', color: '#8E24AA' },
    { id: 'golden', label: 'Gold', color: '#FFD700' },
    { id: 'silver', label: 'Silber', color: '#C0C0C0' },
    { id: 'black', label: 'Schwarz', color: '#1C1C1C' },
    { id: 'white', label: 'Weiß (blind)', color: '#F5F5F5' }
  ],
  
  skinFeatures: [
    { id: 'none', label: 'Keine Besonderheiten' },
    { id: 'freckles', label: 'Sommersprossen' },
    { id: 'scar_face', label: 'Narbe im Gesicht' },
    { id: 'scar_eye', label: 'Narbe über Auge' },
    { id: 'burn', label: 'Brandnarbe' },
    { id: 'tattoo_face', label: 'Gesichtstattoo' },
    { id: 'tattoo_tribal', label: 'Stammestattoo' },
    { id: 'birthmark', label: 'Muttermal' },
    { id: 'pox', label: 'Pockennarben' },
    { id: 'wrinkles', label: 'Tiefe Falten' },
    { id: 'scales', label: 'Schuppen' },
    { id: 'fur_patches', label: 'Fellflecken' }
  ],
  
  distinctiveFeatures: [
    { id: 'none', label: 'Keine' },
    { id: 'eyepatch', label: 'Augenklappe' },
    { id: 'monocle', label: 'Monokel' },
    { id: 'glasses', label: 'Brille' },
    { id: 'missing_ear', label: 'Fehlendes Ohr' },
    { id: 'missing_eye', label: 'Fehlendes Auge' },
    { id: 'gold_tooth', label: 'Goldzahn' },
    { id: 'missing_teeth', label: 'Fehlende Zähne' },
    { id: 'piercing', label: 'Piercings' },
    { id: 'horn_broken', label: 'Abgebrochenes Horn' },
    { id: 'prosthetic_arm', label: 'Armprothese' },
    { id: 'prosthetic_leg', label: 'Beinprothese' },
    { id: 'limp', label: 'Hinken' },
    { id: 'hunchback', label: 'Buckel' }
  ]
};

export default function SlideCosmetics({ data, updateData }) {
  const [customTitle, setCustomTitle] = useState('');
  
  const cosmetics = data.cosmetics || {
    title: 'none',
    customTitle: '',
    hairColor: 'brown',
    eyeColor: 'brown',
    skinFeatures: [],
    distinctiveFeatures: [],
    notes: ''
  };
  
  const updateCosmetics = (field, value) => {
    updateData({
      cosmetics: {
        ...cosmetics,
        [field]: value
      }
    });
  };
  
  const toggleArrayItem = (field, itemId) => {
    const current = cosmetics[field] || [];
    const updated = current.includes(itemId)
      ? current.filter(id => id !== itemId)
      : [...current, itemId];
    updateCosmetics(field, updated);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Besondere Merkmale
      </h2>
      <p className="text-gray-400 text-center mb-8 text-sm">
        Details die deinen Charakter einzigartig machen.
      </p>

      <div className="space-y-6 max-w-2xl mx-auto">
        
        {/* TITEL */}
        <div className="bg-arx-dark rounded-xl p-4">
          <label className="text-gray-300 font-medium mb-3 block">
            👑 Titel / Anrede
          </label>
          <div className="flex flex-wrap gap-2">
            {COSMETIC_OPTIONS.titles.map(title => (
              <button
                key={title.id}
                onClick={() => updateCosmetics('title', title.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  cosmetics.title === title.id
                    ? 'bg-arx-gold text-arx-darker font-bold'
                    : 'bg-arx-darker text-gray-300 hover:bg-arx-purple/30'
                }`}
              >
                {title.label}
              </button>
            ))}
          </div>
          {cosmetics.title === 'custom' && (
            <input
              type="text"
              value={cosmetics.customTitle || ''}
              onChange={(e) => updateCosmetics('customTitle', e.target.value)}
              placeholder="Eigenen Titel eingeben..."
              className="mt-3 w-full px-4 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white focus:border-arx-gold focus:outline-none"
            />
          )}
        </div>

        {/* HAARFARBE */}
        <div className="bg-arx-dark rounded-xl p-4">
          <label className="text-gray-300 font-medium mb-3 block">
            💇 Haarfarbe
          </label>
          <div className="flex flex-wrap gap-2">
            {COSMETIC_OPTIONS.hairColors.map(color => (
              <button
                key={color.id}
                onClick={() => updateCosmetics('hairColor', color.id)}
                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                  cosmetics.hairColor === color.id
                    ? 'border-arx-gold scale-110 ring-2 ring-arx-gold/50'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.color }}
                title={color.label}
              >
                {cosmetics.hairColor === color.id && (
                  <span className="text-white text-shadow">✓</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Gewählt: {COSMETIC_OPTIONS.hairColors.find(c => c.id === cosmetics.hairColor)?.label || 'Keine'}
          </p>
        </div>

        {/* AUGENFARBE */}
        <div className="bg-arx-dark rounded-xl p-4">
          <label className="text-gray-300 font-medium mb-3 block">
            👁️ Augenfarbe
          </label>
          <div className="flex flex-wrap gap-2">
            {COSMETIC_OPTIONS.eyeColors.map(color => (
              <button
                key={color.id}
                onClick={() => updateCosmetics('eyeColor', color.id)}
                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                  cosmetics.eyeColor === color.id
                    ? 'border-arx-gold scale-110 ring-2 ring-arx-gold/50'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.color }}
                title={color.label}
              >
                {cosmetics.eyeColor === color.id && (
                  <span className="text-white text-shadow">✓</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Gewählt: {COSMETIC_OPTIONS.eyeColors.find(c => c.id === cosmetics.eyeColor)?.label || 'Keine'}
          </p>
        </div>

        {/* HAUT-MERKMALE */}
        <div className="bg-arx-dark rounded-xl p-4">
          <label className="text-gray-300 font-medium mb-3 block">
            ✨ Hautmerkmale
          </label>
          <div className="flex flex-wrap gap-2">
            {COSMETIC_OPTIONS.skinFeatures.map(feature => (
              <button
                key={feature.id}
                onClick={() => {
                  if (feature.id === 'none') {
                    updateCosmetics('skinFeatures', []);
                  } else {
                    toggleArrayItem('skinFeatures', feature.id);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  feature.id === 'none' 
                    ? (cosmetics.skinFeatures?.length === 0 
                        ? 'bg-arx-gold text-arx-darker font-bold' 
                        : 'bg-arx-darker text-gray-300 hover:bg-arx-purple/30')
                    : (cosmetics.skinFeatures?.includes(feature.id)
                        ? 'bg-arx-purple text-white'
                        : 'bg-arx-darker text-gray-300 hover:bg-arx-purple/30')
                }`}
              >
                {feature.label}
              </button>
            ))}
          </div>
        </div>

        {/* BESONDERE MERKMALE */}
        <div className="bg-arx-dark rounded-xl p-4">
          <label className="text-gray-300 font-medium mb-3 block">
            🎭 Besondere Merkmale
          </label>
          <div className="flex flex-wrap gap-2">
            {COSMETIC_OPTIONS.distinctiveFeatures.map(feature => (
              <button
                key={feature.id}
                onClick={() => {
                  if (feature.id === 'none') {
                    updateCosmetics('distinctiveFeatures', []);
                  } else {
                    toggleArrayItem('distinctiveFeatures', feature.id);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  feature.id === 'none' 
                    ? (cosmetics.distinctiveFeatures?.length === 0 
                        ? 'bg-arx-gold text-arx-darker font-bold' 
                        : 'bg-arx-darker text-gray-300 hover:bg-arx-purple/30')
                    : (cosmetics.distinctiveFeatures?.includes(feature.id)
                        ? 'bg-arx-purple text-white'
                        : 'bg-arx-darker text-gray-300 hover:bg-arx-purple/30')
                }`}
              >
                {feature.label}
              </button>
            ))}
          </div>
        </div>

        {/* NOTIZEN */}
        <div className="bg-arx-dark rounded-xl p-4">
          <label className="text-gray-300 font-medium mb-3 block">
            📝 Weitere Beschreibung (optional)
          </label>
          <textarea
            value={cosmetics.notes || ''}
            onChange={(e) => updateCosmetics('notes', e.target.value)}
            placeholder="Markante Stimme, besonderer Gang, Geruch nach Kräutern..."
            rows={3}
            className="w-full px-4 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:border-arx-gold focus:outline-none resize-none"
          />
        </div>

        {/* VORSCHAU */}
        <div className="bg-arx-purple/10 border border-arx-purple/30 rounded-xl p-4 text-center">
          <span className="text-gray-400 text-sm">Vorschau:</span>
          <p className="text-white mt-2 italic">
            "{generateDescription(cosmetics, data)}"
          </p>
        </div>
      </div>
    </div>
  );
}

// Beschreibung generieren
function generateDescription(cosmetics, data) {
  const parts = [];
  
  // Titel
  if (cosmetics.title && cosmetics.title !== 'none') {
    const titleLabel = cosmetics.title === 'custom' 
      ? cosmetics.customTitle 
      : COSMETIC_OPTIONS.titles.find(t => t.id === cosmetics.title)?.label;
    if (titleLabel) parts.push(titleLabel);
  }
  
  // Haar
  const hairColor = COSMETIC_OPTIONS.hairColors.find(c => c.id === cosmetics.hairColor);
  if (hairColor) {
    parts.push(`${hairColor.label.toLowerCase()}es Haar`);
  }
  
  // Augen
  const eyeColor = COSMETIC_OPTIONS.eyeColors.find(c => c.id === cosmetics.eyeColor);
  if (eyeColor) {
    parts.push(`${eyeColor.label.toLowerCase()}e Augen`);
  }
  
  // Merkmale
  const features = [
    ...(cosmetics.skinFeatures || []),
    ...(cosmetics.distinctiveFeatures || [])
  ].filter(f => f !== 'none');
  
  if (features.length > 0) {
    const featureLabels = features.map(f => {
      const skin = COSMETIC_OPTIONS.skinFeatures.find(s => s.id === f);
      const dist = COSMETIC_OPTIONS.distinctiveFeatures.find(d => d.id === f);
      return skin?.label || dist?.label || f;
    });
    
    if (featureLabels.length === 1) {
      parts.push(featureLabels[0]);
    } else if (featureLabels.length > 1) {
      parts.push(featureLabels.slice(0, -1).join(', ') + ' und ' + featureLabels.slice(-1));
    }
  }
  
  if (parts.length === 0) {
    return "Ein gewöhnliches Aussehen ohne besondere Merkmale.";
  }
  
  return parts.join(', ') + '.';
}

// Export options for use elsewhere
export { COSMETIC_OPTIONS };
