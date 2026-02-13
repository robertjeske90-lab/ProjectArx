// ARX Asset Configuration
// Alle Assets kommen von GitHub Pages CDN

// GitHub Pages CDN URL
const GITHUB_CDN = 'https://robertjeske90-lab.github.io/arx-assets';

export const ASSET_CONFIG = {
  // LPC Character Sprites
  lpc: {
    baseUrl: `${GITHUB_CDN}/lpc`,
    animations: ['idle', 'walk', 'combat_idle', 'slash', 'shoot', 'spellcast'],
    defaultAnimation: 'idle'
  },
  
  // Portrait Galerie
  portraits: {
    baseUrl: `${GITHUB_CDN}/portraits`,
    categories: ['human', 'elf', 'dwarf', 'orc', 'tiefling', 'misc']
  },
  
  // Background Music
  music: {
    baseUrl: `${GITHUB_CDN}/music`,
    categories: {
      themes: 'Character Themes',
      ambient: 'Atmosphäre',
      combat: 'Kampfmusik'
    }
  },
  
  // Sound Effects
  sfx: {
    baseUrl: `${GITHUB_CDN}/sfx`,
    categories: {
      ui: 'Interface',
      combat: 'Kampf',
      magic: 'Magie',
      environment: 'Umgebung'
    }
  }
};

// Helper: Baue Asset URL
export function getAssetUrl(category, path) {
  const config = ASSET_CONFIG[category];
  if (!config) {
    console.warn(`Unknown asset category: ${category}`);
    return path;
  }
  return `${config.baseUrl}/${path}`;
}

// Helper: LPC Sprite URL
export function getLpcSpriteUrl(category, type, bodyType, animation, variant) {
  const base = ASSET_CONFIG.lpc.baseUrl;
  return `${base}/${category}/${type}/${bodyType}/${animation}/${variant}.png`;
}

// Helper: Portrait URL
export function getPortraitUrl(category, filename) {
  return `${ASSET_CONFIG.portraits.baseUrl}/${category}/${filename}`;
}

// Helper: Music URL
export function getMusicUrl(category, filename) {
  return `${ASSET_CONFIG.music.baseUrl}/${category}/${filename}`;
}

export default ASSET_CONFIG;
