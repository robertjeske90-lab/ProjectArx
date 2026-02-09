import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (password !== confirmPassword) {
      return setError('Passwörter stimmen nicht überein');
    }
    
    if (password.length < 6) {
      return setError('Passwort muss mindestens 6 Zeichen lang sein');
    }
    
    if (displayName.trim().length < 2) {
      return setError('Benutzername muss mindestens 2 Zeichen lang sein');
    }
    
    setLoading(true);
    
    const result = await register(email, password, displayName.trim());
    
    if (result.success) {
      navigate('/characters');
    } else {
      setError(translateError(result.error));
    }
    
    setLoading(false);
  };
  
  // Translate Firebase errors to German
  const translateError = (error) => {
    if (error.includes('email-already-in-use')) return 'Diese E-Mail-Adresse wird bereits verwendet';
    if (error.includes('invalid-email')) return 'Ungültige E-Mail-Adresse';
    if (error.includes('weak-password')) return 'Das Passwort ist zu schwach';
    return 'Ein Fehler ist aufgetreten: ' + error;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-medieval text-4xl text-arx-gold mb-2">Werde ein Held</h1>
          <p className="text-gray-400">Erstelle dein Konto und beginne dein Abenteuer</p>
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
              <label className="block text-gray-300 mb-2">Benutzername</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple transition-colors"
                placeholder="Dein Heldenname"
              />
            </div>
            
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
                placeholder="Mindestens 6 Zeichen"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Passwort bestätigen</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple transition-colors"
                placeholder="Passwort wiederholen"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-arx-purple to-arx-purple-dark text-white font-semibold rounded-lg hover:from-arx-purple-dark hover:to-arx-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird erstellt...' : 'Konto erstellen'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Bereits registriert?{' '}
              <Link to="/login" className="text-arx-gold hover:underline">
                Jetzt anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
