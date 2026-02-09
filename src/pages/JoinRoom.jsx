import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameRooms } from '../hooks/useGameRooms';
import { useCharacters } from '../hooks/useCharacters';

export default function JoinRoom() {
  const navigate = useNavigate();
  const { getRoomByCode, requestToJoin, joinWithoutCharacter } = useGameRooms();
  const { characters } = useCharacters();
  
  const [roomCode, setRoomCode] = useState('');
  const [foundRoom, setFoundRoom] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [joinMode, setJoinMode] = useState(null); // 'existing' | 'create_later'
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async () => {
    setError('');
    setFoundRoom(null);
    setJoinMode(null);
    
    if (!roomCode.trim()) {
      setError('Bitte gib einen Room-Code ein');
      return;
    }
    
    setSearching(true);
    
    try {
      const room = await getRoomByCode(roomCode.trim());
      
      if (room) {
        setFoundRoom(room);
      } else {
        setError('Runde nicht gefunden. Prüfe den Code.');
      }
    } catch (err) {
      setError('Fehler bei der Suche: ' + err.message);
    }
    
    setSearching(false);
  };

  const handleJoinWithCharacter = async () => {
    setError('');
    
    if (!selectedCharacter) {
      setError('Bitte wähle einen Charakter');
      return;
    }
    
    const character = characters.find(c => c.id === selectedCharacter);
    
    setLoading(true);
    
    try {
      await requestToJoin(foundRoom.id, selectedCharacter, character.name);
      setSuccess('Anfrage gesendet! Der Spielleiter muss deinen Charakter noch genehmigen.');
      setTimeout(() => navigate('/rooms'), 2000);
    } catch (err) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  const handleJoinWithoutCharacter = async () => {
    setLoading(true);
    
    try {
      await joinWithoutCharacter(foundRoom.id);
      setSuccess('Du bist der Runde beigetreten! Erstelle jetzt einen Charakter für diese Runde.');
      setTimeout(() => navigate(`/rooms/${foundRoom.id}/create-character`), 2000);
    } catch (err) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-medieval text-4xl text-arx-gold mb-2">Runde beitreten</h1>
        <p className="text-gray-400">Gib den Room-Code ein, den du vom Spielleiter erhalten hast</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Search */}
      <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6 mb-6">
        <label className="block text-gray-300 mb-2 font-semibold">Room-Code</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="ARX-XXXXX"
            maxLength={10}
            className="flex-1 px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white text-center font-mono text-xl tracking-wider placeholder-gray-500 focus:outline-none focus:border-arx-purple"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark transition-colors disabled:opacity-50"
          >
            {searching ? '...' : '🔍 Suchen'}
          </button>
        </div>
      </div>

      {/* Found Room */}
      {foundRoom && !success && (
        <div className="bg-arx-dark border border-arx-gold/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎲</span>
            <h2 className="font-medieval text-2xl text-arx-gold">{foundRoom.name}</h2>
          </div>
          
          {foundRoom.description && (
            <p className="text-gray-400 mb-4">{foundRoom.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span>👑 SL: {foundRoom.slName}</span>
            <span>🎭 {foundRoom.settings?.techLevel || 'Fantasy'}</span>
            <span>👥 Max {foundRoom.settings?.maxPlayers || 6} Spieler</span>
          </div>

          {/* Room Rules */}
          <div className="bg-arx-darker rounded-lg p-4 mb-6">
            <h3 className="text-sm text-gray-400 mb-2">📋 Charakter-Regeln dieser Runde:</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-2 py-1 bg-arx-purple/20 text-arx-purple rounded">
                {foundRoom.settings?.maxAttributePoints || 60} Attribut-Punkte
              </span>
              <span className="px-2 py-1 bg-arx-purple/20 text-arx-purple rounded">
                Max {foundRoom.settings?.maxPerAttribute || 18} pro Attribut
              </span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                {foundRoom.settings?.maxSkillPoints || 200} Skill-Punkte
              </span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                Max {foundRoom.settings?.maxPerSkill || 100} pro Skill
              </span>
            </div>
          </div>

          {/* Join Mode Selection */}
          {!joinMode && (
            <div className="border-t border-arx-purple/20 pt-6">
              <h3 className="text-gray-300 mb-4 font-semibold">Wie möchtest du beitreten?</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setJoinMode('existing')}
                  className="p-4 bg-arx-darker border-2 border-transparent hover:border-arx-purple rounded-xl text-left transition-all"
                >
                  <div className="text-2xl mb-2">📜</div>
                  <div className="font-semibold text-white">Mit bestehendem Charakter</div>
                  <div className="text-sm text-gray-500">Wähle einen deiner Charaktere</div>
                </button>
                
                <button
                  onClick={() => setJoinMode('create_later')}
                  className="p-4 bg-arx-darker border-2 border-transparent hover:border-arx-gold rounded-xl text-left transition-all"
                >
                  <div className="text-2xl mb-2">✨</div>
                  <div className="font-semibold text-white">Neuen Charakter erstellen</div>
                  <div className="text-sm text-gray-500">Erstelle einen Charakter nach den Runden-Regeln</div>
                </button>
              </div>
            </div>
          )}

          {/* Existing Character Selection */}
          {joinMode === 'existing' && (
            <div className="border-t border-arx-purple/20 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 font-semibold">Wähle einen Charakter:</h3>
                <button onClick={() => setJoinMode(null)} className="text-sm text-gray-500 hover:text-arx-gold">
                  ← Zurück
                </button>
              </div>
              
              {characters.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">Du hast noch keine Charaktere erstellt.</p>
                  <button
                    onClick={() => setJoinMode('create_later')}
                    className="px-6 py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark"
                  >
                    ✨ Neuen Charakter für diese Runde erstellen
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {characters.map(char => (
                      <label
                        key={char.id}
                        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                          selectedCharacter === char.id
                            ? 'bg-arx-purple/30 border-2 border-arx-purple'
                            : 'bg-arx-darker border-2 border-transparent hover:border-arx-purple/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="character"
                          value={char.id}
                          checked={selectedCharacter === char.id}
                          onChange={(e) => setSelectedCharacter(e.target.value)}
                          className="hidden"
                        />
                        
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-arx-darker flex-shrink-0">
                          {char.portraitURL ? (
                            <img src={char.portraitURL} alt={char.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-arx-gold font-medieval text-xl">
                              {char.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-white">{char.name}</div>
                          <div className="text-sm text-gray-500">
                            STR {char.attributes?.strength} | DEX {char.attributes?.dexterity} | INT {char.attributes?.intelligence}
                          </div>
                        </div>
                        
                        {selectedCharacter === char.id && (
                          <span className="text-arx-gold text-xl">✓</span>
                        )}
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleJoinWithCharacter}
                    disabled={loading || !selectedCharacter}
                    className="w-full py-4 bg-gradient-to-r from-arx-purple to-arx-gold text-white font-semibold rounded-xl hover:from-arx-purple-dark hover:to-arx-gold-dark transition-all disabled:opacity-50"
                  >
                    {loading ? 'Wird gesendet...' : '🎲 Beitrittsanfrage senden'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Create New Character */}
          {joinMode === 'create_later' && (
            <div className="border-t border-arx-purple/20 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 font-semibold">Neuen Charakter erstellen</h3>
                <button onClick={() => setJoinMode(null)} className="text-sm text-gray-500 hover:text-arx-gold">
                  ← Zurück
                </button>
              </div>
              
              <div className="bg-arx-darker rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm">
                  Du trittst der Runde bei und erstellst danach einen Charakter, 
                  der den Regeln dieser Runde entspricht. Der Spielleiter muss 
                  deinen Charakter dann noch genehmigen.
                </p>
              </div>

              <button
                onClick={handleJoinWithoutCharacter}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-arx-gold to-arx-gold-dark text-arx-darker font-semibold rounded-xl hover:from-arx-gold-dark hover:to-arx-gold transition-all disabled:opacity-50"
              >
                {loading ? 'Wird beigetreten...' : '✨ Beitreten & Charakter erstellen'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="text-center">
        <Link to="/rooms" className="text-gray-400 hover:text-arx-gold transition-colors">
          ← Zurück zu meinen Runden
        </Link>
      </div>
    </div>
  );
}
