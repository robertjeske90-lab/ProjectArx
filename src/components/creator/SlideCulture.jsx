export default function SlideCulture({ data, updateData, gameData }) {
  const cultures = Object.values(gameData.backgrounds.cultures);

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
        Welche Kultur prägte dich?
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Die Werte und Traditionen deines Volkes haben deinen Charakter geformt.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cultures.map(culture => (
          <button
            key={culture.id}
            onClick={() => updateData({ culture: culture.id })}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              data.culture === culture.id
                ? 'bg-arx-purple/30 border-arx-gold'
                : 'bg-arx-dark border-arx-purple/20 hover:border-arx-purple/50'
            }`}
          >
            <div className="text-3xl mb-2">{culture.icon}</div>
            <div className="text-white font-semibold text-sm">{culture.name}</div>
            <div className="text-gray-500 text-xs mt-1 h-8">
              {getBoniPreview(culture) || 'Ausgeglichen'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
