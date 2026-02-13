import React, { useState, useRef, useEffect } from 'react';

// ========================================
// BACKSTORY EDITOR - Auto-Resize TextArea
// ========================================
export function BackstoryEditor({ value, onChange, readOnly = false }) {
  const textareaRef = useRef(null);

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(150, textarea.scrollHeight) + 'px';
    }
  }, [value]);

  if (readOnly) {
    return (
      <div className="bg-arx-darker rounded-lg p-4 min-h-[150px]">
        {value ? (
          <p className="text-gray-300 whitespace-pre-wrap">{value}</p>
        ) : (
          <p className="text-gray-500 italic">Keine Hintergrundgeschichte vorhanden.</p>
        )}
      </div>
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Schreibe hier die Hintergrundgeschichte deines Charakters..."
      className="w-full bg-arx-darker border border-arx-purple/30 rounded-lg p-4 text-gray-300 
                 placeholder-gray-600 resize-none focus:outline-none focus:border-arx-purple
                 min-h-[150px] transition-all"
      style={{ overflow: 'hidden' }}
    />
  );
}

// ========================================
// CHRONIK / QUESTLOG - Pergament-Stil
// ========================================
export function ChronikSection({ entries = [], onAdd, onUpdate, onDelete, readOnly = false }) {
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (!newEntry.trim()) return;
    
    const entry = {
      id: Date.now().toString(),
      text: newEntry.trim(),
      date: new Date().toISOString(),
      type: 'note' // 'note' | 'quest' | 'event'
    };
    
    onAdd(entry);
    setNewEntry('');
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    onUpdate(id, { text: editText.trim() });
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-arx-dark border border-arx-purple/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 to-arx-dark p-4 border-b border-amber-700/30">
        <h3 className="font-medieval text-xl text-amber-400 flex items-center gap-2">
          📜 Chronik & Questlog
        </h3>
      </div>

      {/* Entries - Pergament Style */}
      <div 
        className="p-4 space-y-3 max-h-96 overflow-y-auto"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#1a1510'
        }}
      >
        {entries.length === 0 ? (
          <p className="text-center text-amber-700/50 italic py-8">
            Die Chronik ist noch leer. Beginne deine Geschichte zu schreiben...
          </p>
        ) : (
          entries.map((entry) => (
            <div 
              key={entry.id}
              className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-3 
                         hover:border-amber-700/50 transition-colors group"
            >
              {editingId === entry.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-arx-darker border border-amber-700/50 rounded p-2 
                               text-amber-100 resize-none min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={() => handleSaveEdit(entry.id)}
                      className="px-3 py-1 text-sm bg-amber-700 text-white rounded hover:bg-amber-600"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-amber-100 whitespace-pre-wrap flex-1">{entry.text}</p>
                    {!readOnly && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1 text-amber-600 hover:text-amber-400"
                          title="Bearbeiten"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="p-1 text-red-600 hover:text-red-400"
                          title="Löschen"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-amber-700/70 mt-2">
                    {formatDate(entry.date)}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Entry */}
      {!readOnly && (
        <div className="p-4 border-t border-amber-800/30 bg-amber-950/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Neuer Eintrag..."
              className="flex-1 bg-arx-darker border border-amber-700/30 rounded-lg px-4 py-2 
                         text-amber-100 placeholder-amber-800/50 focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={handleAdd}
              disabled={!newEntry.trim()}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-600 
                         disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
                         transition-colors"
            >
              + Hinzufügen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// COMBINED PERSISTENZ-SEKTION
// ========================================
export function PersistenceSection({ character, onUpdate, readOnly = false }) {
  const [backstory, setBackstory] = useState(character?.backstory?.notes || '');
  const [chronik, setChronik] = useState(character?.chronik || []);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const originalBackstory = character?.backstory?.notes || '';
    const originalChronik = JSON.stringify(character?.chronik || []);
    
    const currentChronik = JSON.stringify(chronik);
    
    setHasChanges(
      backstory !== originalBackstory || 
      currentChronik !== originalChronik
    );
  }, [backstory, chronik, character]);

  const handleSave = () => {
    onUpdate({
      backstory: { notes: backstory },
      chronik: chronik
    });
    setHasChanges(false);
  };

  const handleAddChronikEntry = (entry) => {
    setChronik(prev => [entry, ...prev]);
  };

  const handleUpdateChronikEntry = (id, updates) => {
    setChronik(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDeleteChronikEntry = (id) => {
    setChronik(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Backstory */}
      <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medieval text-xl text-arx-gold">📖 Hintergrundgeschichte</h3>
          {hasChanges && !readOnly && (
            <span className="text-amber-400 text-sm animate-pulse">• Ungespeicherte Änderungen</span>
          )}
        </div>
        <BackstoryEditor 
          value={backstory}
          onChange={setBackstory}
          readOnly={readOnly}
        />
      </div>

      {/* Chronik */}
      <ChronikSection
        entries={chronik}
        onAdd={handleAddChronikEntry}
        onUpdate={handleUpdateChronikEntry}
        onDelete={handleDeleteChronikEntry}
        readOnly={readOnly}
      />

      {/* Save Button */}
      {hasChanges && !readOnly && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-arx-gold to-amber-600 text-arx-darker 
                       font-bold rounded-lg hover:scale-[1.02] transition-transform"
          >
            💾 Änderungen speichern
          </button>
        </div>
      )}
    </div>
  );
}

export default PersistenceSection;
