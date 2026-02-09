export default function SlideHomeland({ data, updateData, gameData }) {
  const homelands = Object.values(gameData.backgrounds.homelands);

  const getBoniPreview = (item) => {
    const preview = [];
    item.boni?.forEach(b => {
      const sign = b.wert > 0 ? '+' : '';
      if (b.typ === 'Attribut') preview.push(`${sign}${b.wert} ${b.ziel}`);
      if (b.typ === 'Skill') preview.push(`${sign}${b.wert} ${b.ziel}`);
    });
    return preview.join(', ');
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Wo bist du aufgewachsen?
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Deine Heimat hat dich geformt und dir erste Fertigkeiten beigebracht.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {homelands.map(homeland => (
          <button
            key={homeland.id}
            onClick={() => updateData({ homeland: homeland.id })}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              data.homeland === homeland.id
                ? 'bg-arx-purple/30 border-arx-gold'
                : 'bg-arx-dark border-arx-purple/20 hover:border-arx-purple/50'
            }`}
          >
            <div className="text-3xl mb-2">{homeland.icon}</div>
            <div className="text-white font-semibold">{homeland.name}</div>
            <div className="text-gray-500 text-xs mt-1">
              {getBoniPreview(homeland) || 'Keine Boni'}
            </div>
          </button>
        ))}
      </div>

      {data.homeland && (
        <div className="bg-arx-dark rounded-xl p-4 border border-arx-purple/20">
          <label className="block text-gray-300 mb-2 text-sm">
            Name deiner Heimat <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={data.homelandName}
            onChange={(e) => updateData({ homelandName: e.target.value })}
            placeholder="Wie hieß der Ort?"
            maxLength={50}
            className="w-full px-4 py-2 bg-arx-darker border border-arx-purple/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-arx-purple transition-colors"
          />
        </div>
      )}
    </div>
  );
}
