import { useState } from 'react';
import AvatarCreator, { AvatarPreview } from '../avatar/AvatarCreator';

export default function SlideAvatar({ data, updateData, gameData }) {
  const [showCreator, setShowCreator] = useState(false);

  const handleSave = (avatar) => {
    updateData({ avatar });
    setShowCreator(false);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Wie sieht dein Held aus?
      </h2>
      <p className="text-gray-400 text-center mb-8 text-sm">
        Erstelle einen Avatar für deinen Charakter.
      </p>

      {!showCreator ? (
        <div className="flex flex-col items-center">
          {/* Current Avatar Preview */}
          <div className="relative w-48 h-48 bg-arx-dark rounded-xl overflow-hidden border-2 border-arx-purple/30 mb-6">
            {data.avatar ? (
              <AvatarPreview avatar={data.avatar} size={192} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <span className="text-4xl mb-2">👤</span>
                <span className="text-sm">Kein Avatar</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreator(true)}
              className="px-6 py-3 bg-gradient-to-r from-arx-purple to-arx-purple-dark text-white rounded-lg hover:from-arx-purple-dark hover:to-arx-purple transition-all font-medium"
            >
              🎨 {data.avatar ? 'Avatar bearbeiten' : 'Avatar erstellen'}
            </button>
            
            {data.avatar && (
              <button
                onClick={() => updateData({ avatar: null })}
                className="px-6 py-3 bg-arx-dark text-gray-400 rounded-lg hover:text-red-400 transition-colors"
              >
                🗑️ Entfernen
              </button>
            )}
          </div>

          {/* Skip Info */}
          <p className="text-gray-500 text-xs mt-6 text-center">
            Du kannst diesen Schritt überspringen und später einen Avatar erstellen.
          </p>
        </div>
      ) : (
        <AvatarCreator
          initialAvatar={data.avatar}
          onSave={handleSave}
          onCancel={() => setShowCreator(false)}
        />
      )}
    </div>
  );
}
