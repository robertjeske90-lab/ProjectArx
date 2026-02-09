import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameRooms } from '../hooks/useGameRooms';

export default function RoomList() {
  const { myRooms, joinedRooms, loading, error } = useGameRooms();
  const [activeTab, setActiveTab] = useState('all');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-arx-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Lade Spielrunden...</p>
          </div>
        </div>
      </div>
    );
  }

  const allRooms = [...myRooms, ...joinedRooms];
  const displayRooms = activeTab === 'all' ? allRooms 
    : activeTab === 'sl' ? myRooms 
    : joinedRooms;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-medieval text-4xl text-arx-gold mb-2">Spielrunden</h1>
          <p className="text-gray-400">
            {allRooms.length === 0 
              ? 'Du bist noch keiner Runde beigetreten' 
              : `${allRooms.length} Runde${allRooms.length !== 1 ? 'n' : ''}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/rooms/join"
            className="px-4 py-2 border border-arx-purple text-arx-purple rounded-lg hover:bg-arx-purple/10 transition-colors"
          >
            🎫 Beitreten
          </Link>
          <Link 
            to="/rooms/create"
            className="px-4 py-2 bg-gradient-to-r from-arx-purple to-arx-purple-dark text-white rounded-lg hover:from-arx-purple-dark hover:to-arx-purple transition-all"
          >
            ➕ Runde erstellen
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'all' 
              ? 'bg-arx-purple text-white' 
              : 'bg-arx-dark text-gray-400 hover:text-white'
          }`}
        >
          Alle ({allRooms.length})
        </button>
        <button
          onClick={() => setActiveTab('sl')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'sl' 
              ? 'bg-arx-purple text-white' 
              : 'bg-arx-dark text-gray-400 hover:text-white'
          }`}
        >
          👑 Als SL ({myRooms.length})
        </button>
        <button
          onClick={() => setActiveTab('player')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'player' 
              ? 'bg-arx-purple text-white' 
              : 'bg-arx-dark text-gray-400 hover:text-white'
          }`}
        >
          👤 Als Spieler ({joinedRooms.length})
        </button>
      </div>

      {/* Room Grid */}
      {displayRooms.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRooms.map(room => (
            <div 
              key={room.id}
              className="bg-arx-dark border border-arx-purple/30 rounded-xl overflow-hidden hover:border-arx-purple/60 transition-all"
            >
              {/* Header */}
              <div className="p-4 border-b border-arx-purple/20">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    room.role === 'sl' 
                      ? 'bg-arx-gold/20 text-arx-gold' 
                      : 'bg-arx-purple/20 text-arx-purple'
                  }`}>
                    {room.role === 'sl' ? '👑 Spielleiter' : '👤 Spieler'}
                  </span>
                  {room.memberStatus && room.memberStatus !== 'approved' && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      room.memberStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      room.memberStatus === 'invited' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {room.memberStatus === 'pending' ? '⏳ Wartet' :
                       room.memberStatus === 'invited' ? '📨 Eingeladen' :
                       '⚠️ Überarbeiten'}
                    </span>
                  )}
                </div>
                <h3 className="font-medieval text-xl text-arx-gold">{room.name}</h3>
                {room.description && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{room.description}</p>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span>🎭 {room.settings?.techLevel || 'Fantasy'}</span>
                  <span>👥 Max {room.settings?.maxPlayers || 6}</span>
                </div>

                {room.role === 'player' && room.characterName && (
                  <div className="text-sm text-gray-500 mb-4">
                    Dein Charakter: <span className="text-arx-gold">{room.characterName}</span>
                  </div>
                )}

                {/* Room Code (for SL) */}
                {room.role === 'sl' && (
                  <div className="bg-arx-darker rounded-lg p-2 mb-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Room Code:</span>
                    <span className="font-mono text-arx-gold">{room.roomCode}</span>
                  </div>
                )}

                {/* Actions */}
                <Link 
                  to={room.role === 'sl' ? `/rooms/${room.id}/manage` : `/rooms/${room.id}`}
                  className="block w-full text-center py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark transition-colors"
                >
                  {room.role === 'sl' ? '⚙️ Verwalten' : '🎲 Zur Runde'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-arx-purple/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">🎲</span>
          </div>
          <h2 className="font-medieval text-2xl text-arx-gold mb-2">Keine Spielrunden</h2>
          <p className="text-gray-400 mb-6">
            {activeTab === 'sl' 
              ? 'Du leitest noch keine Runden. Erstelle deine erste!'
              : activeTab === 'player'
              ? 'Du bist noch keiner Runde als Spieler beigetreten.'
              : 'Erstelle eine eigene Runde oder tritt einer bei!'}
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/rooms/join"
              className="px-6 py-3 border border-arx-purple text-arx-purple rounded-lg hover:bg-arx-purple/10"
            >
              🎫 Runde beitreten
            </Link>
            <Link 
              to="/rooms/create"
              className="px-6 py-3 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark"
            >
              ➕ Runde erstellen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
