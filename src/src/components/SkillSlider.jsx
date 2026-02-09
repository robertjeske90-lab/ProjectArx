export default function SkillSlider({ name, label, value, onChange, min = 0, max = 100 }) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Skill level text based on value
  const getSkillLevel = (val) => {
    if (val === 0) return 'Untrainiert';
    if (val < 20) return 'Anfänger';
    if (val < 40) return 'Lehrling';
    if (val < 60) return 'Geselle';
    if (val < 80) return 'Experte';
    if (val < 100) return 'Meister';
    return 'Großmeister';
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label className="text-gray-300 font-medium">{label}</label>
        <div className="text-right">
          <span className="text-arx-gold font-bold text-lg">{value}</span>
          <span className="text-gray-500 text-sm ml-2">({getSkillLevel(value)})</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(name, parseInt(e.target.value))}
          className="w-full h-3 bg-arx-dark rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #059669 0%, #10b981 ${percentage}%, #1f1f2e ${percentage}%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
