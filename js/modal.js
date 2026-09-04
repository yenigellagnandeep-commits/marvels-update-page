/**
 * Character Profile Dossier Modal Controller
 * Manages modal animations, tab switching (3D Holo vs 2D Comic Art),
 * power grid animated meters, debut details, and storyline lists.
 */

class CharacterModal {
  constructor() {
    this.overlay = document.getElementById('modal-overlay');
    this.closeBtn = document.getElementById('modal-close');
    this.viewerContainer = document.getElementById('viewer-3d-container');
    this.artViewContainer = document.getElementById('art-view-container');
    this.tab3D = document.getElementById('tab-3d');
    this.tabArt = document.getElementById('tab-art');

    this.wireframeBtn = document.getElementById('viewer-wireframe-btn');
    this.resetBtn = document.getElementById('viewer-reset-btn');
    this.rotateBtn = document.getElementById('viewer-rotate-btn');

    this.viewer3D = null;
    this.activeCharacter = null;

    this.init();
  }

  init() {
    if (!this.overlay) return;

    // Initialize 3D Viewer inside container
    if (this.viewerContainer && window.HeroViewer3D) {
      this.viewer3D = new window.HeroViewer3D(this.viewerContainer);
    }

    this.setupEvents();
  }

  setupEvents() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Click outside modal container to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Keyboard ESC to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.close();
      }
    });

    // View Mode Tabs: 3D vs 2D Comic Art
    if (this.tab3D && this.tabArt) {
      this.tab3D.addEventListener('click', () => this.setViewMode('3d'));
      this.tabArt.addEventListener('click', () => this.setViewMode('art'));
    }

    // 3D Controls
    if (this.wireframeBtn) {
      this.wireframeBtn.addEventListener('click', () => {
        if (this.viewer3D) {
          const isWire = this.viewer3D.toggleWireframe();
          this.wireframeBtn.textContent = isWire ? 'Solid Mode' : 'Wireframe';
        }
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        if (this.viewer3D) this.viewer3D.resetOrientation();
      });
    }

    if (this.rotateBtn) {
      this.rotateBtn.addEventListener('click', () => {
        if (this.viewer3D) {
          const rotating = this.viewer3D.toggleAutoRotate();
          this.rotateBtn.textContent = rotating ? 'Pause' : 'Rotate';
        }
      });
    }
  }

  setViewMode(mode) {
    if (mode === '3d') {
      this.tab3D.classList.add('active');
      this.tabArt.classList.remove('active');
      this.viewerContainer.style.display = 'flex';
      this.artViewContainer.classList.remove('active');
      if (this.viewer3D) {
        this.viewer3D.onResize();
      }
    } else {
      this.tabArt.classList.add('active');
      this.tab3D.classList.remove('active');
      this.viewerContainer.style.display = 'none';
      this.artViewContainer.classList.add('active');
    }
  }

  open(character) {
    this.activeCharacter = character;
    this.renderCharacter(character);

    // Reset view mode to 3D
    this.setViewMode('3d');

    // Load 3D model
    if (this.viewer3D) {
      this.viewer3D.loadCharacterModel(character);
    }

    // Show modal & prevent background scroll
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Trigger stat meters animation after slight delay
    setTimeout(() => {
      this.animatePowerGrid(character.powerGrid);
    }, 120);
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    this.activeCharacter = null;
  }

  renderCharacter(char) {
    // Dossier ID
    const dossierIdEl = document.getElementById('modal-dossier-id');
    if (dossierIdEl) dossierIdEl.textContent = `DOSSIER #${char.id.toUpperCase()}`;

    // Alias & Real Name
    const aliasEl = document.getElementById('dossier-alias');
    if (aliasEl) aliasEl.textContent = char.alias;

    const realnameEl = document.getElementById('dossier-realname');
    if (realnameEl) realnameEl.textContent = `${char.name} — "${char.tagline || ''}"`;

    // 2D Comic Art Image & Quote
    const artImg = document.getElementById('art-view-img');
    if (artImg) {
      artImg.src = char.highResImage || char.thumbnail;
      artImg.alt = `${char.alias} Official Comic Art`;
    }

    const artQuote = document.getElementById('art-view-quote');
    if (artQuote) {
      artQuote.textContent = `"${char.quote || char.tagline}"`;
    }

    // Comic Debut
    const debut = char.comicDebut || {};
    const debutTitleEl = document.getElementById('debut-comic-title');
    if (debutTitleEl) debutTitleEl.textContent = `${debut.comicTitle || 'Unknown'} ${debut.issue || ''}`;

    const debutDateEl = document.getElementById('debut-date');
    if (debutDateEl) debutDateEl.textContent = `${debut.coverDate || debut.releaseYear || 'Unknown'}`;

    const debutCreatorsEl = document.getElementById('debut-creators');
    if (debutCreatorsEl) debutCreatorsEl.textContent = debut.creators || 'Marvel Comics Staff';

    // Biography
    const bioEl = document.getElementById('dossier-bio');
    if (bioEl) bioEl.textContent = char.biography || 'No tactical biography on file.';

    // Power Capabilities Tags
    const powersListEl = document.getElementById('dossier-powers');
    if (powersListEl && char.powers) {
      powersListEl.innerHTML = char.powers.map(p => `
        <span class="power-pill">${p}</span>
      `).join('');
    }

    // Power Grid Structure
    this.renderPowerGridShell(char.powerGrid);

    // Key Comic Book Storylines
    const storylinesEl = document.getElementById('dossier-storylines');
    if (storylinesEl && char.keyStorylines) {
      storylinesEl.innerHTML = char.keyStorylines.map(story => `
        <div class="storyline-card">
          <div class="storyline-header">
            <h4 class="storyline-title">${story.title}</h4>
            <span class="storyline-year">${story.year}</span>
          </div>
          <span class="storyline-issues">${story.issues || ''}</span>
          <p class="storyline-synopsis">${story.synopsis}</p>
        </div>
      `).join('');
    }
  }

  renderPowerGridShell(grid = {}) {
    const gridContainer = document.getElementById('dossier-power-grid');
    if (!gridContainer) return;

    const stats = [
      { key: 'durability', name: 'Durability', max: 7 },
      { key: 'energyProjection', name: 'Energy Projection', max: 7 },
      { key: 'fightingSkills', name: 'Fighting Skills', max: 7 },
      { key: 'intelligence', name: 'Intelligence', max: 7 },
      { key: 'speed', name: 'Speed', max: 7 },
      { key: 'strength', name: 'Strength', max: 7 }
    ];

    gridContainer.innerHTML = stats.map(st => {
      const item = grid[st.key] || { rating: 1, label: 'Standard' };
      return `
        <div class="grid-stat-item">
          <div class="grid-stat-header">
            <span class="grid-stat-name">${st.name}</span>
            <span class="grid-stat-tier">${item.rating} / 7</span>
          </div>
          <div class="grid-meter-bar">
            <div class="grid-meter-fill" id="meter-${st.key}" style="width: 0%;"></div>
          </div>
          <span class="grid-stat-desc">${item.label}</span>
        </div>
      `;
    }).join('');
  }

  animatePowerGrid(grid = {}) {
    const stats = ['durability', 'energyProjection', 'fightingSkills', 'intelligence', 'speed', 'strength'];
    stats.forEach(key => {
      const fillEl = document.getElementById(`meter-${key}`);
      if (fillEl && grid[key]) {
        const pct = Math.min(100, Math.round((grid[key].rating / 7) * 100));
        fillEl.style.width = `${pct}%`;
      }
    });
  }
}

window.CharacterModal = CharacterModal;
