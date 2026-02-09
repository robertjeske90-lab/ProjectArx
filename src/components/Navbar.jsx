import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications, getNotificationIcon, getNotificationText } from '../hooks/useNotifications';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);
    
    // Navigate based on type
    if (notification.type === 'invite' || notification.type === 'approved' || notification.type === 'needs_revision') {
      navigate(`/rooms/${notification.roomId}`);
    } else if (notification.type === 'join_request') {
      navigate(`/rooms/${notification.roomId}/manage`);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'gerade eben';
    if (diff < 3600000) return `vor ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `vor ${Math.floor(diff / 3600000)}h`;
    return `vor ${Math.floor(diff / 86400000)}d`;
  };

  return (
    <nav className="bg-arx-dark border-b border-arx-purple/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-arx-purple to-arx-gold rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="font-medieval text-2xl text-arx-gold hidden sm:block">Project Arx</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                {/* Main Nav Links */}
                <div className="hidden md:flex items-center gap-4">
                  <Link 
                    to="/characters" 
                    className="text-gray-300 hover:text-arx-gold transition-colors"
                  >
                    👤 Charaktere
                  </Link>
                  <Link 
                    to="/rooms" 
                    className="text-gray-300 hover:text-arx-gold transition-colors"
                  >
                    🎲 Spielrunden
                  </Link>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-300 hover:text-arx-gold transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-arx-dark border border-arx-purple/30 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-3 border-b border-arx-purple/20 flex justify-between items-center">
                        <span className="font-semibold text-white">Benachrichtigungen</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-arx-purple hover:text-arx-gold"
                          >
                            Alle gelesen
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Keine Benachrichtigungen
                          </div>
                        ) : (
                          notifications.slice(0, 5).map(notification => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`p-3 border-b border-arx-purple/10 cursor-pointer hover:bg-arx-purple/10 transition-colors ${!notification.read ? 'bg-arx-purple/5' : ''}`}
                            >
                              <div className="flex gap-3">
                                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notification.read ? 'text-white' : 'text-gray-400'}`}>
                                    {getNotificationText(notification)}
                                  </p>
                                  {notification.message && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      "{notification.message}"
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-600 mt-1">
                                    {formatTime(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-arx-gold rounded-full mt-2"></span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {notifications.length > 5 && (
                        <Link 
                          to="/notifications"
                          className="block p-3 text-center text-arx-purple hover:text-arx-gold text-sm border-t border-arx-purple/20"
                          onClick={() => setShowNotifications(false)}
                        >
                          Alle anzeigen
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-arx-purple/20 transition-colors"
                  >
                    <div className="w-8 h-8 bg-arx-purple rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {userProfile?.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="text-gray-300 hidden sm:block">
                      {userProfile?.displayName || 'User'}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-arx-dark border border-arx-purple/30 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-3 border-b border-arx-purple/20">
                        <p className="font-semibold text-white">{userProfile?.displayName}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                      </div>
                      
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-arx-purple/20 rounded-lg transition-colors"
                        >
                          <span>👤</span>
                          <span>Mein Profil</span>
                        </Link>
                        <Link
                          to="/characters"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-arx-purple/20 rounded-lg transition-colors md:hidden"
                        >
                          <span>⚔️</span>
                          <span>Charaktere</span>
                        </Link>
                        <Link
                          to="/rooms"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-arx-purple/20 rounded-lg transition-colors md:hidden"
                        >
                          <span>🎲</span>
                          <span>Spielrunden</span>
                        </Link>
                      </div>
                      
                      <div className="p-2 border-t border-arx-purple/20">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-arx-gold transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark transition-colors"
                >
                  Registrieren
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
