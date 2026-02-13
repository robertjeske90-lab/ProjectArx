# Project Arx Update: BB-Code Export System (v2.6)

## Overview
Implementierung eines modularen Export-Systems fÃ¼r Foren-RPGs.

## Technischer Changelog fÃ¼r Claude
- **Neue Komponente:** src/components/CharacterBBCodeExport.jsx
  - Implementiert eine **Theme-Engine** (Fantasy / Cyberpunk).
  - Nutzt **Smart Mapping** fÃ¼r Attribute (Extrahiert 'koerper', 'geist' etc. aus dem flachen Firebase-Map).
  - **Hybrid-Rassen-Logik:** Verarbeitet motherRace und atherRace (z.B. Minotaurus / Aasimar).
  - **Survival-Integration:** Exportiert Vitalwerte (Hunger, Durst, Frische), falls vorhanden.
- **UI Patch in CharacterDetail.jsx:**
  - HinzufÃ¼gen von showBBExport State.
  - Gruppierung der Export-Tools im Header.
  - Integration des Modal-Triggers.

## Dateisystem-Ã„nderungen
- [CREATED] src/components/CharacterBBCodeExport.jsx
- [MODIFIED] src/pages/CharacterDetail.jsx
