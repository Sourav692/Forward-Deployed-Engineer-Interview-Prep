/** Mount the approved casebook reader within a Next.js route; clean up on navigation. */
export function mountCasebookReader(root, config, onReadChange, initialRead = []) {
  const controller = new AbortController();
  const on = (target, event, handler) => target.addEventListener(event, handler, { signal: controller.signal });
  const get = id => root.querySelector('#' + CSS.escape(id));
  const key = `forward-deployed:casebook:${config.slug}:v1`;
  const panelIds = ['case-brief', 'walkthrough', 'deep-dives', 'practice', 'quick-review'];
  const readIds = ['walkthrough', 'deep-dives', 'quick-review'];
  const fields = [...root.querySelectorAll('textarea[data-note]')].map(input => input.dataset.note);
  const rubricIds = [...root.querySelectorAll('input[name="rubric"]')].map(input => input.value);
  const emptyState = () => ({ read: [...initialRead], attempted: false, notes: {}, rubric: [] });
  let state = emptyState();
  let storageAvailable = true;
  let saveTimer;

  const storageNotice = get('storage-status');
  const noteStatus = get('notes-status');
  function storageError() {
    storageAvailable = false;
    storageNotice.textContent = 'Browser storage is unavailable. Changes last only for this visit. Export notes to keep them.';
    storageNotice.classList.add('is-error');
    get('save-help').textContent = 'Notes stay in memory for this visit. Export them to keep a copy.';
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    if (parsed && typeof parsed === 'object') {
      state.read = Array.isArray(parsed.read) ? parsed.read.filter(id => readIds.includes(id)) : [];
      state.attempted = parsed.attempted === true;
      state.notes = Object.fromEntries(fields.map(field => [field, typeof parsed.notes?.[field] === 'string' ? parsed.notes[field] : '']));
      state.rubric = Array.isArray(parsed.rubric) ? parsed.rubric.filter(id => rubricIds.includes(id)) : [];
    }
    localStorage.setItem(key, JSON.stringify(state));
  } catch { storageError(); }

  function persist() {
    if (storageAvailable) {
      try { localStorage.setItem(key, JSON.stringify(state)); }
      catch { storageError(); }
    }
    return storageAvailable;
  }
  function updateProgress() {
    onReadChange([...state.read]);
    get('read-progress').textContent = `${state.read.length} of 3 reading sections`;
    const progress = get('reading-progress');
    progress.value = state.read.length;
    progress.textContent = `${state.read.length} of 3`;
    root.querySelectorAll('[data-read-state]').forEach(el => {
      const read = state.read.includes(el.dataset.readState);
      el.textContent = read ? 'Read' : 'Unread';
      el.classList.toggle('is-read', read);
    });
    root.querySelectorAll('[data-mark-read]').forEach(button => {
      const read = state.read.includes(button.dataset.markRead);
      button.setAttribute('aria-pressed', String(read));
      const title = { walkthrough: 'walkthrough', 'deep-dives': 'deep dives', 'quick-review': 'quick review' }[button.dataset.markRead];
      button.textContent = read ? `Read (mark ${title} unread)` : `Mark ${title} as read`;
    });
    const practice = get('practice-state');
    practice.textContent = state.attempted ? 'Attempted' : 'Not attempted';
    practice.classList.toggle('is-read', state.attempted);
    get('mark-attempted').textContent = state.attempted ? 'Practice attempted (undo)' : 'Mark practice as attempted';
    get('mark-attempted').setAttribute('aria-pressed', String(state.attempted));
  }
  function updateRubric() {
    get('rubric-status').textContent = `${state.rubric.length} of ${rubricIds.length} reasoning checks covered.`;
  }
  const legacy = { intro: 'case-brief', main: 'walkthrough', 'main-part-2': 'walkthrough', 'deep-dive': 'deep-dives', 'cheat-sheet': 'quick-review', 'full-pack': 'walkthrough', 'full-pack-part-2': 'deep-dives', 'full-pack-part-3': 'walkthrough', 'full-pack-part-4': 'practice', 'full-pack-part-5': 'practice', ...config.aliases };
  const sectionJump = document.createElement('select');
  sectionJump.className = 'section-jump';
  sectionJump.setAttribute('aria-label', 'Jump within this section');
  get('section-contents').after(sectionJump);
  on(sectionJump, 'change', () => { location.hash = sectionJump.value; });
  root.classList.add('js-enhanced');
  let previousPanel;
  function navigate() {
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch { hash = ''; }
    const id = legacy[hash] || hash || 'case-brief';
    let target = get(id);
    const panel = target?.closest('.panel') || get('case-brief');
    const changed = previousPanel !== panel.id;
    root.querySelectorAll('.panel').forEach(el => { el.hidden = el !== panel; });
    root.querySelectorAll('[data-panel-link]').forEach(link => {
      if (link.dataset.panelLink === panel.id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const contents = get('section-contents');
    contents.replaceChildren();
    sectionJump.replaceChildren(new Option('Choose a topic…', ''));
    sectionJump.options[0].disabled = true;
    panel.querySelectorAll(':scope > .reading-section, :scope > details.deep-topic').forEach(section => {
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.textContent = section.querySelector('h3, summary > span')?.textContent.replace(/^\d+\.\s*/, '') || section.id;
      if (section.id === id) link.setAttribute('aria-current', 'location');
      contents.appendChild(link);
      sectionJump.appendChild(new Option(link.textContent, section.id));
    });
    sectionJump.value = [...sectionJump.options].some(option => option.value === id) ? id : '';
    let ancestor = target;
    while (ancestor && ancestor !== panel) {
      if (ancestor.tagName === 'DETAILS') ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
    document.title = `${panel.dataset.title} | ${config.title}`;
    previousPanel = panel.id;
    if (hash && changed && panelIds.includes(id)) {
      const heading = panel.querySelector('h2');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      if (hash) root.querySelector('.section-nav').scrollIntoView({ block: 'start' });
    } else if (target && !panelIds.includes(id)) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start' });
        const focusTarget = target.querySelector('h3, h4, summary') || target;
        focusTarget.setAttribute('tabindex', '-1');
        focusTarget.focus({ preventScroll: true });
      });
    }
  }
  on(window, 'hashchange', navigate);
  root.querySelectorAll('.panel').forEach(panel => {
    const details = [...panel.querySelectorAll('.source-chapter:is(details), :scope > details.deep-topic')];
    if (!details.length) return;
    const tools = document.createElement('div');
    tools.className = 'content-tools';
    const button = document.createElement('button');
    button.className = 'btn secondary';
    button.type = 'button';
    const label = panel.id === 'deep-dives' ? 'topics' : 'worked details';
    const sync = () => {
      const expanded = details.every(item => item.open);
      button.textContent = `${expanded ? 'Collapse' : 'Expand'} all ${label}`;
      button.setAttribute('aria-expanded', String(expanded));
    };
    on(button, 'click', () => {
      const open = !details.every(item => item.open);
      details.forEach(item => { item.open = open; });
      sync();
    });
    details.forEach(item => on(item, 'toggle', sync));
    tools.append(button);
    panel.querySelector('.section-heading').after(tools);
    sync();
  });
  root.querySelectorAll('[data-mark-read]').forEach(button => on(button, 'click', () => {
    const id = button.dataset.markRead;
    state.read = state.read.includes(id) ? state.read.filter(value => value !== id) : [...state.read, id];
    persist(); updateProgress();
  }));

  fields.forEach(field => {
    const input = get(`answer-${field}`);
    input.value = state.notes[field] || '';
    on(input, 'input', () => {
      state.notes[field] = input.value;
      noteStatus.classList.remove('is-error');
      noteStatus.textContent = storageAvailable ? 'Saving notes…' : 'Notes kept for this visit. Export to keep a copy.';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const saved = persist();
        noteStatus.textContent = saved ? 'Notes saved on this device.' : 'Notes kept for this visit. Export to keep a copy.';
      }, 300);
    });
  });
  root.querySelectorAll('input[name="rubric"]').forEach(input => {
    input.checked = state.rubric.includes(input.value);
    on(input, 'change', () => {
      state.rubric = [...root.querySelectorAll('input[name="rubric"]:checked')].map(el => el.value);
      persist(); updateRubric();
    });
  });
  on(get('practice-form'), 'submit', event => {
    event.preventDefault();
    if (!state.attempted && !fields.some(field => (state.notes[field] || '').trim())) {
      noteStatus.textContent = 'Write some notes before marking your practice as attempted.';
      noteStatus.classList.add('is-error');
      get(`answer-${fields[0]}`).focus();
      return;
    }
    state.attempted = !state.attempted;
    const saved = persist(); updateProgress();
    noteStatus.classList.remove('is-error');
    noteStatus.textContent = state.attempted
      ? `Practice marked as attempted${saved ? ' on this device' : ' for this visit'}. Use the rubric to assess your reasoning.`
      : `Practice status reset. Your notes ${saved ? 'are still saved' : 'remain available for this visit'}.`;
  });
  on(get('export-notes'), 'click', () => {
    const titles = Object.fromEntries(fields.map(field => [field, get(`answer-${field}`).dataset.noteLabel]));
    const markdown = [`# ${config.title}: practice notes`, '', ...fields.flatMap(field => [`## ${titles[field]}`, '', state.notes[field] || '(No notes yet.)', '']), '## Self-assessment', '', ...rubricIds.map(id => `- [${state.rubric.includes(id) ? 'x' : ' '}] ${root.querySelector(`input[value="${id}"]`).parentElement.textContent.trim()}`), '', `Source: ${config.source_url}`].join('\n');
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `${config.slug}-notes.md`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    noteStatus.classList.remove('is-error');
    noteStatus.textContent = 'Notes prepared as a Markdown download.';
  });
  on(get('print-review'), 'click', () => window.print());
  on(window, 'pagehide', persist);
  if (fields.some(field => state.notes[field])) noteStatus.textContent = 'Saved notes restored on this device.';
  updateProgress(); updateRubric(); navigate();
  return () => {
    controller.abort();
    clearTimeout(saveTimer);
    sectionJump.remove();
    root.querySelectorAll('.content-tools').forEach(element => element.remove());
    root.classList.remove('js-enhanced');
  };
}
