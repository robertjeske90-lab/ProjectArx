# 🏰 Project Arx - MVP

Ein modulares Pen & Paper Rollenspiel-System für jedes Setting.

## 🚀 Schnellstart

### Voraussetzungen
- Node.js (v18 oder höher empfohlen)
- npm (kommt mit Node.js)

### Installation

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```

3. **Browser öffnen:**
   - Die App läuft standardmäßig auf `http://localhost:5173`

## 📁 Projektstruktur

```
projectarx/
├── public/                 # Statische Assets
├── src/
│   ├── components/         # Wiederverwendbare UI-Komponenten
│   │   ├── AttributeSlider.jsx
│   │   ├── CharacterCard.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── SkillSlider.jsx
│   ├── contexts/           # React Context Provider
│   │   └── AuthContext.jsx
│   ├── hooks/              # Custom React Hooks
│   │   └── useCharacters.js
│   ├── pages/              # Seiten/Routes
│   │   ├── CharacterDetail.jsx
│   │   ├── CharacterList.jsx
│   │   ├── CreateCharacter.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx             # Haupt-App mit Routing
│   ├── firebase.js         # Firebase Konfiguration
│   ├── index.css           # Globale Styles + Tailwind
│   └── main.jsx            # Entry Point
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## 🎮 Features (MVP)

### ✅ Implementiert
- **Authentication**
  - Registrierung mit E-Mail/Passwort
  - Login/Logout
  - Geschützte Routen

- **Character Management**
  - Charakter erstellen mit Name & Portrait
  - Attribute (STR, DEX, INT, CON, WIS, CHA) - Werte 1-20
  - Skills (Combat, Magic, Social, Crafting) - Werte 0-100
  - Charakterliste anzeigen
  - Charakterdetails ansehen
  - Charaktere löschen

- **UI/UX**
  - Responsive Design
  - Dark Theme mit RPG-Ästhetik
  - Interaktive Slider für Stats
  - Portrait Upload zu Firebase Storage

### 🔜 Phase 2 (später)
- Echtes Attribut-System
- Progressive Skill Trees
- Tech-Level System
- GOAT-Style Character Creation
- Combat Mechanics

## 🔧 Firebase Konfiguration

Das Projekt ist bereits mit Firebase verbunden:
- **Project ID:** projectarx-b11bb
- **Region:** europe-west
- **Services:** Authentication, Firestore, Storage

### Firestore Rules (für Produktion anpassen!)

Aktuell sind die Rules auf "test mode" - für Produktion solltest du sie anpassen:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users können nur ihr eigenes Profil lesen/schreiben
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Characters nur für den Besitzer
    match /characters/{characterId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### Storage Rules (für Produktion anpassen!)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portraits/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

## 🎨 Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Fonts:** Cinzel (Medieval-Style)

## 📜 Scripts

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Startet den Entwicklungsserver |
| `npm run build` | Erstellt die Produktions-Build |
| `npm run preview` | Vorschau der Produktions-Build |
| `npm run lint` | Führt ESLint aus |

## 🎯 Nächste Schritte

1. **Firestore Index erstellen** (falls Fehler auftritt):
   - Firebase Console → Firestore → Indexes
   - Collection: `characters`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

2. **Firebase Rules aktivieren** (vor Production):
   - Siehe oben für empfohlene Rules

3. **Phase 2 planen**:
   - Skill Tree Struktur definieren
   - Tech Levels ausarbeiten
   - GOAT-Fragen entwickeln

## 🐛 Troubleshooting

### "Missing or insufficient permissions"
→ Firestore Rules prüfen (sind im Test Mode?)

### "Index required"
→ Firebase Console zeigt Link zum Erstellen des Index

### Bilder laden nicht
→ Storage Rules prüfen, CORS Settings checken

## 📄 Lizenz

Privates Projekt - Alle Rechte vorbehalten.

---

**Made with ⚔️ for the Pen & Paper Community**
