export default function SlideName({ data, updateData }) {
  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Wie heißt dein Held?
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Der Name, unter dem du bekannt sein wirst.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="Wie nennt man dich?"
            maxLength={50}
            autoFocus
            className="w-full px-4 py-4 bg-arx-dark border-2 border-arx-purple/30 rounded-xl text-white text-xl text-center placeholder-gray-500 focus:outline-none focus:border-arx-gold transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm">
            Alias / Spitzname <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={data.alias}
            onChange={(e) => updateData({ alias: e.target.value })}
            placeholder="Gibt es einen Spitznamen?"
            maxLength={50}
            className="w-full px-4 py-3 bg-arx-dark border border-arx-purple/20 rounded-xl text-white text-center placeholder-gray-500 focus:outline-none focus:border-arx-purple transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
