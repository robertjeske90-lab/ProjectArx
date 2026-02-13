/**
 * MODULARE ITEM-ARCHITEKTUR
 * 
 * Basis-Datenmodell für alle Item-Typen mit flexiblem properties-Objekt
 */

// ========================================
// ITEM KATEGORIEN
// ========================================
export const ITEM_CATEGORIES = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  CONSUMABLE: 'consumable',
  CONTAINER: 'container',
  FURNITURE: 'furniture',
  VEHICLE: 'vehicle',
  TOOL: 'tool',
  MISC: 'misc'
};

// ========================================
// ITEM SCHEMA
// ========================================

/**
 * Basis-Item Schema
 */
export const createBaseItem = (overrides = {}) => ({
  id: crypto.randomUUID?.() || Date.now().toString(),
  name: 'Unbenanntes Item',
  description: '',
  category: ITEM_CATEGORIES.MISC,
  
  // Basis-Eigenschaften
  weight: 0,        // in kg
  value: 0,         // in Kupfer/Basis-Währung
  rarity: 'common', // common, uncommon, rare, epic, legendary
  
  // Zustand
  condition: 100,   // 0-100, Haltbarkeit
  maxCondition: 100,
  
  // Stacking
  stackable: false,
  quantity: 1,
  maxStack: 1,
  
  // Visuals
  icon: '📦',
  imageUrl: null,
  
  // Flexibles Properties-Objekt für typ-spezifische Daten
  properties: {},
  
  // Meta
  tags: [],
  origin: 'Core',
  createdAt: new Date().toISOString(),
  
  ...overrides
});

// ========================================
// WAFFEN
// ========================================

/**
 * Waffen-spezifische Properties
 */
export const createWeapon = (base = {}) => createBaseItem({
  category: ITEM_CATEGORIES.WEAPON,
  icon: '⚔️',
  properties: {
    // Basis-Stats
    damage: '1d6',        // Würfelformel
    damageType: 'slash',  // slash, pierce, blunt, magic
    range: 'melee',       // melee, thrown, ranged
    
    // Handling
    hands: 1,             // 1 oder 2
    reach: 1,             // In Metern
    
    // Kampfmodi
    attackModes: [
      { name: 'Standard', damage: '1d6', speed: 1.0 },
      // Weitere Modi möglich: Wuchtangriff, Schnellangriff, etc.
    ],
    
    // Material & Härte
    material: 'steel',
    hardness: 10,
    
    // Edge Health (Klingenzustand)
    edgeHealth: 100,
    maxEdgeHealth: 100,
    
    // Slots (für Modifikationen)
    slots: [],
    maxSlots: 0,
    
    // Skill-Anforderung
    requiredSkill: null,
    skillBonus: 0,
    
    ...base.properties
  },
  ...base
});

// ========================================
// RÜSTUNGEN
// ========================================

/**
 * Rüstungs-spezifische Properties
 */
export const createArmor = (base = {}) => createBaseItem({
  category: ITEM_CATEGORIES.ARMOR,
  icon: '🛡️',
  properties: {
    // Schutz
    defense: 2,
    armorType: 'light',   // none, light, medium, heavy
    
    // Körperbereich
    slot: 'torso',        // head, torso, arms, hands, legs, feet, shield
    coverage: 0.3,        // 0-1, wie viel vom Körper bedeckt
    
    // Material
    material: 'leather',
    hardness: 5,
    
    // Bewegungseinschränkung
    encumbrance: 0,       // Malus auf Geschick-basierte Proben
    noiseLevel: 0,        // Malus auf Schleichen
    
    // Slots
    slots: [],
    maxSlots: 1,
    
    // Resistenzen (optional)
    resistances: {},
    
    ...base.properties
  },
  ...base
});

// ========================================
// CONSUMABLES
// ========================================

/**
 * Verbrauchsgegenstand Properties
 */
export const createConsumable = (base = {}) => createBaseItem({
  category: ITEM_CATEGORIES.CONSUMABLE,
  icon: '🧪',
  stackable: true,
  maxStack: 10,
  properties: {
    consumeType: 'drink', // drink, eat, apply, throw
    duration: 0,          // In Runden (0 = instant)
    
    // Effekte
    effects: [
      // { type: 'heal', target: 'hp', value: 10 }
      // { type: 'buff', target: 'strength', value: 2, duration: 10 }
    ],
    
    // Verwendung
    uses: 1,
    maxUses: 1,
    
    ...base.properties
  },
  ...base
});

// ========================================
// CONTAINER
// ========================================

/**
 * Container Properties (Taschen, Truhen, etc.)
 */
export const createContainer = (base = {}) => createBaseItem({
  category: ITEM_CATEGORIES.CONTAINER,
  icon: '🎒',
  properties: {
    // Kapazität
    capacity: 10,         // Anzahl Items
    maxWeight: 20,        // Max Gewicht in kg
    
    // Inhalt
    contents: [],         // Array von Item-IDs oder Items
    
    // Zugang
    locked: false,
    lockDifficulty: 0,
    keyId: null,
    
    // Typ
    containerType: 'bag', // bag, chest, barrel, crate, etc.
    
    ...base.properties
  },
  ...base
});

// ========================================
// MÖBEL / FURNITURE
// ========================================

/**
 * Möbel Properties
 */
export const createFurniture = (base = {}) => createBaseItem({
  category: ITEM_CATEGORIES.FURNITURE,
  icon: '🪑',
  properties: {
    // Platzierung
    placeable: true,
    gridSize: { width: 1, height: 1 },
    
    // Interaktion
    interactable: true,
    interactionType: 'sit', // sit, sleep, storage, craft, etc.
    
    // Container-Funktion (optional)
    hasStorage: false,
    storageCapacity: 0,
    
    // Craft-Station (optional)
    isCraftStation: false,
    craftingType: null,   // alchemy, smithing, cooking, etc.
    
    ...base.properties
  },
  ...base
});

// ========================================
// FAHRZEUGE
// ========================================

/**
 * Fahrzeug Properties
 */
export const createVehicle = (base = {}) => createBaseItem({
  category: ITEM_CATEGORIES.VEHICLE,
  icon: '🐴',
  properties: {
    vehicleType: 'mount',  // mount, cart, ship, airship
    
    // Bewegung
    speed: 10,            // Basis-Geschwindigkeit
    terrain: ['land'],    // land, water, air
    
    // Kapazität
    passengerCapacity: 1,
    cargoCapacity: 50,    // kg
    
    // Zustand
    hull: 100,
    maxHull: 100,
    
    // Crew
    requiredCrew: 0,
    maxCrew: 1,
    
    // Waffen-Slots (für Kampffahrzeuge)
    weaponSlots: 0,
    mountedWeapons: [],
    
    ...base.properties
  },
  ...base
});

// ========================================
// WERKZEUGE
// ========================================

/**
 * Werkzeug Properties
 */
export const createTool = (base = {}) => createBaseItem({
  category: ITEM_CATEGORIES.TOOL,
  icon: '🔧',
  properties: {
    toolType: 'general',  // general, lockpick, smithing, alchemy, mining, etc.
    
    // Skill-Bonus
    skillBonus: 1,
    applicableSkills: [], // Welche Skills profitieren
    
    // Qualität
    quality: 'standard',  // crude, standard, fine, masterwork
    qualityBonus: 0,
    
    // Verbrauch
    consumable: false,
    uses: -1,             // -1 = unendlich
    
    ...base.properties
  },
  ...base
});

// ========================================
// ITEM FACTORY
// ========================================

/**
 * Factory-Funktion für einfache Item-Erstellung
 */
export function createItem(category, data = {}) {
  switch (category) {
    case ITEM_CATEGORIES.WEAPON:
      return createWeapon(data);
    case ITEM_CATEGORIES.ARMOR:
      return createArmor(data);
    case ITEM_CATEGORIES.CONSUMABLE:
      return createConsumable(data);
    case ITEM_CATEGORIES.CONTAINER:
      return createContainer(data);
    case ITEM_CATEGORIES.FURNITURE:
      return createFurniture(data);
    case ITEM_CATEGORIES.VEHICLE:
      return createVehicle(data);
    case ITEM_CATEGORIES.TOOL:
      return createTool(data);
    default:
      return createBaseItem({ category, ...data });
  }
}

// ========================================
// BEISPIEL-ITEMS
// ========================================

export const EXAMPLE_ITEMS = {
  longsword: createWeapon({
    name: 'Langschwert',
    description: 'Ein gut ausbalanciertes Langschwert aus gehärtetem Stahl.',
    weight: 1.5,
    value: 150,
    icon: '🗡️',
    properties: {
      damage: '1d8',
      damageType: 'slash',
      hands: 1,
      reach: 1,
      material: 'steel',
      hardness: 12,
      attackModes: [
        { name: 'Hieb', damage: '1d8', speed: 1.0 },
        { name: 'Stich', damage: '1d6', speed: 1.2, damageType: 'pierce' },
        { name: 'Wuchtangriff', damage: '2d6', speed: 0.5 }
      ],
      requiredSkill: 'einhandklingen',
      maxSlots: 2
    }
  }),
  
  chainmail: createArmor({
    name: 'Kettenhemd',
    description: 'Ein Hemd aus ineinandergreifenden Metallringen.',
    weight: 12,
    value: 300,
    icon: '🛡️',
    properties: {
      defense: 4,
      armorType: 'medium',
      slot: 'torso',
      coverage: 0.4,
      material: 'steel',
      encumbrance: 2,
      noiseLevel: 1
    }
  }),
  
  healingPotion: createConsumable({
    name: 'Heiltrank',
    description: 'Eine rote Flüssigkeit die Wunden heilt.',
    weight: 0.2,
    value: 50,
    icon: '🧪',
    rarity: 'uncommon',
    properties: {
      consumeType: 'drink',
      effects: [
        { type: 'heal', target: 'hp', value: 20 }
      ]
    }
  })
};

export default {
  ITEM_CATEGORIES,
  createItem,
  createBaseItem,
  createWeapon,
  createArmor,
  createConsumable,
  createContainer,
  createFurniture,
  createVehicle,
  createTool,
  EXAMPLE_ITEMS
};
