import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import gameData from '../data/gameData.json';

// Konstanten für Attribut-Gruppierung
const CORE_ATTRIBUTES = ['koerper', 'geschick', 'konstitution', 'geist', 'wahrnehmung', 'psyche', 'charisma', 'intuition', 'fassade'];
const MAGIC_ATTRIBUTES = ['elementar', 'hitze', 'fluss', 'materie', 'strom', 'mental', 'entropie', 'arkan', 'illusion', 'beherrschung', 'anrufung', 'leben', 'segen', 'erkenntnis', 'rufen'];

export default function CharacterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCharacter, deleteCharacter, spendExperience } = useCharacters();
  
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // View Mode: 'simple' | 'complex' | 'edit'
  const [viewMode, setViewMode] = useState('simple');

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const char = await getCharacter(id);
        setCharacter(char);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id, getCharacter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCharacter(id);
      navigate('/characters');
    } catch (err) {
      setError('Fehler beim Löschen: ' + err.message);
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const handleLevelUp = async (skillKey) => {
    const skill = gameData.skills[skillKey];
    const currentLevel = character.skills?.[skillKey] || 0;
    const cost = (currentLevel + 1) * (skill?.expMod || 10);
    
    try {
      await spendExperience(id, skillKey, cost);
      // Refresh character
      const updated = await getCharacter(id);
      setCharacter(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  // Berechne EP-Kosten für nächstes Level
  const getUpgradeCost = (skillKey) => {
    const skill = gameData.skills[skillKey];
    const currentLevel = character?.skills?.[skillKey] || 0;
    return (currentLevel + 1) * (skill?.expMod || 10);
  };

  // Kann Skill gesteigert werden?
  const canUpgrade = (skillKey) => {
    const skill = gameData.skills[skillKey];
    const currentLevel = character?.skills?.[skillKey] || 0;
    const maxLevel = skill?.maxLevel || 10;
    const cost = getUpgradeCost(skillKey);
    const available = character?.experience?.available || 0;
    
    // Check parent requirement
    if (skill?.parent) {
      const parentKey = Object.keys(gameData.skills).find(k => 
        gameData.skills[k].name === skill.parent
      );
      if (parentKey) {
        const parentLevel = character?.skills?.[parentKey] || 0;
        const parentSkill = gameData.skills[parentKey];
        if (parentLevel < (parentSkill?.unlocksAt || 5)) {
          return false;
        }
      }
    }
    
    return currentLevel < maxLevel && available >= cost;
  };

  // Ist Skill verfügbar (unlocked)?
  const isSkillUnlocked = (skillKey) => {
    const skill = gameData.skills[skillKey];
    if (!skill?.parent) return true; // Tier 1 immer verfügbar
    
    const parentKey = Object.keys(gameData.skills).find(k => 
      gameData.skills[k].name === skill.parent
    );
    if (!parentKey) return true;
    
    const parentLevel = character?.skills?.[parentKey] || 0;
    const parentSkill = gameData.skills[parentKey];
    return parentLevel >= (parentSkill?.unlocksAt || 5);
  };

  // Filtere Skills basierend auf View Mode
  const getVisibleSkills = (bereich) => {
    const allSkills = Object.entries(gameData.skills)
      .filter(([_, skill]) => skill.bereich === bereich)
      .sort((a, b) => (a[1].tier || 0) - (b[1].tier || 0));
    
    if (viewMode === 'complex') {
      return allSkills;
    }
    
    // Simple/Edit: Nur Skills die man hat ODER deren Parent man hat
    return allSkills.filter(([key, skill]) => {
      const hasSkill = (character?.skills?.[key] || 0) > 0;
      if (hasSkill) return true;
      
      // Oder ist ein direktes Followup eines Skills den man hat
      if (skill.parent) {
        const parentKey = Object.keys(gameData.skills).find(k => 
          gameData.skills[k].name === skill.parent
        );
        if (parentKey && (character?.skills?.[parentKey] || 0) > 0) {
          return true;
        }
      }
      
      // Tier 1 immer zeigen
      if (skill.tier === 1) return true;
      
      return false;
    });
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unbekannt';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get race display
  const getRaceDisplay = () => {
    const bg = character?.backgrounds;
    if (!bg) return null;
    
    const fatherRace = gameData.backgrounds.races[bg.fatherRace];
    const motherRace = gameData.backgrounds.races[bg.motherRace];
    
    if (fatherRace?.id === motherRace?.id) {
      return `${fatherRace?.icon || ''} ${fatherRace?.name || '?'}`;
    }
    return `${fatherRace?.icon || ''} ${fatherRace?.name || '?'} / ${motherRace?.icon || ''} ${motherRace?.name || '?'}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-arx-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Lade Charakter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">{error || 'Charakter nicht gefunden'}</p>
          <Link to="/characters" className="inline-block px-6 py-2 bg-arx-purple text-white rounded-lg">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  const exp = character.experience || { available: 0, total: 0, spent: 0, modifier: 1.0 };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/characters" className="inline-flex items-center gap-2 text-gray-400 hover:text-arx-gold transition-colors mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Zurück
      </Link>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('simple')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'simple' 
              ? 'bg-arx-purple text-white' 
              : 'bg-arx-dark text-gray-400 hover:text-white'
          }`}
        >
          🎮 Einfach
        </button>
        <button
          onClick={() => setViewMode('complex')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'complex' 
              ? 'bg-arx-purple text-white' 
              : 'bg-arx-dark text-gray-400 hover:text-white'
          }`}
        >
          📊 Komplex
        </button>
        <button
          onClick={() => setViewMode('edit')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'edit' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-arx-dark text-gray-400 hover:text-white'
          }`}
        >
          ✏️ Bearbeiten
        </button>
      </div>

      {/* Character Header */}
      <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Portrait */}
          <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-arx-darker">
            {character.portraitURL ? (
              <img src={character.portraitURL} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-arx-gold font-medieval">
                  {character.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h1 className="font-medieval text-3xl text-arx-gold">{character.name}</h1>
            {character.alias && <p className="text-gray-500 italic">"{character.alias}"</p>}
            {getRaceDisplay() && <p className="text-gray-400 mt-1">{getRaceDisplay()}</p>}
            <p className="text-gray-600 text-sm mt-2">Erstellt: {formatDate(character.createdAt)}</p>
          </div>
          
          {/* EP Display */}
          <div className="bg-arx-darker rounded-xl p-4 text-center min-w-[140px]">
            <div className="text-3xl font-bold text-emerald-400">{exp.available}</div>
            <div className="text-gray-500 text-sm">EP verfügbar</div>
            <div className="text-gray-600 text-xs mt-2">
              Gesamt: {exp.total} | Mod: ×{exp.modifier}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Attributes */}
        <div className="space-y-6">
          {/* Core Attributes */}
          <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-4">
            <h2 className="font-medieval text-lg text-arx-purple mb-4">Core Attribute</h2>
            <div className="grid grid-cols-3 gap-2">
              {CORE_ATTRIBUTES.map(key => {
                const attr = gameData.attributes[key];
                const value = character.attributes?.[key] ?? attr?.baseValue ?? 10;
                const diff = value - (attr?.baseValue || 10);
                return (
                  <div key={key} className="bg-arx-darker rounded-lg p-2 text-center">
                    <div className="text-gray-500 text-xs uppercase truncate">{attr?.name?.substring(0, 3) || key.substring(0, 3)}</div>
                    <div className={`text-xl font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-white'}`}>
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Magic Attributes (wenn vorhanden) */}
          {viewMode === 'complex' && (
            <div className="bg-arx-dark border border-purple-500/30 rounded-xl p-4">
              <h2 className="font-medieval text-lg text-purple-400 mb-4">🔮 Magie</h2>
              <div className="grid grid-cols-3 gap-2">
                {MAGIC_ATTRIBUTES.map(key => {
                  const attr = gameData.attributes[key];
                  if (!attr) return null;
                  const value = character.attributes?.[key] ?? 0;
                  return (
                    <div key={key} className="bg-arx-darker rounded-lg p-2 text-center">
                      <div className="text-gray-500 text-xs uppercase truncate">{attr?.name?.substring(0, 3) || key.substring(0, 3)}</div>
                      <div className="text-lg font-bold text-purple-400">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vitals */}
          <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-4">
            <h2 className="font-medieval text-lg text-red-400 mb-4">Vitalwerte</h2>
            <div className="space-y-3">
              {Object.entries(gameData.vitals).map(([key, vital]) => {
                const value = character.vitals?.[key] ?? vital.baseValue;
                const max = vital.baseValue + ((character.attributes?.konstitution || 10) - 10) * 5;
                const percentage = Math.min(100, (value / max) * 100);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{vital.name}</span>
                      <span className="text-white">{value}/{max}</span>
                    </div>
                    <div className="h-2 bg-arx-darker rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-4">
            <h2 className="font-medieval text-lg text-amber-400 mb-4">Ressourcen</h2>
            <div className="space-y-2">
              {Object.entries(gameData.resources).map(([key, res]) => {
                const max = character.resources?.[key] ?? res.baseValue;
                const icons = { ausdauerakt: '⚡', fokus: '🎯', inbrunst: '🔥', glueck: '🍀' };
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-400">{icons[key] || '●'} {res.name}</span>
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < max ? 'text-amber-400' : 'text-gray-700'}`}>●</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kampf Skills */}
          <SkillSection
            title="⚔️ Kampf-Skills"
            bereich="Nahkampf"
            skills={getVisibleSkills('Nahkampf')}
            character={character}
            viewMode={viewMode}
            onLevelUp={handleLevelUp}
            canUpgrade={canUpgrade}
            getUpgradeCost={getUpgradeCost}
            isSkillUnlocked={isSkillUnlocked}
          />

          <SkillSection
            title="🏹 Fernkampf-Skills"
            bereich="Fernkampf"
            skills={getVisibleSkills('Fernkampf')}
            character={character}
            viewMode={viewMode}
            onLevelUp={handleLevelUp}
            canUpgrade={canUpgrade}
            getUpgradeCost={getUpgradeCost}
            isSkillUnlocked={isSkillUnlocked}
          />

          <SkillSection
            title="🛡️ Defensive-Skills"
            bereich="Defensive"
            skills={getVisibleSkills('Defensive')}
            character={character}
            viewMode={viewMode}
            onLevelUp={handleLevelUp}
            canUpgrade={canUpgrade}
            getUpgradeCost={getUpgradeCost}
            isSkillUnlocked={isSkillUnlocked}
          />

          <SkillSection
            title="🔨 Handwerk-Skills"
            bereich="Handwerk"
            skills={getVisibleSkills('Handwerk')}
            character={character}
            viewMode={viewMode}
            onLevelUp={handleLevelUp}
            canUpgrade={canUpgrade}
            getUpgradeCost={getUpgradeCost}
            isSkillUnlocked={isSkillUnlocked}
          />

          <SkillSection
            title="🗡️ Gaunerei-Skills"
            bereich="Gaunerei"
            skills={getVisibleSkills('Gaunerei')}
            character={character}
            viewMode={viewMode}
            onLevelUp={handleLevelUp}
            canUpgrade={canUpgrade}
            getUpgradeCost={getUpgradeCost}
            isSkillUnlocked={isSkillUnlocked}
          />
        </div>
      </div>

      {/* Delete Button */}
      <div className="mt-8 pt-8 border-t border-arx-purple/20">
        <button
          onClick={() => setDeleteConfirm(true)}
          className="px-6 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
        >
          Charakter löschen
        </button>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-arx-dark border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="font-medieval text-2xl text-red-400 mb-4">Charakter löschen?</h3>
            <p className="text-gray-300 mb-6">
              Bist du sicher, dass du <span className="text-arx-gold font-semibold">{character.name}</span> unwiderruflich löschen möchtest?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 border border-gray-600 text-gray-400 rounded-lg hover:border-gray-500 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Wird gelöscht...' : 'Ja, löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skill Section Component
function SkillSection({ title, skills, character, viewMode, onLevelUp, canUpgrade, getUpgradeCost, isSkillUnlocked }) {
  if (skills.length === 0) return null;

  return (
    <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-4">
      <h2 className="font-medieval text-lg text-arx-gold mb-4">{title}</h2>
      <div className="space-y-2">
        {skills.map(([key, skill]) => {
          const level = character?.skills?.[key] || 0;
          const maxLevel = skill.maxLevel || 10;
          const unlocked = isSkillUnlocked(key);
          const cost = getUpgradeCost(key);
          const canUp = canUpgrade(key);
          const indent = (skill.tier || 1) - 1;

          return (
            <div 
              key={key} 
              className={`flex items-center gap-3 p-2 rounded-lg ${!unlocked ? 'opacity-40' : ''}`}
              style={{ marginLeft: `${indent * 20}px` }}
            >
              {/* Skill Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!unlocked && <span className="text-gray-500">🔒</span>}
                  {indent > 0 && <span className="text-gray-600">└</span>}
                  <span className={`font-medium ${level > 0 ? 'text-white' : 'text-gray-500'}`}>
                    {skill.name}
                  </span>
                </div>
              </div>

              {/* Level Dots */}
              <div className="flex gap-0.5">
                {[...Array(Math.min(maxLevel, 10))].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i < level ? 'bg-arx-gold' : 'bg-gray-700'}`}
                  />
                ))}
                {maxLevel > 10 && <span className="text-gray-500 text-xs ml-1">+{maxLevel - 10}</span>}
              </div>

              {/* Level Number */}
              <span className={`w-8 text-center font-mono ${level > 0 ? 'text-arx-gold' : 'text-gray-600'}`}>
                {level}
              </span>

              {/* Level Up Button (nur im Edit Mode) */}
              {viewMode === 'edit' && unlocked && level < maxLevel && (
                <button
                  onClick={() => onLevelUp(key)}
                  disabled={!canUp}
                  className={`px-2 py-1 text-xs rounded ${
                    canUp 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  +{cost} EP
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
