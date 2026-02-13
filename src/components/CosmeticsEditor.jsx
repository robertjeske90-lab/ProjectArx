import { useState } from 'react';
import { COSMETIC_OPTIONS } from './creator/SlideCosmetics';
import AvatarCreator, { AvatarPreview } from './avatar/AvatarCreator';

export default function CosmeticsEditor({ character, onUpdate, isEditing }) {
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  
  const cosmetics = character?.cosmetics || {
    title: 'none',
    customTitle: '',
    hairColor: 'brown',
    eyeColor: 'brown',
    skinFeatures: [],
    distinctiveFeatures: [],
    notes: ''
  };

  // FIX: Nur cosmetics updaten, keine anderen Felder
  const handleCosmeticUpdate = async (field, value) => {
    const updatedCosmetics = {
      title: cosmetics.title || 'none',
      customTitle: cosmetics.customTitle || '',
      hairColor: cosmetics.hairColor || 'brown',
      eyeColor: cosmetics.eyeColor || 'brown',
      skinFeatures: cosmetics.skinFeatures || [],
      distinctiveFeatures: cosmetics.distinctiveFeatures || [],
      notes: cosmetics.notes || '',
      [field]: value
    };
    
    // Nur cosmetics Feld senden, nicht andere Felder die undefined sein könnten
    await onUpdate({ cosmetics: updatedCosmetics });
  };

  const handleAvatarSave = async (avatar) => {
    await onUpdate({ avatar });
    setShowAvatarCreator(false);
  };

  const getTitle = () => {
    if (!cosmetics.title || cosmetics.title === 'none') return null;
    if (cosmetics.title === 'custom') return cosmetics.customTitle;
    return COSMETIC_OPTIONS.titles.find(t => t.id === cosmetics.title)?.label;
  };

  const getHairColor = () => COSMETIC_OPTIONS.hairColors.find(c => c.id === cosmetics.hairColor);
  const getEyeColor = () => COSMETIC_OPTIONS.eyeColors.find(c => c.id === cosmetics.eyeColor);

  if (showAvatarCreator) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-arx-darker rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <AvatarCreator
            initialAvatar={character?.avatar}
            onSave={handleAvatarSave}
            onCancel={() => setShowAvatarCreator(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-4">
      <h2 className="font-medieval text-lg text-arx-purple mb-4 flex items-center justify-between">
        <span>🎭 Aussehen & Merkmale</span>
        {isEditing && (
          <span className="text-xs font-normal text-emerald-400">Bearbeitbar</span>
        )}
      </h2>
      
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-arx-darker rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
            {character?.avatar ? (
              <AvatarPreview avatar={character.avatar} size={64} />
            ) : (
              <div className="text-gray-500 text-2xl">
                👤
              </div>
            )}
          </div>
          <div className="flex-1">
            <span className="text-gray-400 text-sm">Avatar</span>
            {isEditing && (
              <button
                onClick={() => setShowAvatarCreator(true)}
                className="block mt-1 text-arx-gold text-sm hover:underline"
              >
                ✏️ {character?.avatar ? 'Bearbeiten' : 'Erstellen'}
              </button>
            )}
          </div>
        </div>

        {/* Titel */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Titel</span>
          {isEditing ? (
            <select
              value={cosmetics.title || 'none'}
              onChange={(e) => handleCosmeticUpdate('title', e.target.value)}
              className="bg-arx-darker border border-arx-purple/30 rounded px-2 py-1 text-sm text-white"
            >
              {COSMETIC_OPTIONS.titles.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          ) : (
            <span className="text-white">{getTitle() || '-'}</span>
          )}
        </div>

        {/* Custom Title Input */}
        {isEditing && cosmetics.title === 'custom' && (
          <input
            type="text"
            value={cosmetics.customTitle || ''}
            onChange={(e) => handleCosmeticUpdate('customTitle', e.target.value)}
            placeholder="Eigener Titel..."
            className="w-full bg-arx-darker border border-arx-purple/30 rounded px-3 py-2 text-sm text-white"
          />
        )}

        {/* Haarfarbe */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Haarfarbe</span>
          {isEditing ? (
            <div className="flex gap-1 flex-wrap justify-end">
              {COSMETIC_OPTIONS.hairColors.slice(0, 8).map(color => (
                <button
                  key={color.id}
                  onClick={() => handleCosmeticUpdate('hairColor', color.id)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    cosmetics.hairColor === color.id ? 'border-arx-gold' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getHairColor()?.color }}
              />
              <span className="text-white text-sm">{getHairColor()?.label || '-'}</span>
            </div>
          )}
        </div>

        {/* Augenfarbe */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Augenfarbe</span>
          {isEditing ? (
            <div className="flex gap-1 flex-wrap justify-end">
              {COSMETIC_OPTIONS.eyeColors.slice(0, 8).map(color => (
                <button
                  key={color.id}
                  onClick={() => handleCosmeticUpdate('eyeColor', color.id)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    cosmetics.eyeColor === color.id ? 'border-arx-gold' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getEyeColor()?.color }}
              />
              <span className="text-white text-sm">{getEyeColor()?.label || '-'}</span>
            </div>
          )}
        </div>

        {/* Merkmale (compact display) */}
        {((cosmetics.skinFeatures?.length > 0) || (cosmetics.distinctiveFeatures?.length > 0)) && (
          <div>
            <span className="text-gray-400 text-sm block mb-1">Merkmale</span>
            <div className="flex flex-wrap gap-1">
              {[...(cosmetics.skinFeatures || []), ...(cosmetics.distinctiveFeatures || [])]
                .filter(f => f && f !== 'none')
                .map(f => {
                  const label = COSMETIC_OPTIONS.skinFeatures.find(s => s.id === f)?.label ||
                               COSMETIC_OPTIONS.distinctiveFeatures.find(d => d.id === f)?.label || f;
                  return (
                    <span key={f} className="px-2 py-0.5 bg-arx-purple/20 rounded text-xs text-gray-300">
                      {label}
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* Notizen */}
        {cosmetics.notes && (
          <div>
            <span className="text-gray-400 text-sm block mb-1">Notizen</span>
            <p className="text-gray-300 text-sm italic">"{cosmetics.notes}"</p>
          </div>
        )}

        {/* Physical (read-only display) */}
        {character?.physical && (
          <div className="pt-2 border-t border-arx-purple/20">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="text-gray-500">Alter</div>
                <div className="text-white">{character.physical.age || '?'}</div>
              </div>
              <div>
                <div className="text-gray-500">Größe</div>
                <div className="text-white">{character.physical.height || '?'} cm</div>
              </div>
              <div>
                <div className="text-gray-500">Gewicht</div>
                <div className="text-white">{character.physical.weight || '?'} kg</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
