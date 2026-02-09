import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';

export default function CharacterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCharacter, deleteCharacter } = useCharacters();
  
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Format timestamp to date string
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

  // Attribute labels in German
  const attributeLabels = {
    strength: { name: 'Stärke', abbr: 'STR', color: 'text-red-400' },
    dexterity: { name: 'Geschick', abbr: 'DEX', color: 'text-green-400' },
    intelligence: { name: 'Intelligenz', abbr: 'INT', color: 'text-blue-400' },
    constitution: { name: 'Konstitution', abbr: 'CON', color: 'text-orange-400' },
    wisdom: { name: 'Weisheit', abbr: 'WIS', color: 'text-purple-400' },
    charisma: { name: 'Charisma', abbr: 'CHA', color: 'text-pink-400' }
  };

  // Skill labels in German
  const skillLabels = {
    combat: { name: 'Kampf', icon: '⚔️' },
    magic: { name: 'Magie', icon: '✨' },
    social: { name: 'Sozial', icon: '💬' },
    crafting: { name: 'Handwerk', icon: '🔨' }
  };

  // Get skill level text
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

  const { name, portraitURL, attributes, skills, createdAt, updatedAt } = character;
  const totalAttributes = Object.values(attributes || {}).reduce((a, b) => a + b, 0);
  const totalSkills = Object.values(skills || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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

      {/* Header Card */}
      <div className="bg-arx-dark border border-arx-purple/30 rounded-xl overflow-hidden mb-8">
        <div className="md:flex">
          {/* Portrait */}
          <div className="md:w-72 h-72 bg-gradient-to-br from-arx-purple/20 to-arx-dark flex-shrink-0">
            {portraitURL ? (
              <img 
                src={portraitURL} 
                alt={name} 
                className="w-full h-full object-cover"
              />
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
            <h1 className="font-medieval text-4xl text-arx-gold mb-4">{name}</h1>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-arx-darker rounded-lg text-center">
                <div className="text-3xl font-bold text-arx-purple">{totalAttributes}</div>
                <div className="text-sm text-gray-500">Attribut-Punkte</div>
              </div>
              <div className="p-4 bg-arx-darker rounded-lg text-center">
                <div className="text-3xl font-bold text-emerald-500">{totalSkills}</div>
                <div className="text-sm text-gray-500">Skill-Punkte</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Erstellt: {formatDate(createdAt)}</p>
              {updatedAt && <p>Zuletzt bearbeitet: {formatDate(updatedAt)}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Attributes */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <h2 className="font-medieval text-2xl text-arx-purple mb-6">Attribute</h2>
          
          <div className="space-y-4">
            {Object.entries(attributes || {}).map(([key, value]) => {
              const attr = attributeLabels[key];
              const percentage = ((value - 1) / 19) * 100;
              
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">
                      <span className={`font-mono mr-2 ${attr?.color || 'text-gray-400'}`}>
                        {attr?.abbr || key.toUpperCase()}
                      </span>
                      {attr?.name || key}
                    </span>
                    <span className="text-arx-gold font-bold">{value}</span>
                  </div>
                  <div className="h-2 bg-arx-darker rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-arx-purple to-arx-gold rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <h2 className="font-medieval text-2xl text-emerald-500 mb-6">Skills</h2>
          
          <div className="space-y-4">
            {Object.entries(skills || {}).map(([key, value]) => {
              const skill = skillLabels[key];
              const percentage = value;
              
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">
                      <span className="mr-2">{skill?.icon || '📊'}</span>
                      {skill?.name || key}
                    </span>
                    <span className="text-right">
                      <span className="text-emerald-400 font-bold">{value}</span>
                      <span className="text-gray-500 text-sm ml-2">({getSkillLevel(value)})</span>
                    </span>
                  </div>
                  <div className="h-2 bg-arx-darker rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => setDeleteConfirm(true)}
          className="px-6 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
        >
          Charakter löschen
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
