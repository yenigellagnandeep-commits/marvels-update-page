/**
 * Marvel Universe Archive - Core Application Bootstrap
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Character Profile Modal
  const modal = new window.CharacterModal();

  // 2. Initialize Character Roster Hub
  const roster = new window.CharacterRoster({
    container: document.getElementById('character-grid'),
    filterContainer: document.getElementById('filter-pills'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear'),
    statsSummary: document.getElementById('roster-stats-summary'),
    onSelectCharacter: (character) => {
      modal.open(character);
    }
  });

  // 3. Initialize Marvel Newsfeed
  const news = new window.MarvelNewsfeed({
    container: document.getElementById('news-grid'),
    filterContainer: document.getElementById('news-filters')
  });

  // 4. Navbar Sticky Glass Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 5. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close mobile menu when clicking nav link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.innerHTML = '☰';
      });
    });
  }

  // 6. Hero Spotlight Card Click Handler (Spider-Man as featured hero)
  const spotlightCard = document.getElementById('hero-spotlight-card');
  if (spotlightCard) {
    spotlightCard.addEventListener('click', () => {
      // Find spider-man in roster
      const spiderMan = roster.characters.find(c => c.id === 'spider-man');
      if (spiderMan) {
        modal.open(spiderMan);
      } else if (roster.characters.length > 0) {
        modal.open(roster.characters[0]);
      }
    });
  }

  // 7. Hero Primary CTA: Scroll to Roster
  const exploreRosterBtn = document.getElementById('hero-explore-btn');
  if (exploreRosterBtn) {
    exploreRosterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const rosterSection = document.getElementById('roster');
      if (rosterSection) {
        rosterSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
