import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
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
            <span className="font-medieval text-2xl text-arx-gold">Project Arx</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {currentUser ? (
              <>
                <Link 
                  to="/characters" 
                  className="text-gray-300 hover:text-arx-gold transition-colors"
                >
                  Charaktere
                </Link>
                <Link 
                  to="/create-character" 
                  className="text-gray-300 hover:text-arx-gold transition-colors"
                >
                  Neuer Charakter
                </Link>
                
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-arx-purple/30">
                  <span className="text-gray-400 text-sm">
                    {userProfile?.displayName || currentUser.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                  >
                    Logout
                  </button>
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
