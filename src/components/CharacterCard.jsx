import { Link } from 'react-router-dom';

export default function CharacterCard({ character, onDelete }) {
  const { id, name, portraitURL, attributes, skills, createdAt } = character;
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unbekannt';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  // Calculate total attribute points
  const totalAttributes = Object.values(attributes || {}).reduce((a, b) => a + b, 0);
  
  // Calculate total skill points
  const totalSkills = Object.values(skills || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-arx-dark border border-arx-purple/30 rounded-xl overflow-hidden hover:border-arx-purple/60 transition-all hover:shadow-lg hover:shadow-arx-purple/20">
      {/* Portrait */}
      <div className="relative h-48 bg-gradient-to-br from-arx-purple/20 to-arx-dark">
        {portraitURL ? (
          <img 
            src={portraitURL} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-arx-purple/30 flex items-center justify-center">
              <span className="text-4xl text-arx-gold font-medieval">
                {name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          </div>
        )}
        
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-arx-darker to-transparent p-4">
          <h3 className="font-medieval text-xl text-arx-gold truncate">{name}</h3>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-arx-darker rounded-lg">
            <div className="text-2xl font-bold text-arx-purple">{totalAttributes}</div>
            <div className="text-xs text-gray-500">Attribut-Punkte</div>
          </div>
          <div className="text-center p-2 bg-arx-darker rounded-lg">
            <div className="text-2xl font-bold text-emerald-500">{totalSkills}</div>
            <div className="text-xs text-gray-500">Skill-Punkte</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2 mb-4">
          {attributes && Object.entries(attributes).slice(0, 3).map(([key, value]) => (
            <span 
              key={key}
              className="px-2 py-1 bg-arx-purple/20 text-arx-purple text-xs rounded"
            >
              {key.substring(0, 3).toUpperCase()}: {value}
            </span>
          ))}
        </div>
        
        {/* Created date */}
        <div className="text-xs text-gray-500 mb-4">
          Erstellt: {formatDate(createdAt)}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Link 
            to={`/characters/${id}`}
            className="flex-1 text-center py-2 bg-arx-purple text-white rounded-lg hover:bg-arx-purple-dark transition-colors text-sm"
          >
            Ansehen
          </Link>
          <button
            onClick={() => onDelete(id)}
            className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
