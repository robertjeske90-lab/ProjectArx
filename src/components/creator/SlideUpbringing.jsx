export default function SlideUpbringing({ data, updateData, gameData }) {
  const upbringings = Object.values(gameData.backgrounds.upbringings);

  const getBoniPreview = (item) => {
    const preview = [];
    item.boni?.forEach(b => {
      const sign = b.wert > 0 ? '+' : '';
      if (b.typ === 'Attribut') preview.push(`${sign}${b.wert} ${b.ziel}`);
      if (b.typ === 'Skill') preview.push(`${sign}${b.wert} ${b.ziel}`);
      if (b.typ === 'Exp') preview.push(`${sign}${b.wert} EP`);
    });
    return preview.join(', ');
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Wer hat dich erzogen?
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Deine frühe Erziehung hat dir grundlegende Fähigkeiten beigebracht.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {upbringings.map(upbringing => (
          <button
            key={upbringing.id}
            onClick={() => updateData({ upbringing: upbringing.id })}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              data.upbringing === upbringing.id
                ? 'bg-arx-purple/30 border-arx-gold'
                : 'bg-arx-dark border-arx-purple/20 hover:border-arx-purple/50'
            }`}
          >
            <div className="text-3xl mb-2">{upbringing.icon}</div>
            <div className="text-white font-semibold text-sm">{upbringing.name}</div>
            <div className="text-gray-500 text-xs mt-1 h-8">
              {getBoniPreview(upbringing) || 'Keine Boni'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
