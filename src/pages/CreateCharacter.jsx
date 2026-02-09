import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import AttributeSlider from '../components/AttributeSlider';
import SkillSlider from '../components/SkillSlider';

export default function CreateCharacter() {
  const navigate = useNavigate();
  const { createCharacter } = useCharacters();
  
  const [name, setName] = useState('');
  const [portrait, setPortrait] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState(null);
  const [attributes, setAttributes] = useState({
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    constitution: 10,
    wisdom: 10,
    charisma: 10
  });
  const [skills, setSkills] = useState({
    combat: 0,
    magic: 0,
    social: 0,
    crafting: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle portrait selection
  const handlePortraitChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Bild darf maximal 5MB groß sein');
        return;
      }
      setPortrait(file);
      setPortraitPreview(URL.createObjectURL(file));
    }
  };

  // Handle attribute change
  const handleAttributeChange = (name, value) => {
    setAttributes(prev => ({ ...prev, [name]: value }));
  };

  // Handle skill change
  const handleSkillChange = (name, value) => {
    setSkills(prev => ({ ...prev, [name]: value }));
  };

  // Calculate totals
  const totalAttributes = Object.values(attributes).reduce((a, b) => a + b, 0);
  const totalSkills = Object.values(skills).reduce((a, b) => a + b, 0);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Bitte gib einen Namen für deinen Charakter ein');
      return;
    }
    
    setLoading(true);
    
    try {
      await createCharacter({ name: name.trim(), attributes, skills }, portrait);
      navigate('/characters');
    } catch (err) {
      setError('Fehler beim Erstellen des Charakters: ' + err.message);
    }
    
    setLoading(false);
  };

  // Attribute labels in German
  const attributeLabels = {
    strength: 'Stärke (STR)',
    dexterity: 'Geschick (DEX)',
    intelligence: 'Intelligenz (INT)',
    constitution: 'Konstitution (CON)',
    wisdom: 'Weisheit (WIS)',
    charisma: 'Charisma (CHA)'
  };

  // Skill labels in German
  const skillLabels = {
    combat: 'Kampf',
    magic: 'Magie',
    social: 'Sozial',
    crafting: 'Handwerk'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-medieval text-4xl text-arx-gold mb-2">Charakter erstellen</h1>
        <p className="text-gray-400">Erschaffe deinen Helden für das Abenteuer</p>
        <p className="text-gray-500 text-sm mt-2">
          (MVP: Placeholder Stats - echtes System kommt in Phase 2)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Portrait & Name */}
          <div className="lg:col-span-1">
            <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6 sticky top-24">
              {/* Portrait Upload */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-4 text-center">Portrait</label>
                <div className="relative">
                  <div className="w-full aspect-square bg-arx-darker rounded-xl overflow-hidden border-2 border-dashed border-arx-purple/30 hover:border-arx-purple/60 transition-colors">
                    {portraitPreview ? (
                      <img 
                        src={portraitPreview} 
                        alt="Portrait Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Bild hochladen</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortraitChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Max. 5MB • JPG, PNG, GIF
                </p>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={50}
                  className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple transition-colors"
                  placeholder="Wie heißt dein Held?"
                />
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-arx-darker rounded-lg">
                  <div className="text-2xl font-bold text-arx-purple">{totalAttributes}</div>
                  <div className="text-xs text-gray-500">Attribut-Punkte</div>
                </div>
                <div className="text-center p-3 bg-arx-darker rounded-lg">
                  <div className="text-2xl font-bold text-emerald-500">{totalSkills}</div>
                  <div className="text-xs text-gray-500">Skill-Punkte</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Attributes & Skills */}
          <div className="lg:col-span-2 space-y-8">
            {/* Attributes */}
            <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
              <h2 className="font-medieval text-2xl text-arx-purple mb-6">Attribute</h2>
              <p className="text-gray-500 text-sm mb-6">
                Attribute definieren die grundlegenden Fähigkeiten deines Charakters. 
                Werte reichen von 1 (sehr schwach) bis 20 (legendär).
              </p>
              
              {Object.entries(attributes).map(([key, value]) => (
                <AttributeSlider
                  key={key}
                  name={key}
                  label={attributeLabels[key]}
                  value={value}
                  onChange={handleAttributeChange}
                  min={1}
                  max={20}
                />
              ))}
            </div>

            {/* Skills */}
            <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
              <h2 className="font-medieval text-2xl text-emerald-500 mb-6">Skills</h2>
              <p className="text-gray-500 text-sm mb-6">
                Skills repräsentieren erlernte Fähigkeiten. In Phase 2 werden diese 
                durch progressive Skill Trees ersetzt.
              </p>
              
              {Object.entries(skills).map(([key, value]) => (
                <SkillSlider
                  key={key}
                  name={key}
                  label={skillLabels[key]}
                  value={value}
                  onChange={handleSkillChange}
                  min={0}
                  max={100}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/characters')}
                className="flex-1 py-4 border-2 border-gray-600 text-gray-400 font-semibold rounded-xl hover:border-gray-500 hover:text-gray-300 transition-all"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-arx-purple to-arx-gold text-white font-semibold rounded-xl hover:from-arx-purple-dark hover:to-arx-gold-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird erstellt...' : 'Charakter erstellen'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
