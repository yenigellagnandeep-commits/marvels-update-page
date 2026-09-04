# Marvel Universe Archive — Superhero Wiki & Character Database

A modern, fully responsive Marvel Comics wiki and character database web application with a dark superhero theme (void black `#08090c`, Marvel crimson red `#e23636`, and metallic slate gray `#1e2433`).

---

## 🌟 Key Features

1. **Top Navigation & Header**:
   - Glowing "Marvel Universe Archive" logo with SHIELD classification badge.
   - Quick jump navigation: *Home*, *Character Roster*, *Latest News*, *Archive Info*.
   - Instant dynamic live Search Bar (with shortcut `/` or clear button) filtering across hero aliases, real names, powers, and creators.

2. **Character Showcase Hub**:
   - Interactive category filter pills: `All Comics`, `Avengers`, `X-Men`, `Cosmic`, `Villains`, `Street Level`.
   - Real-time record counters on filter buttons.
   - Responsive character cards with hover perspective tilt, red border glow, comic debut badges, and mini power meters.

3. **Detailed Character Dossier Modal & 3D Viewer Container**:
   - **Dual Visual Container**: Switch between an **Interactive 3D Holo-Viewer** (Three.js WebGL rendering with kinetic rotation, wireframe toggle, orbit dragging, and hero-themed particle cloud) and **High-Resolution Comic Art**.
   - Standard `<model-viewer>` tag support for `.glb`/`.gltf` 3D files.
   - **Comic Debut Card**: First comic title, issue #, release cover date, and creators.
   - **Tactical Biography**: Detailed origin, historical lore, and character evolution.
   - **Itemized Marvel Power Grid (Ratings 1 to 7)**: Animated stat meters for Durability, Energy Projection, Fighting Skills, Intelligence, Speed, and Strength.
   - **Key Comic Book Storylines**: Chronological watershed story arcs with issue spans and synopses.

4. **Dynamic Data Architecture (`characters.json`)**:
   - Pre-populated with 6 diverse Marvel icons: **Spider-Man**, **Iron Man**, **Wolverine**, **Storm**, **Doctor Strange**, and **Thanos**.
   - Clean, modular JSON format designed for effortless addition of new characters.

5. **Latest Marvel Newsfeed (`news.json`)**:
   - Filterable dispatches across *Comic Releases*, *Cinematic*, and *Storyline Lore*.

---

## 🚀 Quick Start

### Running the Local Development Server
The application is pre-configured with a Python server:

```powershell
cd C:\Users\yenig\.gemini\antigravity\scratch\marvel-universe-archive
python server.py
```

Then open your browser and navigate to:
```
http://127.0.0.1:8000/
```

---

## 📖 How to Add New Characters to `characters.json`

To add any new superhero or villain, open `data/characters.json` and append a new JSON object into the `"characters"` array using this schema:

```json
{
  "id": "black-panther",
  "alias": "Black Panther",
  "name": "T'Challa",
  "categories": ["Avengers", "All Comics"],
  "primaryCategory": "Avengers",
  "tagline": "The King of Wakanda",
  "quote": "Wakanda will no longer watch from the shadows.",
  "comicDebut": {
    "comicTitle": "Fantastic Four",
    "issue": "#52",
    "releaseYear": 1966,
    "creators": "Stan Lee & Jack Kirby",
    "coverDate": "July 1966"
  },
  "thumbnail": "https://example.com/black-panther-thumb.jpg",
  "highResImage": "https://example.com/black-panther-full.jpg",
  "modelConfig": {
    "themeColor": "#9333ea",
    "accentColor": "#cbd5e1",
    "wireframeColor": "#a855f7",
    "particleCount": 220,
    "symbol": "CORE",
    "glbModelUrl": ""
  },
  "biography": "King T'Challa is the monarch of the technologically advanced African nation of Wakanda...",
  "powers": [
    "Heart-Shaped Herb Enhancement",
    "Vibranium Weave Kinetic Armor",
    "Master Martial Artist & Tactician"
  ],
  "powerGrid": {
    "durability": { "rating": 4, "label": "Superhuman (Vibranium Suit)" },
    "energyProjection": { "rating": 3, "label": "Short range kinetic pulses" },
    "fightingSkills": { "rating": 6, "label": "Master Combatant" },
    "intelligence": { "rating": 5, "label": "Genius Physicist & Tactician" },
    "speed": { "rating": 3, "label": "Enhanced Peak Human" },
    "strength": { "rating": 3, "label": "Enhanced (800 lbs - 2 Tons)" }
  },
  "keyStorylines": [
    {
      "title": "A Nation Under Our Feet",
      "year": 2016,
      "issues": "Black Panther (Vol. 6) #1–12",
      "synopsis": "Ta-Nehisi Coates crafts a nuanced sociopolitical saga..."
    }
  ]
}
```

---

## 📂 Project Structure

```
marvel-universe-archive/
├── index.html                   # Semantic HTML5 Application Shell
├── server.py                    # Local Python HTTP server with CORS headers
├── README.md                    # Project documentation and schema guide
├── data/
│   ├── characters.json          # Pre-populated Marvel roster database
│   └── news.json                # Latest comic & cinematic news items
├── css/
│   ├── variables.css            # Dark superhero colors & tokens
│   ├── base.css                 # Base resets, typography, and badges
│   ├── navbar.css               # Header, logo, live search bar, mobile menu
│   ├── hero.css                 # Hero showcase & spotlight card
│   ├── roster.css               # Category filters & responsive card grid
│   ├── modal.css                # Detailed dossier modal & 3D container
│   └── news.css                 # Newsfeed layout & cards
└── js/
    ├── viewer3d.js              # Interactive 3D WebGL Holo-Viewer & model-viewer
    ├── roster.js                # Character filtering, search & card generation
    ├── modal.js                 # Dossier modal controller & stat meter animations
    ├── news.js                  # Newsfeed rendering & filter controller
    └── app.js                   # Application bootstrap & event orchestration
```
