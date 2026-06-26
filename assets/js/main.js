(function () {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.matches('a')) {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      const fallback = img.getAttribute('data-fallback');
      if (fallback && !img.src.endsWith(fallback)) {
        img.src = fallback;
      }
    }, { once: true });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-filter-scope]').forEach((controls) => {
    const scope = controls.getAttribute('data-filter-scope');
    const list = document.querySelector(`[data-filter-list="${scope}"]`);
    if (!list) return;
    controls.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      const filter = button.getAttribute('data-filter');
      controls.querySelectorAll('[data-filter]').forEach((btn) => btn.classList.toggle('active', btn === button));
      list.querySelectorAll('[data-filter-item]').forEach((item) => {
        const type = item.getAttribute('data-type');
        item.classList.toggle('is-hidden', filter !== 'all' && type !== filter);
      });
    });
  });
})();
