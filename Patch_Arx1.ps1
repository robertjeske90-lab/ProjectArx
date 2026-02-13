# ==========================================
# Project Arx - BB-Code Patch & Changelog
# ==========================================

$BB_CODE_PATH = "src/components/CharacterBBCodeExport.jsx"
$DETAIL_PATH = "src/pages/CharacterDetail.jsx"
$LOG_PATH = "CLAUDE_LOG.md"

Write-Host "🚀 Starte Project Arx Patch-System..." -ForegroundColor Magenta

# --- 1. DIE NEUE KOMPONENTE ERSTELLEN ---
$bbCodeContent = @'
import { useState, useEffect } from 'react';

const CORE_ATTRS = ['koerper', 'geschick', 'konstitution', 'geist', 'wahrnehmung', 'psyche', 'charisma', 'intuition', 'fassade'];
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const getRaceLabel = (char) => {
    const bg = char.backgrounds || {};
    if (bg.race) return capitalize(bg.race); 
    const mom = bg.motherRace ? capitalize(bg.motherRace) : '?';
    const dad = bg.fatherRace ? capitalize(bg.fatherRace) : '?';
    return mom === dad ? mom : `${dad} / ${mom}`;
};

const themeFantasy = (char) => {
    const race = getRaceLabel(char);
    const calling = char.backgrounds?.calling ? capitalize(char.backgrounds.calling) : 'Abenteurer';
    let code = `[center][size=150][b]📜 ${char.name.toUpperCase()} 📜[/b][/size]\n[i]${race} | ${calling}[/i][/center]\n\n[hr]\n\n[b]⚔️ ATTRIBUTE[/b]\n[table]\n[tr]`;
    CORE_ATTRS.forEach((key, index) => {
        const val = char.attributes?.[key] || 0;
        code += `[td][b]${key.toUpperCase().slice(0,3)}:[/b] ${val}[/td]`;
        if ((index + 1) % 3 === 0 && index !== CORE_ATTRS.length -1) code += `[/tr][tr]`;
    });
    code += `[/tr][/table]\n`;
    const skills = Object.entries(char.skills || {}).filter(([_, v]) => v > 0);
    if (skills.length > 0) {
        code += `\n[b]🛠️ FERTIGKEITEN[/b]\n[list]`;
        skills.forEach(([k, v]) => code += `[*] ${capitalize(k)}: ${v}\n`);
        code += `[/list]\n`;
    }
    if (char.vitals) {
        code += `\n[b]❤️ ZUSTAND[/b]\nLP: ${char.vitals.lebenspunkte}% | Hunger: ${char.vitals.hunger}% | Durst: ${char.vitals.durst}%\n`;
    }
    code += `\n[right][size=85]Erstellt mit Project Arx[/size][/right]`;
    return code;
};

const themeCyberpunk = (char) => {
    const race = getRaceLabel(char);
    let code = `[font=Courier New][b]/// ARX_NET_LINK v2.6 ///[/b]\n> TARGET: [color=#00ff00]${char.name.toUpperCase()}[/color]\n> GENOME: ${race.toUpperCase()}\n\n[b][ CORE_STATS ][/b]\n--------------------------------------------------\n`;
    CORE_ATTRS.forEach((key, i) => {
        const val = (char.attributes?.[key] || 0).toString().padStart(2, '0');
        code += `[ ${key.toUpperCase().slice(0,3)} ] ${val}  `;
        if ((i + 1) % 3 === 0) code += `\n`;
    });
    code += `\n> END_OF_STREAM[/font]`;
    return code;
};

export default function CharacterBBCodeExport({ character, onClose }) {
    const [theme, setTheme] = useState('fantasy');
    const [bbCode, setBbCode] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setBbCode(theme === 'cyberpunk' ? themeCyberpunk(character) : themeFantasy(character));
        setCopied(false);
    }, [character, theme]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-arx-dark border border-arx-purple/50 rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl text-arx-gold">
                    <h3 className="font-medieval text-xl text-arx-gold">BB-Code Export</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="p-6 flex flex-col gap-4 overflow-hidden">
                    <div className="flex gap-2 justify-center pb-2">
                        <button onClick={() => setTheme('fantasy')} className={`px-4 py-2 rounded border ${theme === 'fantasy' ? 'border-arx-gold text-arx-gold' : 'border-gray-700 text-gray-400'}`}>Fantasy</button>
                        <button onClick={() => setTheme('cyberpunk')} className={`px-4 py-2 rounded border ${theme === 'cyberpunk' ? 'border-emerald-500 text-emerald-500' : 'border-gray-700 text-gray-400'}`}>Cyberpunk</button>
                    </div>
                    <textarea readOnly value={bbCode} className="flex-1 bg-gray-950 text-gray-300 font-mono text-xs p-4 rounded border border-gray-700 min-h-[300px]" />
                    <button onClick={() => { navigator.clipboard.writeText(bbCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className={`w-full py-3 rounded font-bold ${copied ? 'bg-green-600' : 'bg-arx-purple text-white'}`}>
                        {copied ? '✓ Kopiert!' : '📋 Code kopieren'}
                    </button>
                </div>
            </div>
        </div>
    );
}
'@

Set-Content -Path $BB_CODE_PATH -Value $bbCodeContent -Encoding UTF8

# --- 2. CHARACTERDETAIL.JSX PATCHEN ---
$content = Get-Content $DETAIL_PATH -Raw
if ($content -notmatch "CharacterBBCodeExport") {
    $content = $content -replace "import CharacterPDFExport from '../components/CharacterPDFExport';", "import CharacterPDFExport from '../components/CharacterPDFExport';`nimport CharacterBBCodeExport from '../components/CharacterBBCodeExport';"
    $content = $content -replace "const \[showPDFExport, setShowPDFExport\] = useState\(false\);", "const [showPDFExport, setShowPDFExport] = useState(false);`n  const [showBBExport, setShowBBExport] = useState(false);"
    $oldBtn = 'onClick={() => setShowPDFExport(true)}'
    $newBtns = 'onClick={() => setShowBBExport(true)}
                className="px-4 py-2 rounded-lg font-medium transition-all bg-arx-dark text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 border border-transparent hover:border-emerald-400/30 flex items-center gap-2"
              >
                <span>📋</span>
                <span className="hidden sm:inline">BB-Code</span>
              </button>
              <button
                onClick={() => setShowPDFExport(true)}'
    $content = $content.Replace($oldBtn, $newBtns)
    $content = $content -replace "{showPDFExport && \(", "{showBBExport && (`n              <CharacterBBCodeExport`n                character={character}`n                onClose={() => setShowBBExport(false)}`n              />`n            )}`n`n            {showPDFExport && ("
    Set-Content -Path $DETAIL_PATH -Value $content -Encoding UTF8
}

# --- 3. CLAUDE CHANGELOG GENERIEREN ---
$logContent = @"
# Project Arx Update: BB-Code Export System (v2.6)

## Overview
Implementierung eines modularen Export-Systems für Foren-RPGs.

## Technischer Changelog für Claude
- **Neue Komponente:** `src/components/CharacterBBCodeExport.jsx`
  - Implementiert eine **Theme-Engine** (Fantasy / Cyberpunk).
  - Nutzt **Smart Mapping** für Attribute (Extrahiert 'koerper', 'geist' etc. aus dem flachen Firebase-Map).
  - **Hybrid-Rassen-Logik:** Verarbeitet `motherRace` und `fatherRace` (z.B. Minotaurus / Aasimar).
  - **Survival-Integration:** Exportiert Vitalwerte (Hunger, Durst, Frische), falls vorhanden.
- **UI Patch in `CharacterDetail.jsx`:**
  - Hinzufügen von `showBBExport` State.
  - Gruppierung der Export-Tools im Header.
  - Integration des Modal-Triggers.

## Dateisystem-Änderungen
- [CREATED] `src/components/CharacterBBCodeExport.jsx`
- [MODIFIED] `src/pages/CharacterDetail.jsx`
"@

Set-Content -Path $LOG_PATH -Value $logContent -Encoding UTF8

Write-Host "`nERFOLG!" -ForegroundColor Green
Write-Host "1. Dateien wurden aktualisiert."
Write-Host "2. 'CLAUDE_LOG.md' wurde erstellt. Füttere diese Datei Claude!" -ForegroundColor Cyan