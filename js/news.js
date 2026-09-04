/**
 * Marvel Newsfeed Controller
 * Fetches and renders the latest Marvel comic releases, MCU updates, and storyline breakdowns.
 */

class MarvelNewsfeed {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('news-grid');
    this.filterContainer = options.filterContainer || document.getElementById('news-filters');
    this.newsItems = [];
    this.activeFilter = 'All';

    this.init();
  }

  async init() {
    await this.fetchNews();
    this.setupFilters();
    this.render();
  }

  async fetchNews() {
    try {
      const res = await fetch('data/news.json');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      this.newsItems = data.news || [];
    } catch (err) {
      console.error('Failed to load news.json:', err);
      if (this.container) {
        this.container.innerHTML = `
          <div class="empty-state">
            <p>Unable to load Marvel Newsfeed. Check data/news.json.</p>
          </div>
        `;
      }
    }
  }

  setupFilters() {
    if (!this.filterContainer) return;
    const categories = ['All', 'Comic Releases', 'Cinematic', 'Storyline Lore'];

    this.filterContainer.innerHTML = categories.map(cat => `
      <button class="news-filter-btn ${cat === this.activeFilter ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    this.filterContainer.querySelectorAll('.news-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.dataset.cat;
        this.filterContainer.querySelectorAll('.news-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render();
      });
    });
  }

  render() {
    if (!this.container) return;

    const filtered = this.newsItems.filter(item => {
      if (this.activeFilter === 'All') return true;
      return item.category === this.activeFilter;
    });

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <p>No news items found in this category.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = filtered.map(item => `
      <article class="news-card">
        <div class="news-media">
          <img 
            class="news-img" 
            src="${item.image}" 
            alt="${item.title}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=600&q=80';"
          />
          <span class="news-tag">${item.tag || item.category}</span>
        </div>

        <div class="news-body">
          <div class="news-meta">
            <span>${item.date}</span>
            <span class="news-meta-dot"></span>
            <span>${item.readTime}</span>
          </div>

          <h3 class="news-title">${item.title}</h3>
          <p class="news-summary">${item.summary}</p>

          <a href="#news" class="news-link">
            <span>${item.linkText || 'Read Full Report'}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </article>
    `).join('');
  }
}

window.MarvelNewsfeed = MarvelNewsfeed;
