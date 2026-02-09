import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import CharacterCard from '../components/CharacterCard';

export default function CharacterList() {
  const { characters, loading, error, deleteCharacter } = useCharacters();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (characterId) => {
    setDeleteConfirm(characterId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    setDeleting(true);
    try {
      await deleteCharacter(deleteConfirm);
    } catch (err) {
      console.error('Error deleting character:', err);
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // Find character name for confirmation dialog
  const characterToDelete = characters.find(c => c.id === deleteConfirm);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-arx-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Lade Charaktere...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">Fehler beim Laden der Charaktere: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-medieval text-4xl text-arx-gold mb-2">Meine Charaktere</h1>
          <p className="text-gray-400">
            {characters.length === 0 
              ? 'Du hast noch keine Charaktere erstellt' 
              : `${characters.length} Charakter${characters.length !== 1 ? 'e' : ''} gefunden`}
          </p>
        </div>
        <Link 
          to="/create-character"
          className="px-6 py-3 bg-gradient-to-r from-arx-purple to-arx-purple-dark text-white font-semibold rounded-xl hover:from-arx-purple-dark hover:to-arx-purple transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neuer Charakter
        </Link>
      </div>

      {/* Character Grid */}
      {characters.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {characters.map(character => (
            <CharacterCard 
              key={character.id} 
              character={character} 
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-arx-purple/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-arx-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="font-medieval text-2xl text-arx-gold mb-2">Keine Charaktere</h2>
          <p className="text-gray-400 mb-6">Erstelle deinen ersten Charakter und beginne dein Abenteuer!</p>
          <Link 
            to="/create-character"
            className="inline-flex items-center gap-2 px-6 py-3 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ersten Charakter erstellen
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-arx-dark border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="font-medieval text-2xl text-red-400 mb-4">Charakter löschen?</h3>
            <p className="text-gray-300 mb-6">
              Bist du sicher, dass du <span className="text-arx-gold font-semibold">{characterToDelete?.name}</span> unwiderruflich löschen möchtest?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 py-3 border border-gray-600 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteConfirm}
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
