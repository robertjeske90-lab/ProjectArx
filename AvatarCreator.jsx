import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import avatarAssets from '../../data/avatarAssets.json';

const LPC_BASE = 'https://robertjeske90-lab.github.io/arx-assets/lpc';
const ANIM_FALLBACK = ['walk', 'slash', 'hurt', 'spellcast', 'thrust', 'shoot', 'idle', 'run', 'combat_idle'];

export default function AvatarCreator({ initialAvatar, onSave, onCancel }) {
  const [avatar, setAvatar] = useState(initialAvatar || getDefaultAvatar());
  const [activeCategory, setActiveCategory] = useState('body');
  const [renderedImage, setRenderedImage] = useState(null); // Base64 des fertigen Avatars

  function getDefaultAvatar() {
    return {
      body: { type: 'male', variant: 'light' },
      head: { type: 'human_male', variant: 'light' },
      hair: { type: 'plain', variant: 'dark_brown' },
      beards: { type: 'none', variant: 'dark_brown' },
      torso: { type: 'suspenders', variant: 'brown' },
      legs: { type: 'pants', variant: 'brown' },
      feet: { type: 'boots', variant: 'brown' },
      cape: { type: 'none', variant: 'brown' }
    };
  }

  const updateCategory = (category, field, value) => {
    setAvatar(prev => {
      const newAvatar = {
        ...prev,
        [category]: { ...prev[category], [field]: value }
      };
      
      if (category === 'body' && field === 'variant') {
        newAvatar.head = { ...newAvatar.head, variant: value };
      }
      
      return newAvatar;
    });
  };

  const loadPreset = (presetKey) => {
    const preset = avatarAssets.presets[presetKey];
    if (!preset) return;
    
    const newAvatar = getDefaultAvatar();
    Object.entries(preset).forEach(([key, value]) => {
      if (key !== 'name' && typeof value === 'object') {
        newAvatar[key] = { ...newAvatar[key], ...value };
      }
    });
    setAvatar(newAvatar);
  };

  const randomize = () => {
    const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const categories = avatarAssets.categories;
    const newAvatar = {};

    Object.entries(categories).forEach(([catKey, cat]) => {
      const types = Object.keys(cat.types || {});
      const variantKeys = cat.variants === 'inherit_body' 
        ? Object.keys(categories.body.variants)
        : cat.variants === 'inherit_hair'
        ? Object.keys(categories.hair.variants)
        : cat.variants === 'inherit_torso'
        ? Object.keys(categories.torso.variants)
        : Object.keys(cat.variants || {});

      let selectedType = randomFrom(types);
      if (cat.optional && Math.random() > 0.5) {
        selectedType = 'none';
      }

      newAvatar[catKey] = {
        type: selectedType,
        variant: variantKeys.length > 0 ? randomFrom(variantKeys) : 'light'
      };
    });

    if (newAvatar.head && newAvatar.body) {
      newAvatar.head.variant = newAvatar.body.variant;
    }

    setAvatar(newAvatar);
  };

  // PNG Export für Foundry/Roll20
  const exportAsPNG = () => {
    if (!renderedImage) return;
    
    const link = document.createElement('a');
    link.download = 'avatar.png';
    link.href = renderedImage;
    link.click();
  };

  // Speichern mit Base64 Bild
  const handleSave = () => {
    if (onSave) {
      onSave({
        ...avatar,
        _renderedImage: renderedImage // Base64 des fertigen Avatars mitspeichern!
      });
    }
  };

  const sortedCategories = useMemo(() => {
    return Object.entries(avatarAssets.categories)
      .sort(([, a], [, b]) => a.order - b.order);
  }, []);

  const activeCatData = avatarAssets.categories[activeCategory];
  
  const getVariants = () => {
    if (!activeCatData) return {};
    if (activeCatData.variants === 'inherit_body') return avatarAssets.categories.body.variants;
    if (activeCatData.variants === 'inherit_hair') return avatarAssets.categories.hair.variants;
    if (activeCatData.variants === 'inherit_torso') return avatarAssets.categories.torso.variants;
    return activeCatData.variants || {};
  };

  return (
    <div className="bg-arx-darker rounded-xl p-4 max-w-4xl mx-auto">
      <h2 className="font-medieval text-2xl text-arx-gold mb-4 text-center">
        🎨 Avatar Creator
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 bg-arx-dark rounded-xl overflow-hidden border-2 border-arx-purple/30 flex items-center justify-center">
            <AvatarPreview 
              avatar={avatar} 
              size={192} 
              onRendered={setRenderedImage}
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportAsPNG}
            disabled={!renderedImage}
            className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
          >
            📥 Als PNG exportieren (Foundry/Roll20)
          </button>

          <div className="mt-4 w-full">
            <label className="text-gray-400 text-sm">Vorlagen:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(avatarAssets.presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className="px-3 py-1 bg-arx-dark rounded text-sm text-gray-300 hover:text-white hover:bg-arx-purple/30"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={randomize}
            className="mt-4 px-4 py-2 bg-arx-dark rounded-lg text-arx-gold hover:bg-arx-purple/30 transition-colors"
          >
            🎲 Zufällig
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-1 mb-4 bg-arx-dark rounded-lg p-2">
            {sortedCategories.map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeCategory === key
                    ? 'bg-arx-purple text-white'
                    : 'text-gray-400 hover:text-white hover:bg-arx-purple/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {activeCatData?.types && (
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Typ:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
                {Object.entries(activeCatData.types).map(([key, type]) => (
                  <button
                    key={key}
                    onClick={() => updateCategory(activeCategory, 'type', key)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      avatar[activeCategory]?.type === key
                        ? 'bg-arx-gold text-arx-darker font-bold'
                        : 'bg-arx-dark text-gray-300 hover:text-white hover:bg-arx-purple/30'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {Object.keys(getVariants()).length > 0 && avatar[activeCategory]?.type !== 'none' && (
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Farbe:</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(getVariants()).map(([key, variant]) => (
                  <button
                    key={key}
                    onClick={() => updateCategory(activeCategory, 'variant', key)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      avatar[activeCategory]?.variant === key
                        ? 'border-arx-gold scale-110'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: variant.color }}
                    title={variant.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto bg-arx-dark rounded-lg p-3 text-sm text-gray-400">
            <div className="font-medium text-white mb-2">Aktuelle Auswahl:</div>
            {Object.entries(avatar).map(([key, val]) => {
              if (!val || val.type === 'none' || key.startsWith('_')) return null;
              const cat = avatarAssets.categories[key];
              const typeName = cat?.types?.[val.type]?.name || val.type;
              return (
                <div key={key} className="text-xs">
                  <span className="text-gray-500">{cat?.name || key}:</span> {typeName}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-arx-purple/20">
        {onCancel && (
          <button onClick={onCancel} className="px-6 py-2 text-gray-400 hover:text-white">
            Abbrechen
          </button>
        )}
        {onSave && (
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-arx-gold to-arx-gold-dark text-arx-darker font-bold rounded-lg"
          >
            💾 Speichern
          </button>
        )}
      </div>
    </div>
  );
}

// ========================================
// AVATAR PREVIEW - Mit Base64 Export!
// ========================================
function AvatarPreview({ avatar, size = 128, onRendered }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  
  const layerOrder = ['cape', 'body', 'head', 'legs', 'feet', 'torso', 'beards', 'hair'];

  const tryLoadImage = async (basePath, variant) => {
    for (const anim of ANIM_FALLBACK) {
      const url = `${LPC_BASE}/${basePath}/${anim}/${variant}.png`;
      try {
        const img = await loadImageWithTimeout(url, 2000);
        if (img) return { img, url, anim };
      } catch (e) {
        // Try next
      }
    }
    return null;
  };

  const loadImageWithTimeout = (url, timeout) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timer = setTimeout(() => resolve(null), timeout);
      
      img.onload = () => {
        clearTimeout(timer);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      
      img.src = url;
    });
  };

  const layers = useMemo(() => {
    const result = [];
    
    layerOrder.forEach((catKey) => {
      const layerData = avatar?.[catKey];
      if (!layerData || layerData.type === 'none') return;
      
      const catData = avatarAssets.categories[catKey];
      if (!catData) return;
      
      const typeData = catData.types?.[layerData.type];
      if (!typeData || !typeData.path) return;
      
      let variant = layerData.variant;
      if (typeData.fixedVariant) {
        variant = typeData.fixedVariant;
      }
      
      result.push({
        key: catKey,
        path: typeData.path,
        variant: variant,
        type: layerData.type,
        yOffset: typeData.yOffset || 0
      });
    });
    
    return result;
  }, [avatar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    
    if (layers.length === 0) {
      setLoading(false);
      if (onRendered) onRendered(null);
      return;
    }

    setLoading(true);

    const loadAllLayers = async () => {
      const results = [];
      
      for (const layer of layers) {
        const result = await tryLoadImage(layer.path, layer.variant);
        if (result) {
          results.push({ ...layer, ...result });
        }
      }
      
      // Clear and set up canvas
      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = false;
      
      // Draw all layers
      for (const { img, yOffset } of results) {
        if (img && img.complete && img.naturalWidth > 0) {
          const frameSize = 64;
          const frameX = 0;
          const frameY = 2;
          
          const pixelOffset = Math.round((yOffset || 0) * (size / frameSize));
          
          ctx.drawImage(
            img,
            frameX * frameSize, frameY * frameSize,
            frameSize, frameSize,
            0, pixelOffset,
            size, size
          );
        }
      }
      
      // Export als Base64 PNG
      try {
        const dataURL = canvas.toDataURL('image/png');
        if (onRendered) onRendered(dataURL);
      } catch (e) {
        console.error('Could not export canvas:', e);
        if (onRendered) onRendered(null);
      }
      
      setLoading(false);
    };

    loadAllLayers();
  }, [layers, size, onRendered]);

  // Wenn ein gespeichertes Bild existiert, zeige das direkt
  if (avatar?._renderedImage && !loading) {
    return (
      <img 
        src={avatar._renderedImage} 
        alt="Avatar" 
        style={{ width: size, height: size, imageRendering: 'pixelated' }}
      />
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: size, height: size, imageRendering: 'pixelated' }}
      />
      {loading && layers.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-arx-darker/50">
          <div className="w-8 h-8 border-2 border-arx-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {layers.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-4xl">
          👤
        </div>
      )}
    </div>
  );
}

export { AvatarPreview };
