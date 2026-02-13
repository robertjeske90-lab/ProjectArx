import React, { createContext, useContext, useState, useCallback } from 'react';

const DiceContext = createContext(null);

export function DiceProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rollConfig, setRollConfig] = useState(null);
  const [rollResult, setRollResult] = useState(null);
  const [rollHistory, setRollHistory] = useState([]);

  // Öffne den Dice Roller mit Konfiguration
  const openDiceRoller = useCallback((config) => {
    // config = { attr, attrValue, skill, skillValue, tn, label, modifiers? }
    setRollConfig(config);
    setRollResult(null);
    setIsOpen(true);
  }, []);

  const closeDiceRoller = useCallback(() => {
    setIsOpen(false);
    setRollConfig(null);
    setRollResult(null);
  }, []);

  // Würfeln!
  const performRoll = useCallback((additionalMods = []) => {
    if (!rollConfig) return;

    const d20 = Math.floor(Math.random() * 20) + 1;
    const isCritSuccess = d20 === 20;
    const isCritFail = d20 === 1;

    // Sammle alle Modifikatoren
    const modifiers = [
      { label: rollConfig.attr || 'Attribut', value: rollConfig.attrValue || 0 },
      { label: rollConfig.skill || 'Skill', value: rollConfig.skillValue || 0 },
      ...(rollConfig.modifiers || []),
      ...additionalMods
    ].filter(m => m.value !== 0);

    const totalMods = modifiers.reduce((sum, m) => sum + m.value, 0);
    const total = d20 + totalMods;
    const tn = rollConfig.tn || 15;
    
    // Degree of Success (DoS)
    let dos = total - tn;
    if (isCritSuccess) dos += 10;
    if (isCritFail) dos -= 10;

    // Erfolgsgrad bestimmen
    let grade, gradeColor, gradeIcon;
    if (isCritSuccess || dos >= 10) {
      grade = 'Kritischer Erfolg';
      gradeColor = 'text-yellow-400';
      gradeIcon = '⭐';
    } else if (dos >= 0) {
      grade = 'Erfolg';
      gradeColor = 'text-emerald-400';
      gradeIcon = '✓';
    } else if (isCritFail || dos <= -10) {
      grade = 'Patzer';
      gradeColor = 'text-red-500';
      gradeIcon = '💀';
    } else {
      grade = 'Fehlschlag';
      gradeColor = 'text-red-400';
      gradeIcon = '✗';
    }

    const result = {
      d20,
      modifiers,
      totalMods,
      total,
      tn,
      dos,
      grade,
      gradeColor,
      gradeIcon,
      isCritSuccess,
      isCritFail,
      label: rollConfig.label || 'Probe',
      timestamp: new Date()
    };

    setRollResult(result);
    setRollHistory(prev => [result, ...prev].slice(0, 20)); // Letzte 20 Würfe

    return result;
  }, [rollConfig]);

  const value = {
    isOpen,
    rollConfig,
    rollResult,
    rollHistory,
    openDiceRoller,
    closeDiceRoller,
    performRoll
  };

  return (
    <DiceContext.Provider value={value}>
      {children}
      {isOpen && <DiceRollerModal />}
    </DiceContext.Provider>
  );
}

export function useDice() {
  const context = useContext(DiceContext);
  if (!context) {
    throw new Error('useDice must be used within a DiceProvider');
  }
  return context;
}

// ========================================
// DICE ROLLER MODAL
// ========================================
function DiceRollerModal() {
  const { rollConfig, rollResult, closeDiceRoller, performRoll } = useDice();
  const [customMod, setCustomMod] = useState(0);
  const [customTN, setCustomTN] = useState(rollConfig?.tn || 15);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = async () => {
    setIsRolling(true);
    
    // Würfel-Animation
    await new Promise(r => setTimeout(r, 500));
    
    const mods = customMod !== 0 ? [{ label: 'Bonus/Malus', value: customMod }] : [];
    performRoll(mods);
    
    setIsRolling(false);
  };

  if (!rollConfig) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-arx-dark border-2 border-arx-purple/50 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-arx-purple/30 to-arx-dark p-4 border-b border-arx-purple/30">
          <div className="flex justify-between items-center">
            <h3 className="font-medieval text-xl text-arx-gold">🎲 Würfelprobe</h3>
            <button 
              onClick={closeDiceRoller}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-300 mt-1">{rollConfig.label}</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Formel-Anzeige */}
          <div className="bg-arx-darker rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-2">Formel:</div>
            <div className="flex items-center gap-2 text-lg flex-wrap">
              <span className="bg-arx-purple/30 px-2 py-1 rounded text-arx-gold font-mono">1d20</span>
              <span className="text-gray-500">+</span>
              <span className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">
                {rollConfig.attr}: {rollConfig.attrValue || 0}
              </span>
              <span className="text-gray-500">+</span>
              <span className="bg-emerald-500/20 px-2 py-1 rounded text-emerald-300">
                {rollConfig.skill}: {rollConfig.skillValue || 0}
              </span>
            </div>
          </div>

          {/* TN Einstellung */}
          <div className="flex items-center gap-4">
            <label className="text-gray-400 text-sm">Zielschwierigkeit (TN):</label>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCustomTN(t => Math.max(1, t - 5))}
                className="w-8 h-8 bg-arx-darker rounded text-gray-400 hover:text-white"
              >
                −5
              </button>
              <input
                type="number"
                value={customTN}
                onChange={(e) => setCustomTN(parseInt(e.target.value) || 15)}
                className="w-16 text-center bg-arx-darker border border-arx-purple/30 rounded px-2 py-1 text-arx-gold"
              />
              <button 
                onClick={() => setCustomTN(t => t + 5)}
                className="w-8 h-8 bg-arx-darker rounded text-gray-400 hover:text-white"
              >
                +5
              </button>
            </div>
          </div>

          {/* Bonus/Malus */}
          <div className="flex items-center gap-4">
            <label className="text-gray-400 text-sm">Situationsmodifikator:</label>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCustomMod(m => m - 2)}
                className="w-8 h-8 bg-red-900/30 rounded text-red-400 hover:text-red-300"
              >
                −2
              </button>
              <span className={`w-12 text-center font-bold ${customMod > 0 ? 'text-emerald-400' : customMod < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {customMod > 0 ? '+' : ''}{customMod}
              </span>
              <button 
                onClick={() => setCustomMod(m => m + 2)}
                className="w-8 h-8 bg-emerald-900/30 rounded text-emerald-400 hover:text-emerald-300"
              >
                +2
              </button>
            </div>
          </div>

          {/* Würfeln Button */}
          <button
            onClick={handleRoll}
            disabled={isRolling}
            className={`w-full py-4 rounded-lg font-bold text-xl transition-all ${
              isRolling 
                ? 'bg-arx-purple/50 text-gray-400 cursor-wait'
                : 'bg-gradient-to-r from-arx-purple to-arx-gold text-white hover:scale-[1.02]'
            }`}
          >
            {isRolling ? (
              <span className="animate-pulse">🎲 Würfelt...</span>
            ) : (
              '🎲 Würfeln!'
            )}
          </button>

          {/* Ergebnis */}
          {rollResult && (
            <div className={`rounded-lg p-4 border-2 ${
              rollResult.dos >= 10 ? 'bg-yellow-500/10 border-yellow-500/50' :
              rollResult.dos >= 0 ? 'bg-emerald-500/10 border-emerald-500/50' :
              rollResult.dos <= -10 ? 'bg-red-500/20 border-red-500/50' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              {/* Würfel-Ergebnis groß */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`text-6xl font-bold ${
                  rollResult.isCritSuccess ? 'text-yellow-400 animate-pulse' :
                  rollResult.isCritFail ? 'text-red-500 animate-pulse' :
                  'text-white'
                }`}>
                  {rollResult.d20}
                </div>
                <div className="text-4xl">{rollResult.gradeIcon}</div>
              </div>

              {/* Aufschlüsselung */}
              <div className="bg-black/30 rounded p-3 mb-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Würfel (1d20):</span>
                  <span className="text-white font-mono">{rollResult.d20}</span>
                </div>
                {rollResult.modifiers.map((mod, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-400">{mod.label}:</span>
                    <span className={mod.value >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {mod.value >= 0 ? '+' : ''}{mod.value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-600 pt-1 flex justify-between font-bold">
                  <span className="text-gray-300">Gesamt:</span>
                  <span className="text-arx-gold">{rollResult.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">vs TN:</span>
                  <span className="text-gray-300">{rollResult.tn}</span>
                </div>
              </div>

              {/* Erfolgsgrad */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${rollResult.gradeColor}`}>
                  {rollResult.grade}
                </div>
                <div className="text-gray-400">
                  DoS: <span className={rollResult.dos >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {rollResult.dos >= 0 ? '+' : ''}{rollResult.dos}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiceProvider;
