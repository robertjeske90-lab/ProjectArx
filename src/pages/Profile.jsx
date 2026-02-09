import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications, getNotificationIcon, getNotificationText } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const copyPlayerCode = () => {
    navigator.clipboard.writeText(userProfile?.playerCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!displayName.trim()) return;
    
    setSaving(true);
    await updateUserProfile({ displayName: displayName.trim() });
    setSaving(false);
    setEditing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unbekannt';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.roomId) {
      navigate(`/rooms/${notification.roomId}`);
    }
  };

  // Pending invitations
  const pendingInvites = notifications.filter(n => n.type === 'invite' && !n.read);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-medieval text-4xl text-arx-gold mb-2">Mein Profil</h1>
        <p className="text-gray-400">Verwalte dein Konto und Einladungen</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <h2 className="font-medieval text-xl text-arx-purple mb-6">Profil-Informationen</h2>
          
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-arx-purple to-arx-gold rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {userProfile?.displayName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="px-3 py-2 bg-arx-darker border border-arx-purple/30 rounded-lg text-white"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark"
                  >
                    {saving ? '...' : '✓'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl text-white font-semibold">{userProfile?.displayName}</h3>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-gray-500 hover:text-arx-gold"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <p className="text-gray-500">{currentUser?.email}</p>
            </div>
          </div>

          {/* Member since */}
          <div className="text-sm text-gray-500">
            Mitglied seit: {formatDate(userProfile?.createdAt)}
          </div>
        </div>

        {/* Player Code */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
          <h2 className="font-medieval text-xl text-arx-purple mb-6">🔑 Dein Spieler-Code</h2>
          
          <div className="bg-arx-darker rounded-xl p-6 text-center mb-4">
            <p className="text-3xl font-mono text-arx-gold tracking-wider mb-4">
              {userProfile?.playerCode || 'Laden...'}
            </p>
            <button
              onClick={copyPlayerCode}
              className={`px-6 py-2 rounded-lg transition-all ${
                copied 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-arx-purple/20 text-arx-purple hover:bg-arx-purple/30'
              }`}
            >
              {copied ? '✓ Kopiert!' : '📋 Code kopieren'}
            </button>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Teile diesen Code mit Spielleitern, damit sie dich zu ihren Runden einladen können!
          </p>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="mt-8 bg-arx-dark border border-arx-gold/30 rounded-xl p-6">
          <h2 className="font-medieval text-xl text-arx-gold mb-6">
            📨 Offene Einladungen ({pendingInvites.length})
          </h2>
          
          <div className="space-y-4">
            {pendingInvites.map(invite => (
              <div 
                key={invite.id}
                className="bg-arx-darker rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-semibold">{invite.roomName}</p>
                  <p className="text-sm text-gray-500">von {invite.fromUserName}</p>
                </div>
                <button
                  onClick={() => handleNotificationClick(invite)}
                  className="px-4 py-2 bg-arx-gold text-arx-darker rounded-lg hover:bg-arx-gold-dark transition-colors font-semibold"
                >
                  Ansehen →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      <div className="mt-8 bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
        <h2 className="font-medieval text-xl text-arx-purple mb-6">
          🔔 Letzte Benachrichtigungen
        </h2>
        
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Keine Benachrichtigungen</p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 10).map(notification => (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  notification.read 
                    ? 'bg-arx-darker hover:bg-arx-purple/10' 
                    : 'bg-arx-purple/10 hover:bg-arx-purple/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1">
                    <p className={notification.read ? 'text-gray-400' : 'text-white'}>
                      {getNotificationText(notification)}
                    </p>
                    {notification.message && (
                      <p className="text-sm text-gray-500 mt-1">"{notification.message}"</p>
                    )}
                  </div>
                  {!notification.read && (
                    <span className="w-3 h-3 bg-arx-gold rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
