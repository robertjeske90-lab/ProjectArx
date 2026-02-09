export default function SlideAlignment({ data, updateData }) {
  const alignment = data.alignment;

  const handleChange = (axis, value) => {
    updateData({
      alignment: { ...alignment, [axis]: value }
    });
  };

  const getLabel = (axis, value) => {
    if (axis === 'moral') {
      if (value < -0.3) return 'Böse';
      if (value > 0.3) return 'Gut';
      return 'Neutral';
    }
    if (axis === 'order') {
      if (value < -0.3) return 'Chaotisch';
      if (value > 0.3) return 'Rechtschaffen';
      return 'Neutral';
    }
    if (axis === 'focus') {
      if (value < -0.3) return 'Eigennützig';
      if (value > 0.3) return 'Gemeinnützig';
      return 'Neutral';
    }
  };

  const getColor = (axis, value) => {
    if (axis === 'moral') {
      if (value < -0.3) return 'text-red-400';
      if (value > 0.3) return 'text-emerald-400';
    }
    if (axis === 'order') {
      if (value < -0.3) return 'text-orange-400';
      if (value > 0.3) return 'text-blue-400';
    }
    if (axis === 'focus') {
      if (value < -0.3) return 'text-purple-400';
      if (value > 0.3) return 'text-yellow-400';
    }
    return 'text-gray-400';
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Was treibt dich an?
      </h2>
      <p className="text-gray-400 text-center mb-8 text-sm">
        Definiere deine moralische Ausrichtung auf drei Achsen.
      </p>

      <div className="space-y-8">
        <div className="bg-arx-dark rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-red-400">😈 Böse</span>
            <span className={`font-semibold ${getColor('moral', alignment.moral)}`}>
              {getLabel('moral', alignment.moral)}
            </span>
            <span className="text-emerald-400">😇 Gut</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={alignment.moral}
            onChange={(e) => handleChange('moral', parseFloat(e.target.value))}
            className="w-full h-3 bg-arx-darker rounded-lg appearance-none cursor-pointer accent-arx-gold"
          />
        </div>

        <div className="bg-arx-dark rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-orange-400">🔥 Chaotisch</span>
            <span className={`font-semibold ${getColor('order', alignment.order)}`}>
              {getLabel('order', alignment.order)}
            </span>
            <span className="text-blue-400">⚖️ Rechtschaffen</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={alignment.order}
            onChange={(e) => handleChange('order', parseFloat(e.target.value))}
            className="w-full h-3 bg-arx-darker rounded-lg appearance-none cursor-pointer accent-arx-gold"
          />
        </div>

        <div className="bg-arx-dark rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-purple-400">👤 Eigennützig</span>
            <span className={`font-semibold ${getColor('focus', alignment.focus)}`}>
              {getLabel('focus', alignment.focus)}
            </span>
            <span className="text-yellow-400">👥 Gemeinnützig</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={alignment.focus}
            onChange={(e) => handleChange('focus', parseFloat(e.target.value))}
            className="w-full h-3 bg-arx-darker rounded-lg appearance-none cursor-pointer accent-arx-gold"
          />
        </div>
      </div>
    </div>
  );
}
