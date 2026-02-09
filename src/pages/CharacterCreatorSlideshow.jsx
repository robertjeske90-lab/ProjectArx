import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import gameData from '../data/gameData.json';

import SlideIntro from '../components/creator/SlideIntro';
import SlideName from '../components/creator/SlideName';
import SlideRace from '../components/creator/SlideRace';
import SlideHomeland from '../components/creator/SlideHomeland';
import SlideCulture from '../components/creator/SlideCulture';
import SlideUpbringing from '../components/creator/SlideUpbringing';
import SlideTraining from '../components/creator/SlideTraining';
import SlideCalling from '../components/creator/SlideCalling';
import SlideAlignment from '../components/creator/SlideAlignment';
import SlideSummary from '../components/creator/SlideSummary';

const SLIDES = [
  { id: 'intro', component: SlideIntro, title: 'Willkommen' },
  { id: 'name', component: SlideName, title: 'Name' },
  { id: 'fatherRace', component: SlideRace, title: 'Vaters Rasse', props: { parent: 'father' } },
  { id: 'motherRace', component: SlideRace, title: 'Mutters Rasse', props: { parent: 'mother' } },
  { id: 'homeland', component: SlideHomeland, title: 'Heimat' },
  { id: 'culture', component: SlideCulture, title: 'Kultur' },
  { id: 'upbringing', component: SlideUpbringing, title: 'Erziehung' },
  { id: 'training', component: SlideTraining, title: 'Ausbildung' },
  { id: 'calling', component: SlideCalling, title: 'Aufbruch' },
  { id: 'alignment', component: SlideAlignment, title: 'Gesinnung' },
  { id: 'summary', component: SlideSummary, title: 'Zusammenfassung' },
];

export default function CharacterCreatorSlideshow() {
  const navigate = useNavigate();
  const { createCharacterV2 } = useCharacters();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const [characterData, setCharacterData] = useState({
    name: '',
    alias: '',
    fatherRace: null,
    fatherName: '',
    motherRace: null,
    motherName: '',
    homeland: null,
    homelandName: '',
    culture: null,
    upbringing: null,
    training: null,
    calling: null,
    alignment: { moral: 0, order: 0, focus: 0 },
    backstory: {},
    portrait: null,
    portraitPreview: null,
  });

  const calculateStats = () => {
    const stats = {
      attributes: {},
      vitals: {},
      skills: {},
      exp: 0,
      expMod: 1.0,
    };

    // Initialize with base values
    Object.entries(gameData.attributes).forEach(([key, attr]) => {
      stats.attributes[key] = attr.baseValue;
    });
    Object.entries(gameData.vitals).forEach(([key, vital]) => {
      stats.vitals[key] = vital.baseValue;
    });

    // Collect all boni
    const allBoni = [];
    
    // Father race (halved)
    if (characterData.fatherRace) {
      const race = gameData.backgrounds.races[characterData.fatherRace];
      race?.boni?.forEach(b => allBoni.push({ ...b, factor: 0.5 }));
    }
    
    // Mother race (halved)
    if (characterData.motherRace) {
      const race = gameData.backgrounds.races[characterData.motherRace];
      race?.boni?.forEach(b => allBoni.push({ ...b, factor: 0.5 }));
    }
    
    // Other backgrounds (full)
    ['homeland', 'culture', 'upbringing', 'training', 'calling'].forEach(bgType => {
      const bgId = characterData[bgType];
      if (!bgId) return;
      
      const bgCategory = bgType === 'homeland' ? 'homelands' : 
                        bgType === 'culture' ? 'cultures' :
                        bgType === 'upbringing' ? 'upbringings' :
                        bgType === 'training' ? 'trainings' : 'callings';
      
      const bg = gameData.backgrounds[bgCategory]?.[bgId];
      bg?.boni?.forEach(b => allBoni.push({ ...b, factor: 1.0 }));
    });

    // Apply boni
    allBoni.forEach(bonus => {
      const value = Math.round(bonus.wert * bonus.factor);
      
      switch (bonus.typ) {
        case 'Attribut':
          if (stats.attributes[bonus.ziel] !== undefined) {
            stats.attributes[bonus.ziel] += value;
          }
          break;
        case 'Vital':
          if (stats.vitals[bonus.ziel] !== undefined) {
            stats.vitals[bonus.ziel] += value;
          }
          break;
        case 'Skill':
          if (!stats.skills[bonus.ziel]) stats.skills[bonus.ziel] = 0;
          stats.skills[bonus.ziel] += value;
          break;
        case 'Exp':
          stats.exp += value;
          break;
        case 'ExpMod':
          stats.expMod *= bonus.wert;
          break;
      }
    });

    stats.expMod = Math.round(stats.expMod * 100) / 100;
    return stats;
  };

  const updateCharacter = (updates) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const canProceed = () => {
    const slide = SLIDES[currentSlide];
    switch (slide.id) {
      case 'intro': return true;
      case 'name': return characterData.name.trim().length > 0;
      case 'fatherRace': return characterData.fatherRace !== null;
      case 'motherRace': return characterData.motherRace !== null;
      case 'homeland': return characterData.homeland !== null;
      case 'culture': return characterData.culture !== null;
      case 'upbringing': return characterData.upbringing !== null;
      case 'training': return characterData.training !== null;
      case 'calling': return characterData.calling !== null;
      case 'alignment': return true;
      case 'summary': return true;
      default: return true;
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const stats = calculateStats();
      
      const newChar = await createCharacterV2({
        name: characterData.name,
        alias: characterData.alias,
        backgrounds: {
          fatherRace: characterData.fatherRace,
          fatherName: characterData.fatherName,
          motherRace: characterData.motherRace,
          motherName: characterData.motherName,
          homeland: characterData.homeland,
          homelandName: characterData.homelandName,
          culture: characterData.culture,
          upbringing: characterData.upbringing,
          training: characterData.training,
          calling: characterData.calling,
        },
        alignment: characterData.alignment,
        backstory: characterData.backstory,
        attributes: stats.attributes,
        vitals: stats.vitals,
        skills: stats.skills,
        experience: {
          total: stats.exp,
          spent: 0,
          available: stats.exp,
          modifier: stats.expMod,
        },
      }, characterData.portrait);

      navigate(`/characters/${newChar.id}`);
    } catch (err) {
      console.error('Error creating character:', err);
      alert('Fehler beim Erstellen: ' + err.message);
    }
    setSaving(false);
  };

  const CurrentSlideComponent = SLIDES[currentSlide].component;
  const slideProps = SLIDES[currentSlide].props || {};
  const stats = calculateStats();
  const progress = ((currentSlide + 1) / SLIDES.length) * 100;

  return (
    <div className="min-h-screen bg-arx-darker flex flex-col">
      {/* Progress Bar */}
      <div className="h-1 bg-arx-dark">
        <div 
          className="h-full bg-gradient-to-r from-arx-purple to-arx-gold transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <CurrentSlideComponent
            data={characterData}
            updateData={updateCharacter}
            stats={stats}
            gameData={gameData}
            goNext={goNext}
            goBack={goBack}
            onCreate={handleCreate}
            saving={saving}
            {...slideProps}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-arx-purple/20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={currentSlide === 0}
            className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Zurück
          </button>

          <div className="flex gap-2">
            {SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide 
                    ? 'bg-arx-gold w-6' 
                    : idx < currentSlide 
                      ? 'bg-arx-purple' 
                      : 'bg-arx-dark'
                }`}
              />
            ))}
          </div>

          {currentSlide < SLIDES.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="px-6 py-3 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-arx-gold to-arx-gold-dark text-arx-darker font-bold rounded-lg hover:from-arx-gold-dark hover:to-arx-gold disabled:opacity-50 transition-all"
            >
              {saving ? 'Erschaffe...' : '✨ Charakter erschaffen'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
