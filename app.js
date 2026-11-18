(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'メニューを開く');
    nav.classList.remove('is-open');
  };
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    menu.setAttribute('aria-label', expanded ? 'メニューを開く' : 'メニューを閉じる');
    nav.classList.toggle('is-open', !expanded);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  const desktop = window.matchMedia('(min-width: 601px)');
  desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });

  const content = window.LAB_CONTENT || {};
  const validUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) ? url : null;
    } catch { return null; }
  };
  for (const name of ['tiktok', 'youtube']) {
    const url = validUrl(content.social?.[name]);
    if (!url) continue;
    const card = document.getElementById(`${name}-card`);
    const link = document.createElement('a');
    link.id = card.id;
    link.className = card.className;
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${name === 'tiktok' ? 'TikTok' : 'YouTube'}を見る（新しいタブ）`);
    while (card.firstChild) link.append(card.firstChild);
    link.querySelector('.social-status').textContent = 'チャンネルを見る';
    link.querySelector('.social-action').textContent = '↗';
    card.replaceWith(link);
  }
  const documents = (Array.isArray(content.documents) ? content.documents : [])
    .filter(doc => doc && typeof doc.title === 'string' && validUrl(doc.url));
  if (documents.length) {
    const container = document.getElementById('document-list');
    container.querySelector('.archive-empty').remove();
    const note = container.querySelector('.archive-note');
    documents.forEach((doc, index) => {
      const link = document.createElement('a');
      link.className = 'document-row';
      link.href = validUrl(doc.url).href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${doc.title} PDFを開く（新しいタブ）`);
      const number = document.createElement('span');
      number.className = 'document-number';
      number.textContent = String(doc.gameNumber || index + 1).padStart(2, '0');
      const detail = document.createElement('div');
      detail.className = 'document-detail';
      const title = document.createElement('h3');
      title.textContent = doc.title;
      const desc = document.createElement('p');
      desc.textContent = doc.description || '';
      const meta = document.createElement('span');
      meta.className = 'document-meta';
      meta.textContent = ['PDF', doc.pages ? `${doc.pages}ページ` : '', doc.size || ''].filter(Boolean).join(' / ');
      const arrow = document.createElement('span');
      arrow.className = 'document-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      detail.append(title, desc, meta);
      link.append(number, detail, arrow);
      container.insertBefore(link, note);
    });
  }
})();
