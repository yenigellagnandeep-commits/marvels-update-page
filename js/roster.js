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
    this.visibleLimit = 48;

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
      this.characters = this.normalizeCharacterData(data);
      if (this.characters.length === 0) {
        throw new Error('characters.json did not contain any character records');
      }
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

  normalizeCharacterData(data) {
    if (Array.isArray(data)) {
      return data.map((record, index) => this.normalizeCatalogCharacter(record, index));
    }
    if (Array.isArray(data?.characters)) {
      return data.characters;
    }
    throw new Error('Unsupported characters.json format');
  }

  normalizeCatalogCharacter(record, index) {
    const valueOrEmpty = (value) =>
      typeof value === 'string' && value.trim() && value.trim() !== '-' ? value.trim() : '';
    const biography = record?.biography || {};
    const powerstats = record?.powerstats || {};
    const images = record?.images || {};
    const name = valueOrEmpty(record?.name) || `Unknown Character ${index + 1}`;
    const groups = valueOrEmpty(record?.connections?.['group-affiliation']);
    const alignment = valueOrEmpty(biography.alignment).toLowerCase();
    const searchableGroups = groups.toLowerCase();
    const categories = ['All Comics'];
    ['Avengers', 'X-Men', 'Cosmic', 'Villains', 'Street Level'].forEach((category) => {
      if (searchableGroups.includes(category.toLowerCase()) ||
          (category === 'Villains' && alignment === 'bad')) {
        categories.push(category);
      }
    });

    const toRating = (value) => {
      const number = Number(value);
      if (value === null || value === undefined || value === '' ||
          !Number.isFinite(number) || number < 0) return 0;
      return Math.max(1, Math.min(7, Math.round(number * 6 / 100) + 1));
    };
    const stat = (key) => {
      const value = powerstats[key];
      const rating = toRating(value);
      return {
        rating,
        label: rating ? `${value}/100` : 'Not listed'
      };
    };
    const fallbackImage = 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=600&q=80';
    const thumbnail = valueOrEmpty(images.sm) || fallbackImage;
    const highResImage = valueOrEmpty(images.lg) || valueOrEmpty(images.md) ||
      valueOrEmpty(images.sm) || fallbackImage;
    const powers = Object.entries(powerstats)
      .filter(([, value]) => toRating(value) > 0)
      .map(([key, value]) => `${key.replace(/[-_]/g, ' ')} (${value}/100)`);

    return {
      id: `catalog-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      alias: name,
      name: valueOrEmpty(biography['full-name']) || valueOrEmpty(biography['alter-egos']) || 'Identity not listed',
      categories,
      primaryCategory: categories.find((category) => category !== 'All Comics') || 'All Comics',
      tagline: valueOrEmpty(biography.publisher) || 'Marvel archive entry',
      quote: '',
      comicDebut: {
        comicTitle: valueOrEmpty(biography['first-appearance']) || 'Not listed',
        issue: '',
        releaseYear: '',
        creators: '',
        coverDate: ''
      },
      thumbnail,
      highResImage,
      modelConfig: {
        themeColor: '#e23636',
        accentColor: '#1b4d89',
        wireframeColor: '#00f0ff',
        particleCount: 180,
        symbol: 'CORE',
        glbModelUrl: ''
      },
      biography: 'This catalog record does not include a biography. Add character details to the source data to complete this dossier.',
      powers,
      powerGrid: {
        durability: stat('durability'),
        energyProjection: stat('power'),
        fightingSkills: stat('combat'),
        intelligence: stat('intelligence'),
        speed: stat('speed'),
        strength: stat('strength')
      },
      keyStorylines: []
    };
  }

  setupEvents() {
    // Search Input with Debounce/Instant response
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.visibleLimit = 48;
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
        this.visibleLimit = 48;
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
    const available = new Set(this.characters.flatMap((character) => [
      character.primaryCategory,
      ...(Array.isArray(character.categories) ? character.categories : [])
    ]));
    const defaults = defaultCategories.filter((category) =>
      category === 'All Comics' || available.has(category)
    );
    const additional = [...available]
      .filter((category) => category && !defaultCategories.includes(category))
      .sort();
    return [...defaults, ...additional];
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
      const contains = (value) => typeof value === 'string' && value.toLowerCase().includes(q);
      const debut = char.comicDebut || {};
      const aliasMatch = contains(char.alias);
      const nameMatch = contains(char.name);
      const categoryMatch = Array.isArray(char.categories) && char.categories.some(contains);
      const powerMatch = Array.isArray(char.powers) && char.powers.some(contains);
      const debutMatch = [debut.comicTitle, debut.creators, debut.issue].some(contains);

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
      const safeCategory = escapeHtml(cat);
      return `
        <button class="filter-btn ${isActive}" data-category="${safeCategory}">
          <span>${safeCategory}</span>
          <span class="filter-count">${count}</span>
        </button>
      `;
    }).join('');

    // Attach click events
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.category;
        this.visibleLimit = 48;
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
      const shownCount = Math.min(this.visibleLimit, filtered.length);
      this.statsSummary.innerHTML = `Showing <strong>${shownCount}</strong> of <strong>${filtered.length}</strong> matching characters (${this.characters.length} total)`;
    }

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No Matching Dossiers Found</h3>
          <p class="empty-desc">No superhero or villain matches "<strong>${escapeHtml(this.searchQuery)}</strong>" in the category "${escapeHtml(this.activeCategory)}".</p>
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
          this.visibleLimit = 48;
          if (this.searchInput) this.searchInput.value = '';
          if (this.searchClearBtn) this.searchClearBtn.classList.remove('visible');
          this.renderFilters();
          this.renderGrid();
        });
      }
      return;
    }

    const visibleCharacters = filtered.slice(0, this.visibleLimit);
    this.container.innerHTML = visibleCharacters.map(char => this.createCardHTML(char)).join('');
    if (visibleCharacters.length < filtered.length) {
      this.container.insertAdjacentHTML('beforeend', `
        <button class="btn-secondary" id="load-more-characters" type="button"
          style="grid-column: 1 / -1; justify-self: center; margin-top: 1rem;">
          Load more characters
        </button>
      `);
      document.getElementById('load-more-characters').addEventListener('click', () => {
        this.visibleLimit += 48;
        this.renderGrid();
      });
    }

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
    const safeCategory = escapeHtml(primaryCat);
    const safeId = escapeHtml(char.id);
    const safeThumbnail = escapeHtml(char.thumbnail || 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=600&q=80');
    const safeAlias = escapeHtml(char.alias || 'Unknown Character');
    const safeName = escapeHtml(char.name || 'Identity not listed');
    const safeTagline = escapeHtml(char.tagline || char.quote || 'Marvel archive entry');
    let badgeClass = 'badge-avengers';
    if (primaryCat === 'X-Men') badgeClass = 'badge-xmen';
    else if (primaryCat === 'Cosmic') badgeClass = 'badge-cosmic';
    else if (primaryCat === 'Villains') badgeClass = 'badge-villains';

    // Power grid preview ratings (out of 7)
    const getRating = (key) => {
      const rating = Number(char.powerGrid?.[key]?.rating);
      return Number.isFinite(rating) && rating > 0 ? Math.min(7, rating) : 0;
    };
    const strengthRating = getRating('strength');
    const speedRating = getRating('speed');
    const combatRating = getRating('fightingSkills');
    const strengthPct = Math.round((strengthRating / 7) * 100);
    const speedPct = Math.round((speedRating / 7) * 100);
    const combatPct = Math.round((combatRating / 7) * 100);
    const formatRating = (rating) => rating ? `${rating}/7` : 'N/A';

    const debutYear = escapeHtml(char.comicDebut?.releaseYear || 'Not listed');

    return `
      <article class="character-card" data-id="${safeId}">
        <div class="card-media">
          <img 
            class="card-img" 
            src="${safeThumbnail}" 
            alt="${safeAlias}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=600&q=80';"
          />
          <div class="card-gradient"></div>
          <div class="card-badge-debut">Debut: ${debutYear}</div>
          <div class="card-categories">
            <span class="badge ${badgeClass}">${safeCategory}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-identity">
            <h3 class="card-alias">${safeAlias}</h3>
            <span class="card-realname">${safeName}</span>
          </div>

          <p class="card-tagline">"${safeTagline}"</p>

          <div class="card-powers-preview">
            <div class="power-bars-mini">
              <div class="mini-stat">
                <div class="mini-stat-label">
                  <span>STR</span>
                  <span>${formatRating(strengthRating)}</span>
                </div>
                <div class="mini-stat-bar">
                  <div class="mini-stat-fill" style="width: ${strengthPct}%;"></div>
                </div>
              </div>

              <div class="mini-stat">
                <div class="mini-stat-label">
                  <span>SPD</span>
                  <span>${formatRating(speedRating)}</span>
                </div>
                <div class="mini-stat-bar">
                  <div class="mini-stat-fill" style="width: ${speedPct}%;"></div>
                </div>
              </div>

              <div class="mini-stat">
                <div class="mini-stat-label">
                  <span>CMB</span>
                  <span>${formatRating(combatRating)}</span>
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
