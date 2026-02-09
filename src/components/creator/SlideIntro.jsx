export default function SlideIntro({ goNext }) {
  return (
    <div className="text-center animate-fadeIn">
      <div className="text-6xl mb-6">⚔️</div>
      <h1 className="font-medieval text-4xl text-arx-gold mb-4">
        Erschaffe deinen Helden
      </h1>
      <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
        In den nächsten Schritten formst du die Geschichte und Fähigkeiten 
        deines Charakters. Jede Entscheidung prägt, wer du bist.
      </p>
      
      <button
        onClick={goNext}
        className="px-8 py-4 bg-gradient-to-r from-arx-purple to-arx-gold text-white font-semibold rounded-xl hover:scale-105 transition-transform text-lg"
      >
        Beginne deine Reise →
      </button>
      
      <p className="text-gray-600 text-sm mt-8">
        Du kannst jederzeit zurückgehen und Änderungen vornehmen.
      </p>
    </div>
  );
}
