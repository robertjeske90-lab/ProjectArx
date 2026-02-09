export default function AttributeSlider({ name, label, value, onChange, min = 1, max = 20 }) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label className="text-gray-300 font-medium">{label}</label>
        <span className="text-arx-gold font-bold text-lg">{value}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(name, parseInt(e.target.value))}
          className="w-full h-3 bg-arx-dark rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #fbbf24 ${percentage}%, #1f1f2e ${percentage}%)`
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
