import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameRooms } from '../hooks/useGameRooms';

export default function CreateRoom() {
  const navigate = useNavigate();
  const { createRoom } = useGameRooms();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techLevel, setTechLevel] = useState('fantasy');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const techLevels = [
    { id: 'fantasy', name: '⚔️ Fantasy', desc: 'Mittelalter, Magie, Drachen' },
    { id: 'steampunk', name: '⚙️ Steampunk', desc: 'Dampfmaschinen, Victorian' },
    { id: 'modern', name: '🏙️ Modern', desc: 'Gegenwart, Urban Fantasy' },
    { id: 'cyberpunk', name: '🤖 Cyberpunk', desc: 'High Tech, Low Life' },
    { id: 'scifi', name: '🚀 Sci-Fi', desc: 'Raumfahrt, Aliens' },
    { id: 'postapoc', name: '☢️ Post-Apokalypse', desc: 'Endzeit, Survival' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Bitte gib einen Namen für die Runde ein');
      return;
    }
    
    setLoading(true);
    
    try {
      const room = await createRoom({
        name: name.trim(),
        description: description.trim(),
        techLevel,
        maxPlayers
      });
      
      navigate(`/rooms/${room.id}/manage`);
    } catch (err) {
      setError('Fehler beim Erstellen: ' + err.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-medieval text-4xl text-arx-gold mb-2">Spielrunde erstellen</h1>
        <p className="text-gray-400">Werde Spielleiter deiner eigenen Kampagne</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <label className="block text-gray-300 mb-2 font-semibold">Name der Runde *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple"
            placeholder="z.B. Die Helden von Arkania"
          />
        </div>

        {/* Description */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <label className="block text-gray-300 mb-2 font-semibold">Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple resize-none"
            placeholder="Worum geht es in deiner Kampagne?"
          />
        </div>

        {/* Tech Level */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <label className="block text-gray-300 mb-4 font-semibold">Setting / Tech-Level</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {techLevels.map(level => (
              <button
                key={level.id}
                type="button"
                onClick={() => setTechLevel(level.id)}
                className={`p-4 rounded-lg text-left transition-all ${
                  techLevel === level.id
                    ? 'bg-arx-purple/30 border-2 border-arx-purple'
                    : 'bg-arx-darker border-2 border-transparent hover:border-arx-purple/30'
                }`}
              >
                <div className="font-semibold text-white">{level.name}</div>
                <div className="text-sm text-gray-500">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Max Players */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <label className="block text-gray-300 mb-2 font-semibold">Maximale Spieleranzahl</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={2}
              max={12}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-2xl font-bold text-arx-gold w-12 text-center">{maxPlayers}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Empfohlen: 3-6 Spieler</p>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            className="flex-1 py-4 border-2 border-gray-600 text-gray-400 font-semibold rounded-xl hover:border-gray-500 hover:text-gray-300 transition-all"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 bg-gradient-to-r from-arx-purple to-arx-gold text-white font-semibold rounded-xl hover:from-arx-purple-dark hover:to-arx-gold-dark transition-all disabled:opacity-50"
          >
            {loading ? 'Wird erstellt...' : '👑 Runde erstellen'}
          </button>
        </div>
      </form>
    </div>
  );
}
