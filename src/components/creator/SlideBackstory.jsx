import { useState } from 'react';

export default function SlideBackstory({ data, updateData }) {
  const [backstory, setBackstory] = useState(data.backstory || '');

  const handleChange = (value) => {
    setBackstory(value);
    // Speichere als STRING, nicht als Object!
    updateData({ backstory: value });
  };

  // Vorlagen für Inspiration
  const templates = [
    {
      label: '🗡️ Der Krieger',
      text: 'Geboren in einer Zeit des Krieges, wurde ich früh zum Kämpfen ausgebildet. Die Narben auf meinem Körper erzählen Geschichten von Schlachten, die ich überlebt habe...'
    },
    {
      label: '🧙 Der Gelehrte',
      text: 'Die verstaubten Bücher der alten Bibliothek waren meine Kindheit. Während andere spielten, studierte ich die Geheimnisse der Welt...'
    },
    {
      label: '🗝️ Der Dieb',
      text: 'Auf den Straßen aufgewachsen, lernte ich früh, dass man nehmen muss, was man braucht. Meine flinken Finger haben mir das Leben gerettet...'
    },
    {
      label: '🌿 Der Wanderer',
      text: 'Kein Ort war je mein Zuhause. Die Straße ist mein Bett, der Himmel mein Dach. Ich habe viele Länder gesehen und noch mehr Geschichten gehört...'
    },
    {
      label: '⚔️ Der Rächer',
      text: 'Sie haben mir alles genommen. Meine Familie, mein Zuhause, meine Zukunft. Jetzt gibt es nur noch ein Ziel: Vergeltung...'
    }
  ];

  const applyTemplate = (text) => {
    handleChange(text);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-medieval text-3xl text-arx-gold mb-2 text-center">
        Deine Geschichte
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Woher kommt dein Charakter? Was hat ihn geprägt?
      </p>

      {/* Vorlagen */}
      <div className="mb-6">
        <label className="text-gray-400 text-sm mb-2 block">Inspiration:</label>
        <div className="flex flex-wrap gap-2">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(t.text)}
              className="px-3 py-1 bg-arx-dark rounded-lg text-sm text-gray-300 hover:text-white hover:bg-arx-purple/30 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="bg-arx-dark rounded-xl p-4">
        <textarea
          value={backstory}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Erzähle die Geschichte deines Charakters...

Wer waren deine Eltern?
Wo bist du aufgewachsen?
Was hat dich geprägt?
Warum bist du aufgebrochen?
Was sind deine Ziele?"
          rows={12}
          className="w-full px-4 py-3 bg-arx-darker border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:border-arx-gold focus:outline-none resize-none font-serif leading-relaxed"
        />
        
        {/* Character Count */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{backstory.length} Zeichen</span>
          <span>Optional - du kannst später ergänzen</span>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-arx-purple/10 border border-arx-purple/30 rounded-xl p-4">
        <h3 className="text-arx-purple font-medium mb-2">💡 Tipps für eine gute Backstory:</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Verbinde sie mit deiner gewählten Herkunft und Kultur</li>
          <li>• Gib deinem Charakter ein Ziel oder eine Motivation</li>
          <li>• Lass Raum für Geheimnisse, die sich später enthüllen</li>
          <li>• Überlege, wie dein Charakter zu seinen Skills kam</li>
        </ul>
      </div>
    </div>
  );
}
