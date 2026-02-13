import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import { useDice } from '../contexts/DiceContext';
import CharacterBBCodeExport from '../components/CharacterBBCodeExport';
import { PersistenceSection } from '../components/PersistenceSection';
import gameData from '../data/gameData.json';

export default function CharacterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCharacter, updateCharacter, deleteCharacter } = useCharacters();
  const { openDiceRoller } = useDice();
  
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('stats'); // stats, backstory, export
  const [editMode, setEditMode] = useState(false);

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

  const handlePersistenceUpdate = async (updates) => {
    try {
      await updateCharacter(id, updates);
      setCharacter(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // Dice Roll Handler
  const handleSkillRoll = (skillKey, skillData) => {
    // Finde verknüpftes Attribut (vereinfacht - könnte erweitert werden)
    const linkedAttr = getLinkedAttribute(skillData.bereich);
    const attrValue = character?.attributes?.[linkedAttr] || 10;
    const skillValue = character?.skills?.[skillKey] || 0;

    openDiceRoller({
      label: `${skillData.name} Probe`,
      attr: gameData.attributes[linkedAttr]?.name || linkedAttr,
      attrValue: attrValue,
      skill: skillData.name,
      skillValue: skillValue,
      tn: 15,
      modifiers: []
    });
  };

  const handleAttrRoll = (attrKey, attrData) => {
    const attrValue = character?.attributes?.[attrKey] || 10;

    openDiceRoller({
      label: `${attrData.name} Probe`,
      attr: attrData.name,
      attrValue: attrValue,
      skill: 'Basis',
      skillValue: 0,
      tn: 15,
      modifiers: []
    });
  };

  // Helper: Finde verknüpftes Attribut
  const getLinkedAttribute = (bereich) => {
    const mapping = {
      'Nahkampf': 'koerper',
      'Fernkampf': 'geschick',
      'Magie': 'geist',
      'Sozial': 'charisma',
      'Wissen': 'geist',
      'Handwerk': 'geschick',
      'Athletik': 'koerper',
      'Überleben': 'wahrnehmung'
    };
    return mapping[bereich] || 'koerper';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unbekannt';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Vitals Farben
  const vitalColors = {
    hp: { color: '#FF4444', icon: '❤️', name: 'Lebensenergie' },
    geist: { color: '#AA88FF', icon: '🧠', name: 'Geist' },
    frische: { color: '#44AAFF', icon: '⚡', name: 'Frische' }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">{error || 'Charakter nicht gefunden'}</p>
          <Link 
            to="/characters"
            className="inline-block px-6 py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark transition-colors"
          >
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  const { name, portraitURL, cosmetics, attributes, skills, vitals, createdAt, updatedAt } = character;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link 
        to="/characters"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-arx-gold transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Zurück zur Übersicht
      </Link>

      {/* Header Card mit Vitals */}
      <div className="bg-arx-dark border border-arx-purple/30 rounded-xl overflow-hidden mb-6">
        <div className="md:flex">
          {/* Portrait */}
          <div className="md:w-72 h-72 bg-gradient-to-br from-arx-purple/20 to-arx-dark flex-shrink-0">
            {portraitURL ? (
              <img src={portraitURL} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-arx-purple/30 flex items-center justify-center">
                  <span className="text-6xl text-arx-gold font-medieval">
                    {name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-medieval text-4xl text-arx-gold mb-1">{name}</h1>
                {cosmetics?.title && (
                  <p className="text-gray-400 italic">{cosmetics.title}</p>
                )}
                {cosmetics?.race && (
                  <p className="text-gray-500 text-sm">{cosmetics.race}</p>
                )}
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  editMode 
                    ? 'bg-arx-gold text-arx-darker' 
                    : 'bg-arx-darker text-gray-400 hover:text-white'
                }`}
              >
                {editMode ? '✓ Fertig' : '✏️ Bearbeiten'}
              </button>
            </div>

            {/* Vitals Bars */}
            <div className="mt-6 space-y-3">
              {Object.entries(vitalColors).map(([key, { color, icon, name: vitalName }]) => {
                const current = vitals?.[key] || 100;
                const max = vitals?.[`max${key.charAt(0).toUpperCase() + key.slice(1)}`] || 100;
                const percent = (current / max) * 100;
                
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color }}>{icon} {vitalName}</span>
                      <span className="text-gray-400">{current}/{max}</span>
                    </div>
                    <div className="h-3 bg-arx-darker rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-sm text-gray-500 mt-4 space-y-1">
              <p>Erstellt: {formatDate(createdAt)}</p>
              {updatedAt && <p>Bearbeitet: {formatDate(updatedAt)}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-arx-dark rounded-lg p-1">
        {[
          { key: 'stats', label: '📊 Stats', icon: '📊' },
          { key: 'backstory', label: '📖 Geschichte', icon: '📖' },
          { key: 'export', label: '📋 Export', icon: '📋' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-arx-purple text-white'
                : 'text-gray-400 hover:text-white hover:bg-arx-purple/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Attribute */}
          <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
            <h2 className="font-medieval text-2xl text-arx-purple mb-6">Attribute</h2>
            
            <div className="space-y-4">
              {Object.entries(attributes || {}).map(([key, value]) => {
                const attrData = gameData.attributes[key];
                const percentage = ((value - 1) / 14) * 100;
                
                return (
                  <div key={key} className="group">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 flex items-center gap-2">
                        <span className="font-mono text-arx-purple">
                          {key.toUpperCase().slice(0, 3)}
                        </span>
                        {attrData?.name || key}
                        {/* Würfel-Button */}
                        <button
                          onClick={() => handleAttrRoll(key, attrData)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 
                                     hover:bg-arx-purple/30 rounded text-arx-gold"
                          title="Probe würfeln"
                        >
                          🎲
                        </button>
                      </span>
                      <span className="text-arx-gold font-bold">{value}</span>
                    </div>
                    <div className="h-2 bg-arx-darker rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-arx-purple to-arx-gold rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
            <h2 className="font-medieval text-2xl text-emerald-500 mb-6">Skills</h2>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {Object.entries(skills || {}).filter(([_, v]) => v > 0).map(([key, value]) => {
                const skillData = gameData.skills?.[key] || { name: key };
                
                return (
                  <div key={key} className="group">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 flex items-center gap-2">
                        {skillData.name}
                        {/* Würfel-Button */}
                        <button
                          onClick={() => handleSkillRoll(key, skillData)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 
                                     hover:bg-emerald-500/30 rounded text-emerald-400"
                          title="Probe würfeln"
                        >
                          🎲
                        </button>
                      </span>
                      <span className="text-emerald-400 font-bold">{value}</span>
                    </div>
                    <div className="h-2 bg-arx-darker rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                        style={{ width: `${Math.min(value * 10, 100)}%` }}
                      />
                    </div>
                    {skillData.bereich && (
                      <span className="text-xs text-gray-600">{skillData.bereich}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'backstory' && (
        <PersistenceSection 
          character={character}
          onUpdate={handlePersistenceUpdate}
          readOnly={!editMode}
        />
      )}

      {activeTab === 'export' && (
        <CharacterBBCodeExport character={character} gameData={gameData} />
      )}

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => setDeleteConfirm(true)}
          className="px-6 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
        >
          🗑️ Charakter löschen
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-arx-dark border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="font-medieval text-2xl text-red-400 mb-4">Charakter löschen?</h3>
            <p className="text-gray-300 mb-6">
              Bist du sicher, dass du <span className="text-arx-gold font-semibold">{name}</span> unwiderruflich löschen möchtest?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 border border-gray-600 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
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
