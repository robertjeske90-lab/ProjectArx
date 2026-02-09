import { useState, useEffect } from 'react';
import { useCharacters } from '../hooks/useCharacters';

// Vollständige Charakteransicht - auch für fremde Charaktere (SL)
export default function CharacterSheet({ characterId, onClose }) {
  const { getCharacter } = useCharacters();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChar = async () => {
      try {
        const char = await getCharacter(characterId);
        setCharacter(char);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (characterId) {
      fetchChar();
    }
  }, [characterId]);

  // Attribute labels
  const attributeLabels = {
    strength: { name: 'Stärke', abbr: 'STR', color: 'text-red-400' },
    dexterity: { name: 'Geschick', abbr: 'DEX', color: 'text-green-400' },
    intelligence: { name: 'Intelligenz', abbr: 'INT', color: 'text-blue-400' },
    constitution: { name: 'Konstitution', abbr: 'CON', color: 'text-orange-400' },
    wisdom: { name: 'Weisheit', abbr: 'WIS', color: 'text-purple-400' },
    charisma: { name: 'Charisma', abbr: 'CHA', color: 'text-pink-400' }
  };

  // Skill labels
  const skillLabels = {
    combat: { name: 'Kampf', icon: '⚔️' },
    magic: { name: 'Magie', icon: '✨' },
    social: { name: 'Sozial', icon: '💬' },
    crafting: { name: 'Handwerk', icon: '🔨' }
  };

  const getSkillLevel = (val) => {
    if (val === 0) return 'Untrainiert';
    if (val < 20) return 'Anfänger';
    if (val < 40) return 'Lehrling';
    if (val < 60) return 'Geselle';
    if (val < 80) return 'Experte';
    if (val < 100) return 'Meister';
    return 'Großmeister';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-arx-dark rounded-xl p-8">
          <div className="w-12 h-12 border-4 border-arx-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-arx-dark border border-red-500/30 rounded-xl p-8 max-w-md">
          <p className="text-red-400 mb-4">{error || 'Charakter nicht gefunden'}</p>
          <button onClick={onClose} className="px-4 py-2 bg-arx-purple text-white rounded-lg">
            Schließen
          </button>
        </div>
      </div>
    );
  }

  const totalAttributes = Object.values(character.attributes || {}).reduce((a, b) => a + b, 0);
  const totalSkills = Object.values(character.skills || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-arx-dark border border-arx-purple/30 rounded-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-arx-purple/20 flex items-start gap-6">
          {/* Portrait */}
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-arx-darker flex-shrink-0">
            {character.portraitURL ? (
              <img 
                src={character.portraitURL} 
                alt={character.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-arx-gold font-medieval">
                  {character.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h2 className="font-medieval text-3xl text-arx-gold mb-2">{character.name}</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="text-center px-4 py-2 bg-arx-darker rounded-lg">
                <div className="text-xl font-bold text-arx-purple">{totalAttributes}</div>
                <div className="text-xs text-gray-500">Attribut-Punkte</div>
              </div>
              <div className="text-center px-4 py-2 bg-arx-darker rounded-lg">
                <div className="text-xl font-bold text-emerald-500">{totalSkills}</div>
                <div className="text-xs text-gray-500">Skill-Punkte</div>
              </div>
            </div>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Attributes */}
          <div>
            <h3 className="font-medieval text-xl text-arx-purple mb-4">Attribute</h3>
            <div className="space-y-3">
              {Object.entries(character.attributes || {}).map(([key, value]) => {
                const attr = attributeLabels[key];
                const percentage = ((value - 1) / 19) * 100;
                
                return (
                  <div key={key} className="bg-arx-darker rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">
                        <span className={`font-mono mr-2 ${attr?.color || 'text-gray-400'}`}>
                          {attr?.abbr || key.toUpperCase()}
                        </span>
                        {attr?.name || key}
                      </span>
                      <span className="text-arx-gold font-bold text-lg">{value}</span>
                    </div>
                    <div className="h-2 bg-arx-dark rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-arx-purple to-arx-gold rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-medieval text-xl text-emerald-500 mb-4">Skills</h3>
            <div className="space-y-3">
              {Object.entries(character.skills || {}).map(([key, value]) => {
                const skill = skillLabels[key];
                
                return (
                  <div key={key} className="bg-arx-darker rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">
                        <span className="mr-2">{skill?.icon || '📊'}</span>
                        {skill?.name || key}
                      </span>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold text-lg">{value}</span>
                        <span className="text-gray-500 text-sm ml-2">({getSkillLevel(value)})</span>
                      </div>
                    </div>
                    <div className="h-2 bg-arx-dark rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-arx-purple/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
