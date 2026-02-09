export default function SlideCalling({ data, updateData, gameData }) {
  const callings = Object.values(gameData.backgrounds.callings);

  const getBoniPreview = (item) => {
    const preview = [];
    item.boni?.forEach(b => {
      const sign = b.wert > 0 ? '+' : '';
      if (b.typ === 'Attribut') preview.push(`${sign}${b.wert} ${b.ziel}`);
      if (b.typ === 'Skill') preview.push(`${sign}${b.wert} ${b.ziel}`);
      if (b.typ === 'Vital') preview.push(`${sign}${b.wert} ${b.ziel}`);
      if (b.typ === 'Exp') preview.push(`${sign}${b.wert} EP`);
    });
    return preview.join(', ');
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Warum bist du aufgebrochen?
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Was hat dich dein altes Leben hinter dir lassen lassen?
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {callings.map(calling => (
          <button
            key={calling.id}
            onClick={() => updateData({ calling: calling.id })}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 text-left ${
              data.calling === calling.id
                ? 'bg-arx-purple/30 border-arx-gold'
                : 'bg-arx-dark border-arx-purple/20 hover:border-arx-purple/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{calling.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">{calling.name}</div>
                <div className="text-gray-400 text-xs mt-1 line-clamp-2">
                  {calling.description}
                </div>
                <div className="text-arx-purple text-xs mt-2">
                  {getBoniPreview(calling) || '—'}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
