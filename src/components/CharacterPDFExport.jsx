import { useState } from 'react';
import { jsPDF } from 'jspdf';
import gameData from '../data/gameData.json';

// Themes für den PDF Export
const THEMES = {
  parchment: {
    name: '📜 Pergament',
    bg: '#F5E6C8',
    bgDark: '#E8D5A9',
    text: '#2C1810',
    textMuted: '#5C4033',
    accent: '#8B4513',
    border: '#A0522D'
  },
  dark: {
    name: '🖤 Dunkel',
    bg: '#1A1A2E',
    bgDark: '#16162A',
    text: '#E8E8E8',
    textMuted: '#888888',
    accent: '#9D4EDD',
    border: '#4A4A6A'
  },
  minimal: {
    name: '⚪ Minimalist',
    bg: '#FFFFFF',
    bgDark: '#F5F5F5',
    text: '#1A1A1A',
    textMuted: '#666666',
    accent: '#333333',
    border: '#CCCCCC'
  },
  medieval: {
    name: '🏰 Medieval',
    bg: '#2C1810',
    bgDark: '#1A0F09',
    text: '#D4AF37',
    textMuted: '#A68B5B',
    accent: '#FFD700',
    border: '#8B4513'
  }
};

export default function CharacterPDFExport({ character, onClose }) {
  const [theme, setTheme] = useState('parchment');
  const [generating, setGenerating] = useState(false);
  const [includeSkills, setIncludeSkills] = useState(true);
  const [includeBackstory, setIncludeBackstory] = useState(true);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const t = THEMES[theme];
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;

      // Helper Functions
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };

      const setColor = (hex) => {
        const rgb = hexToRgb(hex);
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
      };

      const setFillColor = (hex) => {
        const rgb = hexToRgb(hex);
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
      };

      const setDrawColor = (hex) => {
        const rgb = hexToRgb(hex);
        doc.setDrawColor(rgb.r, rgb.g, rgb.b);
      };

      const addNewPageIfNeeded = (requiredSpace) => {
        if (y + requiredSpace > pageHeight - margin) {
          doc.addPage();
          y = margin;
          setFillColor(t.bg);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          return true;
        }
        return false;
      };

      // === PAGE BACKGROUND ===
      setFillColor(t.bg);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // === HEADER ===
      setFillColor(t.bgDark);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      setColor(t.accent);
      doc.text('ARX CHARAKTERBOGEN', pageWidth / 2, 20, { align: 'center' });
      
      setDrawColor(t.accent);
      doc.setLineWidth(0.5);
      doc.line(margin, 30, pageWidth - margin, 30);
      
      y = 50;

      // === CHARACTER NAME ===
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      setColor(t.text);
      doc.text(character.name || 'Unbenannt', margin, y);
      y += 8;

      if (character.alias) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        setColor(t.textMuted);
        doc.text(`"${character.alias}"`, margin, y);
        y += 6;
      }

      // Race
      const getRaceText = () => {
        const bg = character.backgrounds;
        if (!bg) return 'Unbekannt';
        const father = gameData.backgrounds?.races?.[bg.fatherRace];
        const mother = gameData.backgrounds?.races?.[bg.motherRace];
        if (father?.id === mother?.id) return father?.name || 'Unbekannt';
        return `${father?.name || '?'} / ${mother?.name || '?'}`;
      };

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      setColor(t.textMuted);
      doc.text(`Rasse: ${getRaceText()}`, margin, y);
      y += 5;

      // Physical
      if (character.physical) {
        const p = character.physical;
        doc.text(`Alter: ${p.age || '?'} | Größe: ${p.height || '?'}cm | Gewicht: ${p.weight || '?'}kg`, margin, y);
        y += 10;
      } else {
        y += 5;
      }

      // === ATTRIBUTES BOX ===
      setFillColor(t.bgDark);
      setDrawColor(t.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 35, 2, 2, 'FD');
      
      y += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      setColor(t.accent);
      doc.text('ATTRIBUTE', margin + 5, y + 2);
      y += 6;

      const coreAttrs = ['koerper', 'geschick', 'konstitution', 'geist', 'wahrnehmung', 'psyche', 'charisma', 'intuition', 'fassade'];
      const attrWidth = contentWidth / 9;
      
      coreAttrs.forEach((key, i) => {
        const attr = gameData.attributes?.[key];
        const value = character.attributes?.[key] ?? attr?.baseValue ?? 10;
        const x = margin + (i * attrWidth) + (attrWidth / 2);
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        setColor(t.textMuted);
        doc.text(attr?.name?.substring(0, 3).toUpperCase() || key.substring(0, 3).toUpperCase(), x, y + 2, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        setColor(t.text);
        doc.text(String(value), x, y + 12, { align: 'center' });
      });
      
      y += 28;

      // === VITALS ===
      y += 5;
      setFillColor(t.bgDark);
      doc.roundedRect(margin, y, contentWidth / 2 - 3, 45, 2, 2, 'FD');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      setColor(t.accent);
      doc.text('VITALWERTE', margin + 5, y + 6);
      
      let vitalY = y + 12;
      const vitals = gameData.vitals || {};
      Object.entries(vitals).forEach(([key, vital]) => {
        const maxValue = character.vitals?.[key] ?? vital.baseValue ?? 100;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        setColor(t.textMuted);
        doc.text(vital.name || key, margin + 5, vitalY);
        setColor(t.text);
        doc.text(`${maxValue}/${maxValue}`, margin + 55, vitalY);
        vitalY += 5;
      });

      // === EXPERIENCE ===
      setFillColor(t.bgDark);
      doc.roundedRect(margin + contentWidth / 2 + 3, y, contentWidth / 2 - 3, 45, 2, 2, 'FD');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      setColor(t.accent);
      doc.text('ERFAHRUNG', margin + contentWidth / 2 + 8, y + 6);
      
      const exp = character.experience || { available: 0, total: 0, spent: 0, modifier: 1.0 };
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(t.textMuted);
      doc.text('Verfügbar:', margin + contentWidth / 2 + 8, y + 14);
      setColor(t.text);
      doc.text(String(exp.available), margin + contentWidth / 2 + 40, y + 14);
      
      setColor(t.textMuted);
      doc.text('Gesamt:', margin + contentWidth / 2 + 8, y + 20);
      setColor(t.text);
      doc.text(String(exp.total), margin + contentWidth / 2 + 40, y + 20);
      
      setColor(t.textMuted);
      doc.text('Modifikator:', margin + contentWidth / 2 + 8, y + 26);
      setColor(t.text);
      doc.text(`×${exp.modifier?.toFixed(2) || '1.00'}`, margin + contentWidth / 2 + 40, y + 26);
      
      y += 53;

      // === BACKGROUNDS ===
      const bg = character.backgrounds;
      if (bg) {
        setFillColor(t.bgDark);
        doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        setColor(t.accent);
        doc.text('HINTERGRUND', margin + 5, y + 6);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        const bgItems = [
          ['Heimat', gameData.backgrounds?.homelands?.[bg.homeland]?.name],
          ['Kultur', gameData.backgrounds?.cultures?.[bg.culture]?.name],
          ['Erziehung', gameData.backgrounds?.upbringings?.[bg.upbringing]?.name],
          ['Ausbildung', gameData.backgrounds?.trainings?.[bg.training]?.name],
          ['Aufbruch', gameData.backgrounds?.callings?.[bg.calling]?.name]
        ];
        
        let bgY = y + 13;
        bgItems.forEach(([label, value], i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = margin + 5 + (col * (contentWidth / 2));
          const itemY = bgY + (row * 5);
          
          setColor(t.textMuted);
          doc.text(`${label}:`, x, itemY);
          setColor(t.text);
          doc.text(value || '-', x + 25, itemY);
        });
        
        y += 35;
      }

      // === SKILLS ===
      if (includeSkills && character.skills && Object.keys(character.skills).length > 0) {
        addNewPageIfNeeded(50);
        
        setFillColor(t.bgDark);
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        setColor(t.accent);
        doc.text('SKILLS', margin + 5, y + 5.5);
        y += 12;

        const skillEntries = Object.entries(character.skills)
          .filter(([key, level]) => level > 0)
          .sort((a, b) => b[1] - a[1]);
        
        // Skill Layout: Name links, Dots in der Mitte, Level rechts
        skillEntries.forEach(([key, level], i) => {
          const skill = gameData.skills?.[key];
          if (!skill) return;
          
          addNewPageIfNeeded(6);
          
          // Skill Name
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          setColor(t.text);
          doc.text(skill.name || key, margin, y);
          
          // Level Dots (max 10)
          const dotsX = margin + 50;
          for (let d = 0; d < 10; d++) {
            const dotX = dotsX + (d * 4);
            if (d < level) {
              setFillColor(t.accent);
              doc.circle(dotX, y - 1.5, 1.2, 'F');
            } else {
              setDrawColor(t.textMuted);
              doc.circle(dotX, y - 1.5, 1.2, 'S');
            }
          }
          
          // Level Number
          setColor(t.accent);
          doc.setFont('helvetica', 'bold');
          doc.text(String(level), dotsX + 48, y);
          
          y += 5;
        });
        
        y += 10;
      }

      // === BACKSTORY ===
      if (includeBackstory && character.backstory) {
        addNewPageIfNeeded(30);
        
        setFillColor(t.bgDark);
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        setColor(t.accent);
        doc.text('HINTERGRUNDGESCHICHTE', margin + 5, y + 5.5);
        y += 12;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        setColor(t.text);
        
        // FIX: Backstory als String behandeln, nicht als Object
        let backstoryText = '';
        if (typeof character.backstory === 'string') {
          backstoryText = character.backstory;
        } else if (typeof character.backstory === 'object') {
          // Falls es ein Object ist, versuche text property zu finden
          backstoryText = character.backstory.text || character.backstory.content || JSON.stringify(character.backstory);
        }
        
        if (backstoryText && backstoryText !== '[object Object]') {
          const backstoryLines = doc.splitTextToSize(backstoryText, contentWidth);
          backstoryLines.forEach(line => {
            addNewPageIfNeeded(5);
            doc.text(line, margin, y);
            y += 4;
          });
        } else {
          setColor(t.textMuted);
          doc.setFont('helvetica', 'italic');
          doc.text('Keine Hintergrundgeschichte vorhanden.', margin, y);
        }
      }

      // === FOOTER ===
      const footerY = pageHeight - 10;
      doc.setFontSize(7);
      setColor(t.textMuted);
      doc.text('Erstellt mit ARX - https://arx-pnp-3ff64.web.app', pageWidth / 2, footerY, { align: 'center' });

      // Save
      doc.save(`${character.name || 'Charakter'}_ARX.pdf`);
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Fehler beim Erstellen der PDF: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-arx-darker rounded-xl max-w-md w-full p-6">
        <h2 className="font-medieval text-2xl text-arx-gold mb-4 text-center">
          📄 PDF Export
        </h2>

        {/* Theme Selection */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">Theme wählen:</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === key
                    ? 'border-arx-gold bg-arx-gold/10'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
                style={{ 
                  background: theme === key ? undefined : t.bg,
                  color: t.text 
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-6 space-y-3">
          <label className="text-gray-400 text-sm block">Optionen:</label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSkills}
              onChange={(e) => setIncludeSkills(e.target.checked)}
              className="w-4 h-4 accent-arx-gold"
            />
            <span className="text-white">Skills einschließen</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBackstory}
              onChange={(e) => setIncludeBackstory(e.target.checked)}
              className="w-4 h-4 accent-arx-gold"
            />
            <span className="text-white">Hintergrundgeschichte einschließen</span>
          </label>
        </div>

        {/* Preview */}
        <div 
          className="mb-6 rounded-lg p-4 border"
          style={{ 
            background: THEMES[theme].bg,
            borderColor: THEMES[theme].border
          }}
        >
          <div style={{ color: THEMES[theme].text }} className="text-center font-bold">
            {character.name || 'Charakter'}
          </div>
          <div style={{ color: THEMES[theme].textMuted }} className="text-center text-sm">
            Vorschau
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={generatePDF}
            disabled={generating}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-arx-gold to-arx-gold-dark text-arx-darker font-bold rounded-lg hover:from-arx-gold-dark hover:to-arx-gold transition-all disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-arx-darker border-t-transparent rounded-full animate-spin"></span>
                Generiere...
              </span>
            ) : (
              '📥 PDF erstellen'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
