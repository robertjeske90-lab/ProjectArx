import { useState, useMemo } from 'react';
import portraitGallery from '../../data/portraitGallery.json';
import { ASSET_CONFIG } from '../../data/assetConfig';

export default function PortraitPicker({ currentPortrait, onSelect, onCancel }) {
  const [selectedCategory, setSelectedCategory] = useState('human');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortrait, setSelectedPortrait] = useState(currentPortrait);

  const categories = portraitGallery.categories;
  const currentCategoryData = categories[selectedCategory];

  // Filter portraits by search
  const filteredPortraits = useMemo(() => {
    if (!currentCategoryData) return [];
    if (!searchTerm) return currentCategoryData.portraits;
    
    const term = searchTerm.toLowerCase();
    return currentCategoryData.portraits.filter(p => 
      p.tags.some(tag => tag.toLowerCase().includes(term)) ||
      p.id.toLowerCase().includes(term)
    );
  }, [currentCategoryData, searchTerm]);

  const getPortraitUrl = (category, filename) => {
    return `${ASSET_CONFIG.portraits.baseUrl}/${category}/${filename}`;
  };

  const handleSelect = () => {
    if (selectedPortrait) {
      onSelect(selectedPortrait);
    }
  };

  return (
    <div className="bg-arx-darker rounded-xl p-4 max-w-3xl mx-auto">
      <h2 className="font-medieval text-2xl text-arx-gold mb-4 text-center">
        🖼️ Portrait Galerie
      </h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Suchen... (warrior, mage, female...)"
          className="w-full px-4 py-2 bg-arx-dark border border-arx-purple/30 rounded-lg text-white placeholder-gray-500 focus:border-arx-gold focus:outline-none"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === key
                ? 'bg-arx-purple text-white'
                : 'bg-arx-dark text-gray-400 hover:text-white'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Portrait Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto p-2">
        {filteredPortraits.map((portrait) => {
          const url = getPortraitUrl(selectedCategory, portrait.file);
          const isSelected = selectedPortrait?.id === portrait.id;
          
          return (
            <button
              key={portrait.id}
              onClick={() => setSelectedPortrait({ 
                id: portrait.id, 
                url, 
                category: selectedCategory,
                file: portrait.file
              })}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                isSelected 
                  ? 'border-arx-gold ring-2 ring-arx-gold/50 scale-105' 
                  : 'border-transparent hover:border-arx-purple/50'
              }`}
            >
              <img
                src={url}
                alt={portrait.id}
                className="w-full h-full object-cover bg-arx-dark"
                onError={(e) => {
                  e.target.src = '/placeholder-portrait.png';
                  e.target.onerror = null;
                }}
              />
            </button>
          );
        })}
        
        {filteredPortraits.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            Keine Portraits gefunden.
          </div>
        )}
      </div>

      {/* Preview & Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-arx-purple/20">
        <div className="flex items-center gap-4">
          {selectedPortrait && (
            <>
              <img
                src={selectedPortrait.url}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <span className="text-gray-400 text-sm">
                {selectedPortrait.id}
              </span>
            </>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedPortrait}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedPortrait
                ? 'bg-arx-gold text-arx-darker hover:bg-arx-gold-dark'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Auswählen
          </button>
        </div>
      </div>
    </div>
  );
}
