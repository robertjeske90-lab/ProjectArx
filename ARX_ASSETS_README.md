# ARX Assets Repository

Externe Assets für [Project ARX](https://github.com/robertjeske90-lab/ProjectArx) - gehostet via GitHub Pages.

## 🌐 CDN URL

```
https://robertjeske90-lab.github.io/arx-assets/
```

## 📁 Struktur

```
arx-assets/
├── lpc/                    # LPC Character Sprites (~580 MB)
│   ├── body/               # Körper & Hautfarben
│   ├── hair/               # Frisuren
│   ├── beards/             # Bärte
│   ├── torso/              # Oberkörper-Rüstung
│   ├── legs/               # Beine
│   ├── feet/               # Schuhe
│   ├── hat/                # Kopfbedeckung
│   ├── cape/               # Umhänge
│   ├── weapon/             # Waffen
│   └── shield/             # Schilde
│
├── portraits/              # Charakter-Portraits (~100 MB)
│   ├── human/
│   ├── elf/
│   ├── dwarf/
│   ├── orc/
│   ├── tiefling/
│   └── misc/
│
├── music/                  # Musik & Soundtracks (~200 MB)
│   ├── themes/             # Charakter-Themes
│   ├── ambient/            # Atmosphäre
│   └── combat/             # Kampfmusik
│
└── sfx/                    # Sound Effects (~50 MB)
    ├── ui/
    ├── combat/
    ├── magic/
    └── environment/
```

## 📜 Lizenzen

### LPC Sprites
- **Lizenz:** CC-BY-SA 3.0 / GPL 3.0 / OGA-BY 3.0
- **Quelle:** [Universal LPC Spritesheet Character Generator](https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator)
- **Credits:** Siehe CREDITS.md

### Portraits
- **Lizenz:** Varies (CC0 / CC-BY)
- **Quellen:** OpenGameArt, itch.io

### Musik
- **Lizenz:** Varies (CC0 / CC-BY)
- **Quellen:** OpenGameArt, FreePD, Incompetech

## 🔧 Verwendung in ARX

```javascript
// In der App:
const ASSET_BASE = 'https://robertjeske90-lab.github.io/arx-assets';

// Sprite laden:
const spriteUrl = `${ASSET_BASE}/lpc/body/bodies/male/idle/light.png`;

// Portrait laden:
const portraitUrl = `${ASSET_BASE}/portraits/human/male_warrior_01.png`;

// Musik laden:
const musicUrl = `${ASSET_BASE}/music/themes/heroic_01.mp3`;
```

## 📦 Deployment

Dieses Repository wird automatisch via GitHub Pages deployed.

**URL:** https://robertjeske90-lab.github.io/arx-assets/

## 🙏 Credits

Siehe [CREDITS.md](./CREDITS.md) für vollständige Attribution.
