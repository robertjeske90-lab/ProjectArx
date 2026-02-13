import React, { useState } from 'react';

// Farben für Vitals (strikt wie angefordert)
const VITAL_COLORS = {
  hp: '#FF4444',      // Rot für HP
  geist: '#AA88FF',   // Lila für Geist
  frische: '#44AAFF'  // Blau für Frische
};

export default function CharacterBBCodeExport({ character, gameData }) {
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState('bbcode'); // 'bbcode' | 'preview'

  if (!character) return null;

  // Generiere BB-Code
  const generateBBCode = () => {
    const { name, cosmetics, attributes, skills, vitals, backstory } = character;
    
    // Header mit Namen
    let bb = `[center][size=24][color=#C9A227][b]═══ ${name} ═══[/b][/color][/size][/center]\n\n`;
    
    // Titel und Rasse
    if (cosmetics?.title || cosmetics?.race) {
      bb += `[center][color=#888888]`;
      if (cosmetics.title) bb += `[i]${cosmetics.title}[/i]`;
      if (cosmetics.title && cosmetics.race) bb += ` • `;
      if (cosmetics.race) bb += `${cosmetics.race}`;
      bb += `[/color][/center]\n\n`;
    }

    // Vitals Bar (HP/Geist/Frische)
    bb += `[center]`;
    bb += `[color=${VITAL_COLORS.hp}]❤ HP: ${vitals?.hp || 100}/${vitals?.maxHp || 100}[/color] `;
    bb += `[color=${VITAL_COLORS.geist}]🧠 Geist: ${vitals?.geist || 100}/${vitals?.maxGeist || 100}[/color] `;
    bb += `[color=${VITAL_COLORS.frische}]⚡ Frische: ${vitals?.frische || 100}/${vitals?.maxFrische || 100}[/color]`;
    bb += `[/center]\n\n`;

    // Trennlinie
    bb += `[center][color=#6B46C1]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/color][/center]\n\n`;

    // Attribute (3x3 Grid simuliert)
    bb += `[b][color=#C9A227]〚 ATTRIBUTE 〛[/color][/b]\n`;
    bb += `[code]`;
    
    const attrKeys = Object.keys(attributes || {});
    const attrLabels = {
      koerper: 'KÖR', geschick: 'GES', konstitution: 'KON',
      geist: 'GEI', wahrnehmung: 'WAH', psyche: 'PSY',
      charisma: 'CHA', intuition: 'INT', fassade: 'FAS'
    };
    
    // 3 Reihen á 3 Attribute
    for (let row = 0; row < 3; row++) {
      let line = '';
      for (let col = 0; col < 3; col++) {
        const idx = row * 3 + col;
        if (idx < attrKeys.length) {
          const key = attrKeys[idx];
          const val = attributes[key] || 10;
          const label = attrLabels[key] || key.toUpperCase().slice(0, 3);
          line += `${label}: ${String(val).padStart(2, ' ')}  `;
        }
      }
      bb += line.trim() + '\n';
    }
    bb += `[/code]\n\n`;

    // Hybrid-Anzeige (falls vorhanden)
    if (cosmetics?.parentRaces?.father || cosmetics?.parentRaces?.mother) {
      bb += `[color=#888888][i]Abstammung: `;
      bb += `${cosmetics.parentRaces?.father || '?'} (Vater) × ${cosmetics.parentRaces?.mother || '?'} (Mutter)`;
      bb += `[/i][/color]\n\n`;
    }

    // Trennlinie
    bb += `[center][color=#6B46C1]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/color][/center]\n\n`;

    // Skills (gruppiert nach Bereich)
    bb += `[b][color=#10B981]〚 SKILLS 〛[/color][/b]\n`;
    
    if (skills && Object.keys(skills).length > 0) {
      // Gruppiere Skills nach Bereich
      const skillGroups = {};
      Object.entries(skills).forEach(([key, value]) => {
        const skillData = gameData?.skills?.[key];
        const bereich = skillData?.bereich || 'Sonstige';
        if (!skillGroups[bereich]) skillGroups[bereich] = [];
        skillGroups[bereich].push({
          key,
          name: skillData?.name || key,
          value,
          tier: skillData?.tier || 1
        });
      });

      Object.entries(skillGroups).forEach(([bereich, skillList]) => {
        bb += `\n[color=#888888]» ${bereich}[/color]\n`;
        skillList.sort((a, b) => a.tier - b.tier);
        skillList.forEach(skill => {
          const stars = '★'.repeat(Math.min(skill.value, 5)) + '☆'.repeat(Math.max(0, 5 - skill.value));
          bb += `  ${skill.name}: ${stars} (${skill.value})\n`;
        });
      });
    } else {
      bb += `[i]Keine Skills[/i]\n`;
    }

    bb += `\n`;

    // Backstory (falls vorhanden)
    if (backstory?.notes) {
      bb += `[center][color=#6B46C1]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/color][/center]\n\n`;
      bb += `[b][color=#C9A227]〚 HINTERGRUND 〛[/color][/b]\n`;
      bb += `[quote]${backstory.notes}[/quote]\n\n`;
    }

    // Footer
    bb += `[center][color=#444444][size=10]Erstellt mit Project ARX[/size][/color][/center]`;

    return bb;
  };

  const bbCode = generateBBCode();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bbCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="bg-arx-dark border border-arx-purple/30 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medieval text-xl text-arx-gold">📋 BB-Code Export</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode('bbcode')}
            className={`px-3 py-1 rounded text-sm ${previewMode === 'bbcode' ? 'bg-arx-purple text-white' : 'bg-arx-darker text-gray-400'}`}
          >
            Code
          </button>
          <button
            onClick={() => setPreviewMode('preview')}
            className={`px-3 py-1 rounded text-sm ${previewMode === 'preview' ? 'bg-arx-purple text-white' : 'bg-arx-darker text-gray-400'}`}
          >
            Vorschau
          </button>
        </div>
      </div>

      {previewMode === 'bbcode' ? (
        <div className="relative">
          <pre className="bg-arx-darker rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap font-mono">
            {bbCode}
          </pre>
          <button
            onClick={copyToClipboard}
            className={`absolute top-2 right-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              copied 
                ? 'bg-emerald-600 text-white' 
                : 'bg-arx-purple text-white hover:bg-arx-purple-dark'
            }`}
          >
            {copied ? '✓ Kopiert!' : '📋 Kopieren'}
          </button>
        </div>
      ) : (
        <BBCodePreview bbCode={bbCode} />
      )}

      <p className="text-gray-500 text-sm mt-4">
        💡 Dieser Code funktioniert in den meisten Foren mit BB-Code Support (z.B. phpBB, vBulletin, XenForo).
      </p>
    </div>
  );
}

// BB-Code Preview (simulated rendering)
function BBCodePreview({ bbCode }) {
  // Simple BB-Code to HTML conversion for preview
  const convertToHTML = (bb) => {
    let html = bb
      // Colors
      .replace(/\[color=(#[A-Fa-f0-9]{6})\](.*?)\[\/color\]/gs, '<span style="color:$1">$2</span>')
      // Size
      .replace(/\[size=(\d+)\](.*?)\[\/size\]/gs, '<span style="font-size:$1px">$2</span>')
      // Bold
      .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>')
      // Italic
      .replace(/\[i\](.*?)\[\/i\]/gs, '<em>$1</em>')
      // Center
      .replace(/\[center\](.*?)\[\/center\]/gs, '<div style="text-align:center">$1</div>')
      // Code
      .replace(/\[code\](.*?)\[\/code\]/gs, '<pre style="background:#1a1a2e;padding:8px;border-radius:4px;font-family:monospace">$1</pre>')
      // Quote
      .replace(/\[quote\](.*?)\[\/quote\]/gs, '<blockquote style="border-left:3px solid #6B46C1;padding-left:12px;margin:8px 0;color:#aaa">$1</blockquote>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return html;
  };

  return (
    <div 
      className="bg-[#1a1a2e] rounded-lg p-6 max-h-96 overflow-y-auto border border-arx-purple/20"
      style={{ fontFamily: 'Georgia, serif' }}
      dangerouslySetInnerHTML={{ __html: convertToHTML(bbCode) }}
    />
  );
}
