import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameRooms } from '../hooks/useGameRooms';
import { useAuth } from '../contexts/AuthContext';
import CharacterSheet from '../components/CharacterSheet';

export default function ManageRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getRoom, getRoomMembers, invitePlayer, approveCharacter, rejectCharacter, deleteRoom, updateRoomSettings } = useGameRooms();
  
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [playerCode, setPlayerCode] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [needsRevision, setNeedsRevision] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Character Sheet Modal
  const [viewingCharacter, setViewingCharacter] = useState(null);
  
  // Room Settings
  const [settings, setSettings] = useState({
    maxAttributePoints: 60,
    maxPerAttribute: 18,
    maxSkillPoints: 200,
    maxPerSkill: 100
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const roomData = await getRoom(id);
      if (!roomData) {
        setError('Runde nicht gefunden');
        setLoading(false);
        return;
      }
      if (roomData.slUserId !== currentUser?.uid) {
        navigate(`/rooms/${id}`);
        return;
      }
      setRoom(roomData);
      setSettings({
        maxAttributePoints: roomData.settings?.maxAttributePoints || 60,
        maxPerAttribute: roomData.settings?.maxPerAttribute || 18,
        maxSkillPoints: roomData.settings?.maxSkillPoints || 200,
        maxPerSkill: roomData.settings?.maxPerSkill || 100
      });
      const memberData = await getRoomMembers(id);
      setMembers(memberData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    setError('');
    setInviteSuccess('');
    if (!playerCode.trim()) {
      setError('Bitte gib einen Spieler-Code ein');
      return;
    }
    setInviting(true);
    try {
      const result = await invitePlayer(id, playerCode.trim());
      setInviteSuccess(`${result.userName} wurde eingeladen!`);
      setPlayerCode('');
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
    setInviting(false);
  };

  const handleApprove = async (memberId) => {
    try {
      await approveCharacter(id, memberId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectCharacter(id, rejectModal.id, rejectReason, needsRevision);
      setRejectModal(null);
      setRejectReason('');
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoom(id);
      navigate('/rooms');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateRoomSettings(id, settings);
      setShowSettingsModal(false);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room?.roomCode || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const pendingMembers = members.filter(m => m.status === 'pending');
  const invitedMembers = members.filter(m => m.status === 'invited');
  const approvedMembers = members.filter(m => m.status === 'approved');
  const waitingForCharacter = members.filter(m => m.status === 'joined_no_char');

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-arx-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
          <Link to="/rooms" className="text-arx-purple hover:text-arx-gold mt-4 inline-block">← Zurück</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/rooms" className="text-gray-400 hover:text-arx-gold text-sm mb-2 inline-block">← Zurück</Link>
          <h1 className="font-medieval text-3xl text-arx-gold">{room?.name}</h1>
          <p className="text-gray-500">👑 Spielleiter-Dashboard</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettingsModal(true)} className="px-4 py-2 text-arx-purple hover:bg-arx-purple/10 rounded-lg">
            ⚙️ Einstellungen
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg">
            🗑️ Löschen
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">{error}</div>}
      {inviteSuccess && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">{inviteSuccess}</div>}

      {/* Room Rules Info */}
      <div className="mb-6 p-4 bg-arx-dark border border-arx-purple/20 rounded-xl">
        <h3 className="text-sm text-gray-400 mb-2">📋 Aktuelle Regeln für Charakter-Erstellung:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-arx-purple">Max {settings.maxAttributePoints} Attribut-Punkte</span>
          <span className="text-gray-500">|</span>
          <span className="text-arx-purple">Max {settings.maxPerAttribute} pro Attribut</span>
          <span className="text-gray-500">|</span>
          <span className="text-emerald-500">Max {settings.maxSkillPoints} Skill-Punkte</span>
          <span className="text-gray-500">|</span>
          <span className="text-emerald-500">Max {settings.maxPerSkill} pro Skill</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Room Code */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <h2 className="font-medieval text-xl text-arx-purple mb-4">🔗 Room-Code</h2>
          <div className="bg-arx-darker rounded-lg p-4 text-center mb-4">
            <p className="text-3xl font-mono text-arx-gold tracking-wider">{room?.roomCode}</p>
          </div>
          <button onClick={copyRoomCode} className={`w-full py-2 rounded-lg transition-colors ${copiedCode ? 'bg-green-500/20 text-green-400' : 'bg-arx-purple/20 text-arx-purple hover:bg-arx-purple/30'}`}>
            {copiedCode ? '✓ Kopiert!' : '📋 Kopieren'}
          </button>
        </div>

        {/* Invite Player */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <h2 className="font-medieval text-xl text-arx-purple mb-4">📨 Spieler einladen</h2>
          <div className="flex gap-3 mb-4">
            <input type="text" value={playerCode} onChange={(e) => setPlayerCode(e.target.value.toUpperCase())} placeholder="PLR-XXXXXXXX" className="flex-1 px-4 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white font-mono placeholder-gray-500" />
            <button onClick={handleInvite} disabled={inviting} className="px-4 py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark disabled:opacity-50">
              {inviting ? '...' : '📨'}
            </button>
          </div>
          <p className="text-xs text-gray-500">Spieler-Code aus dem Profil des Spielers</p>
        </div>
      </div>

      {/* Pending Requests - WITH CHARACTER SHEET VIEW */}
      {pendingMembers.length > 0 && (
        <div className="mt-8 bg-arx-dark border border-yellow-500/30 rounded-xl p-6">
          <h2 className="font-medieval text-xl text-yellow-400 mb-4">⏳ Ausstehend ({pendingMembers.length})</h2>
          <div className="space-y-4">
            {pendingMembers.map(member => (
              <div key={member.id} className="bg-arx-darker rounded-lg p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-white font-semibold">{member.characterName}</span>
                    <span className="text-gray-500 ml-2">@{member.userName}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => setViewingCharacter(member.characterId)} 
                      className="px-3 py-1 text-sm bg-arx-purple/20 text-arx-purple rounded hover:bg-arx-purple/30"
                    >
                      👁️ Sheet ansehen
                    </button>
                    <button onClick={() => handleApprove(member.id)} className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                      ✅ Annehmen
                    </button>
                    <button onClick={() => setRejectModal(member)} className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                      ❌ Ablehnen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waiting for Character */}
      {waitingForCharacter.length > 0 && (
        <div className="mt-8 bg-arx-dark border border-orange-500/30 rounded-xl p-6">
          <h2 className="font-medieval text-xl text-orange-400 mb-4">🎭 Warten auf Charakter ({waitingForCharacter.length})</h2>
          <div className="space-y-2">
            {waitingForCharacter.map(member => (
              <div key={member.id} className="bg-arx-darker rounded-lg p-3 flex items-center justify-between">
                <span className="text-gray-300">@{member.userName}</span>
                <span className="text-xs text-orange-400">Erstellt noch Charakter</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invited */}
      {invitedMembers.length > 0 && (
        <div className="mt-8 bg-arx-dark border border-blue-500/30 rounded-xl p-6">
          <h2 className="font-medieval text-xl text-blue-400 mb-4">📨 Eingeladen ({invitedMembers.length})</h2>
          <div className="space-y-2">
            {invitedMembers.map(member => (
              <div key={member.id} className="bg-arx-darker rounded-lg p-3 flex items-center justify-between">
                <span className="text-gray-300">@{member.userName}</span>
                <span className="text-xs text-gray-500">Wartet auf Antwort</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Players - WITH CHARACTER SHEET VIEW */}
      <div className="mt-8 bg-arx-dark border border-green-500/30 rounded-xl p-6">
        <h2 className="font-medieval text-xl text-green-400 mb-4">✅ Aktive Spieler ({approvedMembers.length})</h2>
        {approvedMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Noch keine Spieler</p>
        ) : (
          <div className="space-y-3">
            {approvedMembers.map(member => (
              <div key={member.id} className="bg-arx-darker rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-arx-gold font-semibold">{member.characterName}</span>
                  <span className="text-gray-500 ml-2">@{member.userName}</span>
                </div>
                <button 
                  onClick={() => setViewingCharacter(member.characterId)}
                  className="px-3 py-1 text-sm bg-arx-purple/20 text-arx-purple rounded hover:bg-arx-purple/30"
                >
                  👁️ Sheet ansehen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Sheet Modal */}
      {viewingCharacter && (
        <CharacterSheet 
          characterId={viewingCharacter} 
          onClose={() => setViewingCharacter(null)} 
        />
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-arx-dark border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="font-medieval text-xl text-red-400 mb-4">Charakter ablehnen</h3>
            <p className="text-gray-300 mb-2">
              <span className="text-arx-gold">{rejectModal.characterName}</span> von @{rejectModal.userName}
            </p>
            <button 
              onClick={() => setViewingCharacter(rejectModal.characterId)}
              className="text-sm text-arx-purple hover:text-arx-gold mb-4 inline-block"
            >
              👁️ Charakter nochmal ansehen
            </button>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="w-full px-4 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 resize-none mb-4" placeholder="Begründung (z.B. 'Skills zu hoch')..." />
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={needsRevision} onChange={(e) => setNeedsRevision(e.target.checked)} className="w-5 h-5" />
              <span className="text-gray-300">Überarbeitung erlauben</span>
            </label>
            <div className="flex gap-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="flex-1 py-2 border border-gray-600 text-gray-400 rounded-lg">Abbrechen</button>
              <button onClick={handleReject} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                {needsRevision ? '⚠️ Überarbeitung' : '❌ Ablehnen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="font-medieval text-xl text-arx-purple mb-6">⚙️ Runden-Einstellungen</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Max. Attribut-Punkte gesamt</label>
                <input 
                  type="number" 
                  value={settings.maxAttributePoints} 
                  onChange={(e) => setSettings({...settings, maxAttributePoints: parseInt(e.target.value) || 60})}
                  className="w-full px-4 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Max. pro Attribut</label>
                <input 
                  type="number" 
                  value={settings.maxPerAttribute} 
                  onChange={(e) => setSettings({...settings, maxPerAttribute: parseInt(e.target.value) || 18})}
                  className="w-full px-4 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Max. Skill-Punkte gesamt</label>
                <input 
                  type="number" 
                  value={settings.maxSkillPoints} 
                  onChange={(e) => setSettings({...settings, maxSkillPoints: parseInt(e.target.value) || 200})}
                  className="w-full px-4 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Max. pro Skill</label>
                <input 
                  type="number" 
                  value={settings.maxPerSkill} 
                  onChange={(e) => setSettings({...settings, maxPerSkill: parseInt(e.target.value) || 100})}
                  className="w-full px-4 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button onClick={() => setShowSettingsModal(false)} className="flex-1 py-2 border border-gray-600 text-gray-400 rounded-lg">Abbrechen</button>
              <button onClick={handleSaveSettings} className="flex-1 py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark">💾 Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-arx-dark border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="font-medieval text-xl text-red-400 mb-4">Runde löschen?</h3>
            <p className="text-gray-300 mb-6">
              <span className="text-arx-gold">"{room?.name}"</span> wirklich löschen?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border border-gray-600 text-gray-400 rounded-lg">Abbrechen</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">🗑️ Löschen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
