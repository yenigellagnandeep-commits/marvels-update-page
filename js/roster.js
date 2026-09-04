/**
 * Character Roster Hub Controller
 * Manages category filtering, live search queries, card rendering, and dossier triggers.
 */

class CharacterRoster {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('character-grid');
    this.filterContainer = options.filterContainer || document.getElementById('filter-pills');
    this.searchInput = options.searchInput || document.getElementById('search-input');
    this.searchClearBtn = options.searchClearBtn || document.getElementById('search-clear');
    this.statsSummary = options.statsSummary || document.getElementById('roster-stats-summary');
    this.onSelectCharacter = options.onSelectCharacter || (() => {});

    this.characters = [];
    this.activeCategory = 'All Comics';
    this.searchQuery = '';

    this.init();
  }

  async init() {
    await this.fetchCharacters();
    this.setupEvents();
    this.renderFilters();
    this.renderGrid();
  }

  async fetchCharacters() {
    try {
      const res = await fetch('data/characters.json');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      this.characters = data.characters || [];
    } catch (err) {
      console.error('Failed to load characters.json:', err);
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3 class="empty-title">Archive Data Offline</h3>
          <p class="empty-desc">Could not connect to the Marvel Universe database. Check characters.json file path.</p>
        </div>
      `;
    }
  }

  setupEvents() {
    // Search Input with Debounce/Instant response
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (this.searchClearBtn) {
          if (this.searchQuery.length > 0) {
            this.searchClearBtn.classList.add('visible');
            this.searchInput.parentElement.classList.add('has-text');
          } else {
            this.searchClearBtn.classList.remove('visible');
            this.searchInput.parentElement.classList.remove('has-text');
          }
        }
        this.renderGrid();
      });
    }

    if (this.searchClearBtn) {
      this.searchClearBtn.addEventListener('click', () => {
        this.searchInput.value = '';
        this.searchQuery = '';
        this.searchClearBtn.classList.remove('visible');
        this.searchInput.parentElement.classList.remove('has-text');
        this.searchInput.focus();
        this.renderGrid();
      });
    }

    // Keyboard shortcut '/' to focus search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.searchInput) {
        e.preventDefault();
        if (this.searchInput) {
          this.searchInput.focus();
        }
      }
    });
  }

  getAvailableCategories() {
    const defaultCategories = ['All Comics', 'Avengers', 'X-Men', 'Cosmic', 'Villains', 'Street Level'];
    return defaultCategories;
  }

  getFilteredCharacters() {
    return this.characters.filter(char => {
      // 1. Category check
      const matchesCategory = (this.activeCategory === 'All Comics') ||
        (char.categories && char.categories.includes(this.activeCategory)) ||
        (char.primaryCategory === this.activeCategory);

      if (!matchesCategory) return false;

      // 2. Search query check
      if (!this.searchQuery) return true;

      const q = this.searchQuery;
      const aliasMatch = char.alias && char.alias.toLowerCase().includes(q);
      const nameMatch = char.name && char.name.toLowerCase().includes(q);
      const categoryMatch = char.categories && char.categories.some(c => c.toLowerCase().includes(q));
      const powerMatch = char.powers && char.powers.some(p => p.toLowerCase().includes(q));
      const debutMatch = char.comicDebut && (
        char.comicDebut.comicTitle.toLowerCase().includes(q) ||
        char.comicDebut.creators.toLowerCase().includes(q) ||
        char.comicDebut.issue.toLowerCase().includes(q)
      );

      return aliasMatch || nameMatch || categoryMatch || powerMatch || debutMatch;
    });
  }

  renderFilters() {
    if (!this.filterContainer) return;
    const categories = this.getAvailableCategories();

    this.filterContainer.innerHTML = categories.map(cat => {
      let count = 0;
      if (cat === 'All Comics') {
        count = this.characters.length;
      } else {
        count = this.characters.filter(c => 
          (c.categories && c.categories.includes(cat)) || c.primaryCategory === cat
        ).length;
      }

      const isActive = cat === this.activeCategory ? 'active' : '';
      return `
        <button class="filter-btn ${isActive}" data-category="${cat}">
          <span>${cat}</span>
          <span class="filter-count">${count}</span>
        </button>
      `;
    }).join('');

    // Attach click events
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.category;
        this.filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderGrid();
      });
    });
  }

  renderGrid() {
    if (!this.container) return;
    const filtered = this.getFilteredCharacters();

    // Update stats summary text
    if (this.statsSummary) {
      this.statsSummary.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${this.characters.length}</strong> Marvel records`;
    }

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No Matching Dossiers Found</h3>
          <p class="empty-desc">No superhero or villain matches "<strong>${this.searchQuery}</strong>" in the category "${this.activeCategory}".</p>
          <button class="btn-secondary" id="reset-filter-btn" style="margin-top: 0.8rem;">
            Clear Search & Filters
          </button>
        </div>
      `;

      const resetBtn = document.getElementById('reset-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.activeCategory = 'All Comics';
          this.searchQuery = '';
          if (this.searchInput) this.searchInput.value = '';
          if (this.searchClearBtn) this.searchClearBtn.classList.remove('visible');
          this.renderFilters();
          this.renderGrid();
        });
      }
      return;
    }

    this.container.innerHTML = filtered.map(char => this.createCardHTML(char)).join('');

    // Attach click listeners to cards
    this.container.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const character = this.characters.find(c => c.id === id);
        if (character) {
          this.onSelectCharacter(character);
        }
      });
    });
  }

  createCardHTML(char) {
    // Badge category classes
    const primaryCat = char.primaryCategory || 'Avengers';
    let badgeClass = 'badge-avengers';
    if (primaryCat === 'X-Men') badgeClass = 'badge-xmen';
    else if (primaryCat === 'Cosmic') badgeClass = 'badge-cosmic';
    else if (primaryCat === 'Villains') badgeClass = 'badge-villains';

    // Power grid preview ratings (out of 7)
    const strengthPct = Math.round(((char.powerGrid?.strength?.rating || 3) / 7) * 100);
    const speedPct = Math.round(((char.powerGrid?.speed?.rating || 3) / 7) * 100);
    const combatPct = Math.round(((char.powerGrid?.fightingSkills?.rating || 4) / 7) * 100);

    const debutYear = char.comicDebut?.releaseYear || '1962';

    return `
      <article class="character-card" data-id="${char.id}">
        <div class="card-media">
          <img 
            class="card-img" 
            src="${char.thumbnail}" 
            alt="${char.alias}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=600&q=80';"
          />
          <div class="card-gradient"></div>
          <div class="card-badge-debut">Debut: ${debutYear}</div>
          <div class="card-categories">
            <span class="badge ${badgeClass}">${primaryCat}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-identity">
            <h3 class="card-alias">${char.alias}</h3>
            <span class="card-realname">${char.name}</span>
          </div>

          <p class="card-tagline">"${char.tagline || char.quote}"</p>

          <div class="card-powers-preview">
            <div class="power-bars-mini">
              <div class="mini-stat">
                <div class="mini-stat-label">
                  <span>STR</span>
                  <span>${char.powerGrid?.strength?.rating || 3}/7</span>
                </div>
                <div class="mini-stat-bar">
                  <div class="mini-stat-fill" style="width: ${strengthPct}%;"></div>
                </div>
              </div>

              <div class="mini-stat">
                <div class="mini-stat-label">
                  <span>SPD</span>
                  <span>${char.powerGrid?.speed?.rating || 3}/7</span>
                </div>
                <div class="mini-stat-bar">
                  <div class="mini-stat-fill" style="width: ${speedPct}%;"></div>
                </div>
              </div>

              <div class="mini-stat">
                <div class="mini-stat-label">
                  <span>CMB</span>
                  <span>${char.powerGrid?.fightingSkills?.rating || 4}/7</span>
                </div>
                <div class="mini-stat-bar">
                  <div class="mini-stat-fill" style="width: ${combatPct}%;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <button class="card-action-btn" type="button">
              <span>View Dossier & 3D Core</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }
}

window.CharacterRoster = CharacterRoster;
