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

  const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
  function setDropdown(item, open) {
    item.classList.toggle('is-open', open);
    item.querySelector('.dropdown-toggle').setAttribute('aria-expanded', String(open));
  }
  dropdownItems.forEach((item) => {
    item.querySelector('.dropdown-toggle').addEventListener('click', (event) => {
      event.stopPropagation();
      const open = !item.classList.contains('is-open');
      dropdownItems.forEach((other) => { if (other !== item) setDropdown(other, false); });
      setDropdown(item, open);
    });
  });
  document.addEventListener('click', (event) => {
    dropdownItems.forEach((item) => { if (!item.contains(event.target)) setDropdown(item, false); });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    dropdownItems.forEach((item) => {
      if (item.classList.contains('is-open') || item.contains(document.activeElement)) {
        setDropdown(item, false);
        if (item.contains(document.activeElement)) item.querySelector('.dropdown-toggle').focus();
      }
    });
  });

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

  const pubFilters = document.querySelector('[data-pub-filters]');
  const pubList = document.querySelector('[data-pub-list]');
  if (pubFilters && pubList) {
    const state = { year: 'all', topic: 'all', query: '' };
    const search = pubFilters.querySelector('.pub-search');
    const count = pubFilters.querySelector('[data-pub-count]');
    const empty = pubList.querySelector('[data-pub-empty]');

    function applyPubFilters() {
      let visible = 0;
      pubList.querySelectorAll('[data-pub-year]').forEach((group) => {
        let groupVisible = 0;
        group.querySelectorAll('.pub-item').forEach((item) => {
          const show = (state.year === 'all' || item.dataset.year === state.year)
            && (state.topic === 'all' || item.dataset.topics.split(' ').includes(state.topic))
            && (!state.query || item.textContent.toLowerCase().includes(state.query));
          item.hidden = !show;
          if (show) groupVisible += 1;
        });
        group.hidden = groupVisible === 0;
        visible += groupVisible;
      });
      count.textContent = `${visible} publication${visible === 1 ? '' : 's'}`;
      empty.hidden = visible > 0;
    }

    pubFilters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-year], [data-topic]');
      if (!button) return;
      const key = button.dataset.year !== undefined ? 'year' : 'topic';
      state[key] = button.dataset[key];
      button.parentElement.querySelectorAll('.filter-button').forEach((btn) => {
        btn.classList.toggle('active', btn === button);
        btn.setAttribute('aria-pressed', String(btn === button));
      });
      applyPubFilters();
    });
    search.addEventListener('input', () => {
      state.query = search.value.trim().toLowerCase();
      applyPubFilters();
    });
  }

  const galleries = document.querySelectorAll('[data-gallery]');
  if (galleries.length && typeof HTMLDialogElement === 'function') {
    const icon = (d) => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = `
      <div class="lightbox-bar">
        <p class="lightbox-title"></p>
        <span class="lightbox-count" aria-live="polite"></span>
        <button class="lightbox-btn lightbox-close" type="button" aria-label="Close">${icon('M6 6l12 12M18 6 6 18')}</button>
      </div>
      <div class="lightbox-stage">
        <img class="lightbox-img" alt="">
        <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous photo">${icon('M15 5l-7 7 7 7')}</button>
        <button class="lightbox-btn lightbox-next" type="button" aria-label="Next photo">${icon('M9 5l7 7-7 7')}</button>
      </div>
      <div class="lightbox-strip"></div>`;
    document.body.appendChild(box);
    const img = box.querySelector('.lightbox-img');
    const title = box.querySelector('.lightbox-title');
    const counter = box.querySelector('.lightbox-count');
    const strip = box.querySelector('.lightbox-strip');
    let items = [];
    let index = 0;

    function show(i) {
      index = (i + items.length) % items.length;
      const item = items[index];
      img.src = item.href;
      img.alt = item.alt;
      counter.textContent = `${index + 1} / ${items.length}`;
      strip.querySelectorAll('.lightbox-thumb').forEach((thumb, k) => {
        thumb.setAttribute('aria-current', String(k === index));
        if (k === index) thumb.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
      [index + 1, index - 1].forEach((k) => { new Image().src = items[(k + items.length) % items.length].href; });
    }

    function open(gallery, start) {
      items = [...gallery.querySelectorAll('[data-gallery-item]')].map((a) => ({ href: a.href, thumb: a.dataset.thumb, alt: a.textContent }));
      title.textContent = gallery.querySelector('h3').textContent;
      strip.innerHTML = items.map((item, k) => `<button class="lightbox-thumb" type="button" data-index="${k}" aria-label="Photo ${k + 1}"><img src="${item.thumb}" alt=""></button>`).join('');
      box.querySelectorAll('.lightbox-prev, .lightbox-next').forEach((btn) => { btn.hidden = items.length < 2; });
      box.showModal();
      document.body.classList.add('lightbox-open');
      show(start);
    }

    galleries.forEach((gallery) => {
      gallery.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-open]');
        if (!trigger) return;
        event.preventDefault();
        open(gallery, Number(trigger.dataset.open));
      });
    });
    box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
    strip.addEventListener('click', (event) => {
      const thumb = event.target.closest('[data-index]');
      if (thumb) show(Number(thumb.dataset.index));
    });
    box.addEventListener('close', () => {
      document.body.classList.remove('lightbox-open');
      img.removeAttribute('src');
    });
    box.addEventListener('click', (event) => {
      if (event.target === box || event.target.classList.contains('lightbox-stage')) box.close();
    });
    box.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') show(index + 1);
      if (event.key === 'ArrowLeft') show(index - 1);
    });
    let touchX = null;
    box.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (event) => {
      if (touchX === null) return;
      const dx = event.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  const formSuccess = document.querySelector('[data-form-success]');
  if (formSuccess && new URLSearchParams(window.location.search).has('sent')) {
    formSuccess.hidden = false;
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
