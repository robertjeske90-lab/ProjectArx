export default function SlideSummary({ data, updateData, stats, gameData }) {
  const getRaceName = (id) => gameData.backgrounds.races[id]?.name || '?';
  const getRaceIcon = (id) => gameData.backgrounds.races[id]?.icon || '?';
  const getHomelandName = (id) => gameData.backgrounds.homelands[id]?.name || '?';
  const getCultureName = (id) => gameData.backgrounds.cultures[id]?.name || '?';
  const getUpbringingName = (id) => gameData.backgrounds.upbringings[id]?.name || '?';
  const getTrainingName = (id) => gameData.backgrounds.trainings[id]?.name || '?';
  const getCallingName = (id) => gameData.backgrounds.callings[id]?.name || '?';
  const getCallingIcon = (id) => gameData.backgrounds.callings[id]?.icon || '?';

  const handlePortraitChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Bild darf maximal 5MB groß sein');
        return;
      }
      updateData({
        portrait: file,
        portraitPreview: URL.createObjectURL(file)
      });
    }
  };

  const coreAttributes = ['koerper', 'geschick', 'konstitution', 'geist', 'wahrnehmung', 'psyche', 'charisma', 'intuition', 'fassade'];

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-6 text-center">
        Dein Held ist bereit
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-arx-dark rounded-xl p-4 border border-arx-purple/30">
            <div className="relative mb-4">
              <div className="w-full aspect-square bg-arx-darker rounded-xl overflow-hidden border-2 border-dashed border-arx-purple/30 hover:border-arx-purple/60 cursor-pointer transition-colors">
                {data.portraitPreview ? (
                  <img src={data.portraitPreview} alt="Portrait" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-sm">Portrait hochladen</span>
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

            <h3 className="font-medieval text-2xl text-arx-gold text-center">{data.name}</h3>
            {data.alias && <p className="text-gray-500 text-center text-sm">"{data.alias}"</p>}

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-400">Abstammung: </span>
              <div className="text-white mt-1">
                {getRaceIcon(data.fatherRace)} {getRaceName(data.fatherRace)} / {getRaceIcon(data.motherRace)} {getRaceName(data.motherRace)}
              </div>
            </div>
          </div>

          <div className="bg-arx-dark rounded-xl p-4 mt-4 border border-emerald-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Start-EP:</span>
              <span className="text-emerald-400 font-bold text-xl">{stats.exp}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400">EP-Multiplikator:</span>
              <span className={`font-bold ${stats.expMod < 1 ? 'text-red-400' : stats.expMod > 1 ? 'text-emerald-400' : 'text-white'}`}>
                ×{stats.expMod}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-arx-dark rounded-xl p-4 border border-arx-purple/20">
            <h4 className="text-arx-purple font-semibold mb-3">Hintergrund</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Heimat:</span> <span className="text-white">{getHomelandName(data.homeland)}</span></div>
              <div><span className="text-gray-500">Kultur:</span> <span className="text-white">{getCultureName(data.culture)}</span></div>
              <div><span className="text-gray-500">Erziehung:</span> <span className="text-white">{getUpbringingName(data.upbringing)}</span></div>
              <div><span className="text-gray-500">Ausbildung:</span> <span className="text-white">{getTrainingName(data.training)}</span></div>
              <div className="col-span-2">
                <span className="text-gray-500">Aufbruch:</span> 
                <span className="text-white ml-1">{getCallingIcon(data.calling)} {getCallingName(data.calling)}</span>
              </div>
            </div>
          </div>

          <div className="bg-arx-dark rounded-xl p-4 border border-arx-purple/20">
            <h4 className="text-arx-purple font-semibold mb-3">Attribute</h4>
            <div className="grid grid-cols-3 gap-2">
              {coreAttributes.map(attrKey => {
                const attr = gameData.attributes[attrKey];
                const value = stats.attributes[attrKey] || 10;
                const diff = value - 10;
                return (
                  <div key={attrKey} className="flex justify-between items-center bg-arx-darker rounded px-3 py-2">
                    <span className="text-gray-400 text-sm truncate">{attr?.name || attrKey}</span>
                    <span className={`font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-white'}`}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {Object.keys(stats.skills).length > 0 && (
            <div className="bg-arx-dark rounded-xl p-4 border border-arx-purple/20">
              <h4 className="text-arx-purple font-semibold mb-3">Start-Fertigkeiten</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.skills).map(([skillKey, value]) => {
                  const skill = gameData.skills[skillKey];
                  return (
                    <span key={skillKey} className="px-3 py-1 bg-arx-darker rounded-full text-sm">
                      <span className="text-gray-400">{skill?.name || skillKey}</span>
                      <span className="text-emerald-400 ml-2">+{value}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-arx-dark rounded-xl p-4 border border-arx-purple/20">
            <h4 className="text-arx-purple font-semibold mb-3">Gesinnung</h4>
            <div className="flex gap-4 text-sm flex-wrap">
              <span className={data.alignment.moral > 0.3 ? 'text-emerald-400' : data.alignment.moral < -0.3 ? 'text-red-400' : 'text-gray-400'}>
                {data.alignment.moral > 0.3 ? '😇 Gut' : data.alignment.moral < -0.3 ? '😈 Böse' : '😐 Neutral'}
              </span>
              <span className={data.alignment.order > 0.3 ? 'text-blue-400' : data.alignment.order < -0.3 ? 'text-orange-400' : 'text-gray-400'}>
                {data.alignment.order > 0.3 ? '⚖️ Rechtschaffen' : data.alignment.order < -0.3 ? '🔥 Chaotisch' : '😐 Neutral'}
              </span>
              <span className={data.alignment.focus > 0.3 ? 'text-yellow-400' : data.alignment.focus < -0.3 ? 'text-purple-400' : 'text-gray-400'}>
                {data.alignment.focus > 0.3 ? '👥 Gemeinnützig' : data.alignment.focus < -0.3 ? '👤 Eigennützig' : '😐 Neutral'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
