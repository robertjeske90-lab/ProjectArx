/**
 * NPC WEIGHTING SYSTEM
 * 
 * Implementiert gewichtete Zufallsauswahl für Rassen/Backgrounds
 * basierend auf dem 'weight' Feld in gameData.json
 * 
 * weight: 0   = Nicht für NPCs verfügbar
 * weight: 1   = Sehr selten (Drachen, Götter, etc.)
 * weight: 10  = Normal/Standard
 * weight: 50  = Häufig (Menschen, etc.)
 * weight: 100 = Sehr häufig
 */

/**
 * Wählt ein Element basierend auf Gewichtung aus
 * @param {Object} items - Objekt mit Items die ein 'weight' Feld haben können
 * @param {Object} options - Optionen: { defaultWeight: 10, excludeZeroWeight: true }
 * @returns {string} Der Key des ausgewählten Items
 */
export function weightedRandomSelect(items, options = {}) {
  const { defaultWeight = 10, excludeZeroWeight = true } = options;
  
  // Baue gewichtete Liste
  const weightedItems = [];
  
  Object.entries(items).forEach(([key, item]) => {
    const weight = item.weight ?? defaultWeight;
    
    if (excludeZeroWeight && weight === 0) return;
    
    // Füge Item so oft hinzu wie sein Gewicht
    for (let i = 0; i < weight; i++) {
      weightedItems.push(key);
    }
  });
  
  if (weightedItems.length === 0) {
    // Fallback: Nimm irgendein Item
    const keys = Object.keys(items);
    return keys[Math.floor(Math.random() * keys.length)];
  }
  
  // Zufällige Auswahl aus gewichteter Liste
  return weightedItems[Math.floor(Math.random() * weightedItems.length)];
}

/**
 * Wählt mehrere eindeutige Elemente basierend auf Gewichtung
 * @param {Object} items - Objekt mit Items
 * @param {number} count - Anzahl zu wählender Items
 * @param {Object} options - Optionen
 * @returns {string[]} Array mit Keys
 */
export function weightedRandomSelectMultiple(items, count, options = {}) {
  const selected = new Set();
  const maxAttempts = count * 10; // Verhindere Endlosschleife
  let attempts = 0;
  
  while (selected.size < count && attempts < maxAttempts) {
    const item = weightedRandomSelect(items, options);
    selected.add(item);
    attempts++;
  }
  
  return Array.from(selected);
}

/**
 * Berechnet Wahrscheinlichkeiten für Debug/UI
 * @param {Object} items - Objekt mit Items
 * @param {number} defaultWeight - Standard-Gewicht
 * @returns {Object} Objekt mit Key -> Prozent
 */
export function calculateProbabilities(items, defaultWeight = 10) {
  let totalWeight = 0;
  const weights = {};
  
  Object.entries(items).forEach(([key, item]) => {
    const weight = item.weight ?? defaultWeight;
    if (weight > 0) {
      weights[key] = weight;
      totalWeight += weight;
    }
  });
  
  const probabilities = {};
  Object.entries(weights).forEach(([key, weight]) => {
    probabilities[key] = {
      weight,
      percent: ((weight / totalWeight) * 100).toFixed(2) + '%'
    };
  });
  
  return probabilities;
}

/**
 * NPC Generator mit Weighting
 */
export class NPCGenerator {
  constructor(gameData) {
    this.gameData = gameData;
    this.races = gameData?.characterCreation?.races || {};
    this.backgrounds = gameData?.characterCreation?.backgrounds || {};
  }
  
  /**
   * Generiert eine zufällige NPC-Basis
   */
  generateBasic() {
    return {
      race: weightedRandomSelect(this.races),
      background: weightedRandomSelect(this.backgrounds)
    };
  }
  
  /**
   * Generiert mehrere NPCs für eine Szene
   * @param {number} count - Anzahl NPCs
   * @param {Object} constraints - z.B. { race: 'mensch' } um Rasse zu fixieren
   */
  generateGroup(count, constraints = {}) {
    const npcs = [];
    
    for (let i = 0; i < count; i++) {
      const npc = this.generateBasic();
      
      // Apply constraints
      if (constraints.race) npc.race = constraints.race;
      if (constraints.background) npc.background = constraints.background;
      
      npcs.push(npc);
    }
    
    return npcs;
  }
  
  /**
   * Generiert Namen basierend auf Rasse
   */
  generateName(race) {
    // Placeholder - könnte später erweitert werden mit Namenslisten
    const syllables = {
      mensch: ['Al', 'Ber', 'Carl', 'Die', 'Ernst', 'Fritz', 'Gerd', 'Hans', 'Ingo', 'Jan'],
      elf: ['Ae', 'Ela', 'Fae', 'Gal', 'Ilm', 'Lae', 'Mae', 'Nil', 'Tae', 'Val'],
      zwerg: ['Bal', 'Dur', 'Gim', 'Kor', 'Mor', 'Nor', 'Rok', 'Thor', 'Ulf', 'Wulf'],
      ork: ['Gra', 'Kro', 'Mor', 'Nar', 'Rak', 'Skog', 'Thra', 'Urg', 'Vor', 'Zog']
    };
    
    const raceSyllables = syllables[race] || syllables.mensch;
    const first = raceSyllables[Math.floor(Math.random() * raceSyllables.length)];
    const second = raceSyllables[Math.floor(Math.random() * raceSyllables.length)].toLowerCase();
    
    return first + second;
  }
}

export default NPCGenerator;
