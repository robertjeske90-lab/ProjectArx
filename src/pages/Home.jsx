import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-arx-purple/20 via-arx-darker to-arx-dark"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Logo/Title */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-arx-purple to-arx-gold rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-arx-purple/30">
                <span className="text-white font-bold text-5xl">A</span>
              </div>
              <h1 className="font-medieval text-5xl lg:text-7xl text-arx-gold mb-4">
                Project Arx
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto">
                Das modulare Pen & Paper System für jedes Setting
              </p>
            </div>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-arx-dark/50 border border-arx-purple/20 rounded-xl p-6">
                <div className="text-3xl mb-3">⚔️</div>
                <h3 className="font-medieval text-arx-gold text-lg mb-2">Multi-Setting</h3>
                <p className="text-gray-400 text-sm">Von Fantasy bis Cyberpunk - ein System für alle Welten</p>
              </div>
              
              <div className="bg-arx-dark/50 border border-arx-purple/20 rounded-xl p-6">
                <div className="text-3xl mb-3">🎲</div>
                <h3 className="font-medieval text-arx-gold text-lg mb-2">Computer macht Mathe</h3>
                <p className="text-gray-400 text-sm">Du fokussierst auf Roleplay - wir rechnen im Hintergrund</p>
              </div>
              
              <div className="bg-arx-dark/50 border border-arx-purple/20 rounded-xl p-6">
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="font-medieval text-arx-gold text-lg mb-2">Community-Driven</h3>
                <p className="text-gray-400 text-sm">Teile deine Charaktere, Races und Custom Packs</p>
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <>
                  <Link 
                    to="/characters"
                    className="px-8 py-4 bg-gradient-to-r from-arx-purple to-arx-purple-dark text-white font-semibold rounded-xl hover:from-arx-purple-dark hover:to-arx-purple transition-all text-lg"
                  >
                    Meine Charaktere
                  </Link>
                  <Link 
                    to="/create-character"
                    className="px-8 py-4 border-2 border-arx-gold text-arx-gold font-semibold rounded-xl hover:bg-arx-gold/10 transition-all text-lg"
                  >
                    Neuen Charakter erstellen
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register"
                    className="px-8 py-4 bg-gradient-to-r from-arx-purple to-arx-purple-dark text-white font-semibold rounded-xl hover:from-arx-purple-dark hover:to-arx-purple transition-all text-lg"
                  >
                    Jetzt starten
                  </Link>
                  <Link 
                    to="/login"
                    className="px-8 py-4 border-2 border-arx-gold text-arx-gold font-semibold rounded-xl hover:bg-arx-gold/10 transition-all text-lg"
                  >
                    Anmelden
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="bg-arx-dark py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-medieval text-3xl text-arx-gold text-center mb-12">Die Vision</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-arx-darker border border-arx-purple/20 rounded-xl p-6">
              <h3 className="text-arx-purple font-semibold text-lg mb-3">Progressive Skill Trees</h3>
              <p className="text-gray-400">
                Nahkampf (10) → Einhandklingen (10) → Langschwert (5) = 25 Total. 
                Skills vererben sich und skalieren automatisch.
              </p>
            </div>
            
            <div className="bg-arx-darker border border-arx-purple/20 rounded-xl p-6">
              <h3 className="text-arx-purple font-semibold text-lg mb-3">Tech-Level System</h3>
              <p className="text-gray-400">
                Von mittelalterlicher Fantasy bis High-Tech Sci-Fi. 
                Items und Skills funktionieren übergreifend.
              </p>
            </div>
            
            <div className="bg-arx-darker border border-arx-purple/20 rounded-xl p-6">
              <h3 className="text-arx-purple font-semibold text-lg mb-3">GOAT-Style Character Creation</h3>
              <p className="text-gray-400">
                Beantworte Fragen und dein Charakter entsteht organisch. 
                Keine Stat-Optimierung nötig.
              </p>
            </div>
            
            <div className="bg-arx-darker border border-arx-purple/20 rounded-xl p-6">
              <h3 className="text-arx-purple font-semibold text-lg mb-3">NPC Multiverse</h3>
              <p className="text-gray-400">
                Deine Charaktere können als NPCs in fremden Kampagnen auftauchen. 
                Die Welt lebt!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-arx-darker border-t border-arx-purple/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">
            Project Arx MVP • Phase 1 - Technisches Fundament
          </p>
        </div>
      </footer>
    </div>
  );
}
