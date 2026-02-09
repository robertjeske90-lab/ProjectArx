import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Where to redirect after login
  const from = location.state?.from?.pathname || '/characters';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(translateError(result.error));
    }
    
    setLoading(false);
  };
  
  // Translate Firebase errors to German
  const translateError = (error) => {
    if (error.includes('user-not-found')) return 'Benutzer nicht gefunden';
    if (error.includes('wrong-password')) return 'Falsches Passwort';
    if (error.includes('invalid-email')) return 'Ungültige E-Mail-Adresse';
    if (error.includes('too-many-requests')) return 'Zu viele Versuche. Bitte später erneut versuchen.';
    if (error.includes('invalid-credential')) return 'Ungültige Anmeldedaten';
    return 'Ein Fehler ist aufgetreten: ' + error;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-medieval text-4xl text-arx-gold mb-2">Willkommen zurück</h1>
          <p className="text-gray-400">Melde dich an, um deine Charaktere zu verwalten</p>
        </div>
        
        {/* Form Card */}
        <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple transition-colors"
                placeholder="deine@email.de"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-arx-purple to-arx-purple-dark text-white font-semibold rounded-lg hover:from-arx-purple-dark hover:to-arx-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Noch kein Konto?{' '}
              <Link to="/register" className="text-arx-gold hover:underline">
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
