/* =========================================================
   Portfolio renderer — builds the page from data.json
   ========================================================= */

const PRESENT = /present|current|now|ongoing/i;

/* ---------- tiny DOM helper ---------- */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

/* ---------- icons ---------- */
const icon = {
  mail: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>`,
  phone: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>`,
  pin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  linkedin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11.75 19h-3.25v-10h3.25v10zm-1.625-11.267c-1.038 0-1.875-.847-1.875-1.875s.837-1.875 1.875-1.875 1.875.847 1.875 1.875-.837 1.875-1.875 1.875zm13.375 11.267h-3.25v-5.604c0-1.338-.026-3.063-1.868-3.063-1.869 0-2.156 1.46-2.156 2.97v5.697h-3.25v-10h3.125v1.367h.044c.435-.823 1.5-1.688 3.087-1.688 3.3 0 3.906 2.172 3.906 4.994v5.327z"/></svg>`,
  github: `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`,
  download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  send: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>`,
  screen: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  chevron: `<svg class="toggle-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  external: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
};

/* ---------- data ---------- */
async function loadData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error(`data.json responded ${res.status}`);
  return res.json();
}

/* Total months of experience, computed from work history.
   Overlapping jobs (e.g. freelance alongside a full-time role) are merged so
   shared months are counted once, then all periods are summed. */
function computeMonthsOfExperience(jobs) {
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];

  const toMonthIndex = str => {
    str = (str || '').trim();
    if (PRESENT.test(str)) {
      const now = new Date();
      return now.getFullYear() * 12 + now.getMonth();
    }
    const m = str.match(/([a-zA-Z]+)\s+(\d{4})/);
    if (!m) return null;
    const mi = MONTHS.indexOf(m[1].toLowerCase());
    if (mi < 0) return null;
    return parseInt(m[2], 10) * 12 + mi;
  };

  const intervals = [];
  (jobs || []).forEach(job => {
    const parts = (job.employmentDate || '').split(/\s*[-–—]\s*/);
    if (parts.length < 2) return;
    const start = toMonthIndex(parts[0]);
    const end = toMonthIndex(parts[1]);
    if (start == null || end == null || end < start) return;
    intervals.push([start, end]);
  });
  if (!intervals.length) return 0;

  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0].slice()];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const [s, e] = intervals[i];
    if (s <= last[1] + 1) last[1] = Math.max(last[1], e); // overlapping or contiguous
    else merged.push([s, e]);
  }

  return merged.reduce((sum, [s, e]) => sum + (e - s), 0);
}

/* "8 years", "7 years and 6 months", "6 months", "1 year and 1 month" */
function formatExperience(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
  return parts.length ? parts.join(' and ') : '0 months';
}

/* ---------- profile / sidebar ---------- */
function renderAboutSection(data, experience) {
  const container = document.getElementById('about-section');
  container.innerHTML = '';
  const fill = str => (str || '').replace(/\{\{\s*experience\s*\}\}/g, experience);

  // Header: avatar + name + role
  const head = el('div', 'profile-head');
  const av = el('div', 'avatar');
  av.style.backgroundImage = `url("assets/${data.avatar || 'profile.png'}")`;
  av.setAttribute('role', 'img');
  av.setAttribute('aria-label', data.name);

  const identity = el('div', 'identity');
  identity.append(el('h1', null, data.name), el('div', 'role', fill(data.role)));
  head.append(av, identity);
  container.appendChild(head);

  // Location + current employer
  const meta = el('div', 'meta-row');
  const loc = el('div', 'location');
  loc.innerHTML = `<span class="screen-only">${icon.pin} </span><span class="print-only">Location: </span>${data.contact.location}`;
  meta.appendChild(loc);

  const current = (data.workExperience || []).find(j => PRESENT.test(j.employmentDate || ''));
  if (current) {
    const status = el('div', 'status screen-only');
    status.append(el('span', 'dot'), document.createTextNode(`Currently at ${current.company}`));
    meta.appendChild(status);
  }
  container.appendChild(meta);

  container.appendChild(el('p', 'about', fill(data.about)));

  // Calls to action
  const actions = el('div', 'actions');
  const resumeBtn = el('button', 'btn btn-primary');
  resumeBtn.type = 'button';
  resumeBtn.innerHTML = `${icon.download} Download Resume`;
  resumeBtn.addEventListener('click', () => window.print());

  const mailBtn = el('a', 'btn btn-ghost');
  mailBtn.href = `mailto:${data.contact.email}`;
  mailBtn.innerHTML = `${icon.send} Get in touch`;

  actions.append(resumeBtn, mailBtn);
  container.appendChild(actions);

  // Contacts
  const contactSec = el('section', 'section');
  contactSec.appendChild(el('h3', null, 'Contacts'));
  const cl = el('div', 'contact-list');
  const fields = [
    {
      cls: 'chip',
      ico: icon.mail,
      label: 'Email:',
      val: `<a class="link" href="mailto:${data.contact.email}">${data.contact.email}</a>`,
    },
    {
      cls: 'chip chip-linkedin',
      ico: icon.linkedin,
      label: 'LinkedIn:',
      val: `<a class="link" href="https://ph.${data.contact.linkedin}" target="_blank" rel="noopener noreferrer">${data.contact.linkedin}</a>`,
    },
    {
      cls: 'chip chip-github',
      ico: icon.github,
      label: 'GitHub:',
      val: `<a class="link" href="https://${data.contact.github}" target="_blank" rel="noopener noreferrer">${data.contact.github}</a>`,
    },
    ...(data.contact.phone
      ? [{ cls: 'chip chip-phone', ico: icon.phone, label: 'Phone:', val: data.contact.phone }]
      : []),
  ];

  fields.forEach(f => {
    const d = el('div', f.cls);
    d.innerHTML = `<span class="screen-only">${f.ico}</span><span class="print-only">${f.label}</span> ${f.val}`;
    cl.appendChild(d);
  });
  contactSec.appendChild(cl);
  container.appendChild(contactSec);

  // Tech stacks
  const tsec = el('section', 'section');
  tsec.innerHTML = '<h3><span class="screen-only">Tech Stacks</span><span class="print-only">Skills</span></h3>';
  (data.techStacks || []).forEach(g => {
    const group = el('div', 'skill-group');
    group.appendChild(el('div', 'skill-group-label', g.group));
    const wrap = el('div', 'skills');
    (g.items || []).forEach(it => wrap.appendChild(el('div', 'skill', it)));
    group.appendChild(wrap);
    tsec.appendChild(group);
  });
  container.appendChild(tsec);

  container.appendChild(
    el('footer', null, 'Keep learning, keep coding, and let curiosity drive your progress.')
  );
}

/* ---------- lightbox ---------- */
function setupModal() {
  const overlay = el('div', 'modal-overlay');
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-img-area">
        <div class="modal-img-wrap"><img class="modal-img" src="" alt="" /></div>
        <button class="modal-close" aria-label="Close">&#x2715;</button>
        <button class="modal-nav modal-prev" aria-label="Previous">&#8249;</button>
        <button class="modal-nav modal-next" aria-label="Next">&#8250;</button>
      </div>
      <div class="modal-footer">
        <div class="modal-dots"></div>
        <span class="modal-counter"></span>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  let images = [], current = 0, lastFocus = null;
  const img = overlay.querySelector('.modal-img');
  const imgWrap = overlay.querySelector('.modal-img-wrap');
  const counter = overlay.querySelector('.modal-counter');
  const dotsWrap = overlay.querySelector('.modal-dots');
  const prevBtn = overlay.querySelector('.modal-prev');
  const nextBtn = overlay.querySelector('.modal-next');
  const closeBtn = overlay.querySelector('.modal-close');

  function paint() {
    const src = `assets/${images[current]}`;
    img.src = src;
    img.alt = `Project screenshot ${current + 1} of ${images.length}`;
    imgWrap.style.setProperty('--modal-bg', `url("${src}")`);
    counter.textContent = images.length > 1 ? `${current + 1} / ${images.length}` : '';
    dotsWrap.querySelectorAll('.modal-dot')
      .forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(i) {
    current = (i + images.length) % images.length;
    img.style.opacity = '0';
    setTimeout(() => { paint(); img.style.opacity = '1'; }, 130);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  window.openImgModal = function (imgs, startIndex) {
    lastFocus = document.activeElement;
    images = imgs;
    current = startIndex;
    dotsWrap.innerHTML = '';
    if (images.length > 1) {
      images.forEach((_, i) => {
        const dot = el('span', 'modal-dot');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }
    prevBtn.hidden = nextBtn.hidden = images.length < 2;
    img.style.opacity = '1';
    paint();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
}

/* ---------- project card ---------- */
function buildProjectCard(p) {
  const images = p.images || (p.image ? [p.image] : []);
  const card = el('div', 'project');

  if (images.length) {
    // Collage tiles and the blurred backdrop use thumbnails; the modal loads full-res.
    const thumbOf = src => src.replace(/\.webp$/i, '.thumb.webp');
    const imgContainer = el('div', 'project-img-container');
    imgContainer.style.setProperty('--img-bg', `url("assets/${thumbOf(images[0])}")`);

    const visible = images.slice(0, 3);
    const extra = images.length - 3;
    const collage = el('div', `project-collage count-${visible.length}`);

    visible.forEach((imgSrc, i) => {
      const item = el('div', 'collage-item');
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `Open ${p.title} screenshot ${i + 1}`);
      item.addEventListener('click', () => window.openImgModal(images, i));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.openImgModal(images, i); }
      });

      const thumb = el('img', 'project-img');
      thumb.src = `assets/${thumbOf(imgSrc)}`;
      thumb.alt = `${p.title} screenshot ${i + 1}`;
      thumb.loading = 'lazy';
      thumb.decoding = 'async';
      item.appendChild(thumb);

      if (i === 2 && extra > 0) item.appendChild(el('div', 'collage-more', `+${extra}`));
      collage.appendChild(item);
    });

    imgContainer.append(collage, el('div', 'tooltip', `View image${images.length > 1 ? 's' : ''}`));
    card.appendChild(imgContainer);
  }

  card.append(el('h4', null, p.title), el('div', 'desc', p.desc));

  const badges = el('div', 'badges');
  (p.tech || []).forEach(t => badges.appendChild(el('div', 'badge', t)));
  card.appendChild(badges);

  if (p.public && p.link && p.link !== '#') {
    const linkBtn = el('a', 'project-link-btn');
    linkBtn.href = p.link;
    linkBtn.target = '_blank';
    linkBtn.rel = 'noopener noreferrer';
    linkBtn.innerHTML = `Visit Site ${icon.external}`;
    card.appendChild(linkBtn);
  }

  return card;
}

/* ---------- experience timeline ---------- */
function buildJobCard(job) {
  const isCurrent = PRESENT.test(job.employmentDate || '');
  const card = el('div', `job-card reveal${isCurrent ? ' is-current' : ''}`);

  const header = el('div', 'job-header');
  const titleRow = el('div', 'job-title-row');
  titleRow.append(
    el('h3', 'job-title', job.title),
    el('span', 'job-date', job.employmentDate)
  );

  const company = el('div', 'job-company');
  company.append(
    el('span', 'job-type', job.isFullTime ? 'Full-Time' : 'Part-Time'),
    document.createTextNode(job.company)
  );
  header.append(titleRow, company);

  const ul = el('ul', 'job-desc');
  (job.descriptions || []).forEach(d => ul.appendChild(el('li', null, d.item)));
  card.append(header, ul);

  const projects = job.projects || [];
  if (projects.length) {
    const toggleBtn = el('button', 'projects-toggle');
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = `
      <span class="projects-toggle-label">
        ${icon.screen}
        ${projects.length === 1 ? 'Project' : 'Projects'}
        <span class="projects-count">${projects.length}</span>
      </span>
      ${icon.chevron}`;

    const panel = el('div', 'projects-panel');
    const grid = el('div', 'projects-grid');
    projects.forEach(p => grid.appendChild(buildProjectCard(p)));
    panel.appendChild(grid);

    toggleBtn.addEventListener('click', () => {
      const open = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('open', !open);
    });

    card.append(toggleBtn, panel);
  }

  return card;
}

function renderWorkExperienceSection(data, experience) {
  const container = document.getElementById('work-experience-section');
  container.innerHTML = '';

  const jobs = data.workExperience || [];
  if (!jobs.length) return;

  const head = el('div', 'experience-head');
  head.appendChild(el('div', 'eyebrow', 'Career'));
  head.appendChild(el('h2', null, 'Work Experience'));
  head.appendChild(
    el('div', 'count', `${jobs.length} roles · ${experience} in total`)
  );

  const list = el('div', 'experience-list');
  jobs.forEach(job => list.appendChild(buildJobCard(job)));

  container.append(head, list);
}

/* ---------- scroll reveal ---------- */
/* Checked against whichever box actually clips the element — its scroll pane
   in shell mode, the viewport otherwise — so it works in both layouts. */
function setupReveal() {
  const nodes = Array.from(document.querySelectorAll('.reveal'));
  if (!nodes.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach(n => n.classList.add('in'));
    return;
  }

  nodes.forEach((n, i) => { n.style.transitionDelay = `${Math.min(i, 6) * 55}ms`; });

  const pending = new Set(nodes);
  const panes = Array.from(document.querySelectorAll('.pane-scroll'));

  const viewportOf = node => {
    const pane = node.closest('.pane-scroll');
    if (pane && /auto|scroll/.test(getComputedStyle(pane).overflowY)) {
      const r = pane.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    }
    return { top: 0, bottom: window.innerHeight };
  };

  let queued = false;
  const check = () => {
    queued = false;
    pending.forEach(node => {
      const r = node.getBoundingClientRect();
      const box = viewportOf(node);
      if (r.top < box.bottom - 40 && r.bottom > box.top) {
        node.classList.add('in');
        pending.delete(node);
      }
    });
    if (!pending.size) stop();
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(check);
  };

  function stop() {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    panes.forEach(p => p.removeEventListener('scroll', schedule));
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  panes.forEach(p => p.addEventListener('scroll', schedule, { passive: true }));

  check();
}

/* ---------- scroll panes ---------- */
/* Each pane reports its own overflow: edge fades show only where there is
   more content, and the cue button appears only when something is below. */
function setupPanes() {
  document.querySelectorAll('.pane-scroll').forEach(pane => {
    const cue = pane.parentElement.querySelector('.scroll-cue');

    const update = () => {
      const overflow = pane.scrollHeight - pane.clientHeight;
      const scrollable = overflow > 2;
      const atTop = pane.scrollTop <= 2;
      const atEnd = pane.scrollTop >= overflow - 2;

      pane.classList.toggle('fade-t', scrollable && !atTop);
      pane.classList.toggle('fade-b', scrollable && !atEnd);
      if (cue) cue.hidden = !scrollable || atEnd;
    };

    pane.addEventListener('scroll', update, { passive: true });
    // Lazy images and the projects accordion both change the content height.
    pane.addEventListener('transitionend', update);
    pane.addEventListener('load', update, true);
    window.addEventListener('resize', update);

    if ('ResizeObserver' in window) new ResizeObserver(update).observe(pane);

    if (cue) {
      cue.addEventListener('click', () => {
        pane.scrollBy({ top: pane.clientHeight * 0.82, behavior: 'smooth' });
      });
    }

    update();
  });
}

/* ---------- boot ---------- */
(async () => {
  setupModal();
  try {
    const data = await loadData();
    const experience = formatExperience(computeMonthsOfExperience(data.workExperience));
    renderAboutSection(data, experience);
    renderWorkExperienceSection(data, experience);
    setupReveal();
    setupPanes();
  } catch (e) {
    console.error('Could not load data.json — serve this folder over HTTP.', e);
    document.getElementById('about-section').innerHTML =
      '<h1>Portfolio unavailable</h1><p class="about">Could not load <code>data.json</code>. Serve this folder over HTTP (for example <code>python3 -m http.server 8000</code>) rather than opening the file directly.</p>';
  }
})();
