import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameRooms } from '../hooks/useGameRooms';
import { useCharacters } from '../hooks/useCharacters';
import AttributeSlider from '../components/AttributeSlider';
import SkillSlider from '../components/SkillSlider';

export default function RoomCharacterCreator() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoom, submitCharacterForRoom } = useGameRooms();
  const { createCharacter } = useCharacters();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [portrait, setPortrait] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState(null);
  
  // Default attributes & skills
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

  // Room settings / limits
  const [limits, setLimits] = useState({
    maxAttributePoints: 60,
    maxPerAttribute: 18,
    maxSkillPoints: 200,
    maxPerSkill: 100
  });

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const roomData = await getRoom(id);
      if (!roomData) {
        setError('Runde nicht gefunden');
      } else {
        setRoom(roomData);
        setLimits({
          maxAttributePoints: roomData.settings?.maxAttributePoints || 60,
          maxPerAttribute: roomData.settings?.maxPerAttribute || 18,
          maxSkillPoints: roomData.settings?.maxSkillPoints || 200,
          maxPerSkill: roomData.settings?.maxPerSkill || 100
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalAttributes = Object.values(attributes).reduce((a, b) => a + b, 0);
  const totalSkills = Object.values(skills).reduce((a, b) => a + b, 0);
  
  // Check if within limits
  const attributesValid = totalAttributes <= limits.maxAttributePoints;
  const skillsValid = totalSkills <= limits.maxSkillPoints;
  const allAttributesValid = Object.values(attributes).every(v => v <= limits.maxPerAttribute);
  const allSkillsValid = Object.values(skills).every(v => v <= limits.maxPerSkill);

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

  const handleAttributeChange = (name, value) => {
    // Enforce max per attribute
    const clampedValue = Math.min(value, limits.maxPerAttribute);
    setAttributes(prev => ({ ...prev, [name]: clampedValue }));
  };

  const handleSkillChange = (name, value) => {
    // Enforce max per skill
    const clampedValue = Math.min(value, limits.maxPerSkill);
    setSkills(prev => ({ ...prev, [name]: clampedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Bitte gib einen Namen ein');
      return;
    }
    
    if (!attributesValid || !allAttributesValid) {
      setError(`Attribute überschreiten das Limit (max ${limits.maxAttributePoints} Punkte, max ${limits.maxPerAttribute} pro Attribut)`);
      return;
    }
    
    if (!skillsValid || !allSkillsValid) {
      setError(`Skills überschreiten das Limit (max ${limits.maxSkillPoints} Punkte, max ${limits.maxPerSkill} pro Skill)`);
      return;
    }
    
    setSaving(true);
    
    try {
      // Create the character first
      const newChar = await createCharacter(
        { name: name.trim(), attributes, skills },
        portrait
      );
      
      // Then submit it for this room
      await submitCharacterForRoom(id, newChar.id, name.trim());
      
      navigate('/rooms');
    } catch (err) {
      setError(err.message);
    }
    
    setSaving(false);
  };

  const attributeLabels = {
    strength: 'Stärke (STR)',
    dexterity: 'Geschick (DEX)',
    intelligence: 'Intelligenz (INT)',
    constitution: 'Konstitution (CON)',
    wisdom: 'Weisheit (WIS)',
    charisma: 'Charisma (CHA)'
  };

  const skillLabels = {
    combat: 'Kampf',
    magic: 'Magie',
    social: 'Sozial',
    crafting: 'Handwerk'
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-arx-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-400">{error || 'Runde nicht gefunden'}</p>
          <Link to="/rooms" className="text-arx-purple hover:text-arx-gold mt-4 inline-block">← Zurück</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link to="/rooms" className="text-gray-400 hover:text-arx-gold text-sm mb-2 inline-block">
          ← Zurück zu meinen Runden
        </Link>
        <h1 className="font-medieval text-4xl text-arx-gold mb-2">Charakter erstellen</h1>
        <p className="text-gray-400">für <span className="text-arx-purple">{room.name}</span></p>
      </div>

      {/* Room Rules */}
      <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-4 mb-8">
        <h3 className="text-sm text-gray-400 mb-3">📋 Regeln dieser Runde:</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${attributesValid && allAttributesValid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Attribut-Punkte:</span>
              <span className={attributesValid ? 'text-green-400' : 'text-red-400'}>
                {totalAttributes} / {limits.maxAttributePoints}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Max {limits.maxPerAttribute} pro Attribut</div>
          </div>
          <div className={`p-3 rounded-lg ${skillsValid && allSkillsValid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Skill-Punkte:</span>
              <span className={skillsValid ? 'text-green-400' : 'text-red-400'}>
                {totalSkills} / {limits.maxSkillPoints}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Max {limits.maxPerSkill} pro Skill</div>
          </div>
        </div>
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
              {/* Portrait */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-4 text-center">Portrait</label>
                <div className="relative">
                  <div className="w-full aspect-square bg-arx-darker rounded-xl overflow-hidden border-2 border-dashed border-arx-purple/30 hover:border-arx-purple/60">
                    {portraitPreview ? (
                      <img src={portraitPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <span className="text-4xl mb-2">📷</span>
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
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={50}
                  className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500"
                  placeholder="Wie heißt dein Held?"
                />
              </div>

              {/* Points Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`text-center p-3 rounded-lg ${attributesValid ? 'bg-arx-darker' : 'bg-red-500/20'}`}>
                  <div className={`text-2xl font-bold ${attributesValid ? 'text-arx-purple' : 'text-red-400'}`}>
                    {totalAttributes}
                  </div>
                  <div className="text-xs text-gray-500">/ {limits.maxAttributePoints}</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${skillsValid ? 'bg-arx-darker' : 'bg-red-500/20'}`}>
                  <div className={`text-2xl font-bold ${skillsValid ? 'text-emerald-500' : 'text-red-400'}`}>
                    {totalSkills}
                  </div>
                  <div className="text-xs text-gray-500">/ {limits.maxSkillPoints}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Attributes & Skills */}
          <div className="lg:col-span-2 space-y-8">
            {/* Attributes */}
            <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
              <h2 className="font-medieval text-2xl text-arx-purple mb-6">Attribute</h2>
              
              {Object.entries(attributes).map(([key, value]) => (
                <AttributeSlider
                  key={key}
                  name={key}
                  label={attributeLabels[key]}
                  value={value}
                  onChange={handleAttributeChange}
                  min={1}
                  max={limits.maxPerAttribute}
                />
              ))}
            </div>

            {/* Skills */}
            <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
              <h2 className="font-medieval text-2xl text-emerald-500 mb-6">Skills</h2>
              
              {Object.entries(skills).map(([key, value]) => (
                <SkillSlider
                  key={key}
                  name={key}
                  label={skillLabels[key]}
                  value={value}
                  onChange={handleSkillChange}
                  min={0}
                  max={limits.maxPerSkill}
                />
              ))}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Link
                to="/rooms"
                className="flex-1 py-4 text-center border-2 border-gray-600 text-gray-400 font-semibold rounded-xl hover:border-gray-500"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={saving || !attributesValid || !skillsValid || !allAttributesValid || !allSkillsValid}
                className="flex-1 py-4 bg-gradient-to-r from-arx-purple to-arx-gold text-white font-semibold rounded-xl hover:from-arx-purple-dark hover:to-arx-gold-dark disabled:opacity-50"
              >
                {saving ? 'Wird erstellt...' : '✨ Charakter einreichen'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
