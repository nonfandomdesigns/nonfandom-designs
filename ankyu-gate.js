(() => {
  'use strict';
  const config = window.ANKYU_REVEAL;
  if (!config) return;
  const start = Date.parse(config.start), end = Date.parse(config.end);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const landing = document.querySelector('.landing');
  const feature = document.querySelector('[data-ankyu-gate]');
  const listing = document.querySelector('#tessumo-listing');
  let offset = 0, scheduleTimer, openingTimer, mediaTimer, active = false;
  let dialog, stage, video, result, skip, previousFocus, invitation, phase = 'closed';
  let lastClockSync = 0;
  const now = () => Date.now() + offset;
  const stateAt = time => time < start ? 'upcoming' : time < end ? 'active' : 'sealed';

  // Text is assigned as textContent, so future configuration stays plain text.
  function populate(container) {
    container.querySelectorAll('[data-reveal-text]').forEach(node => {
      node.textContent = config[node.dataset.revealText] || '';
    });
    container.querySelectorAll('[data-reveal-art]').forEach(img => {
      img.src = config.artwork;
      img.alt = `${config.name} — original character artwork`;
    });
  }

  function clearPlaybackTimers() {
    clearTimeout(openingTimer);
    clearTimeout(mediaTimer);
  }

  function showArtwork() {
    if (!dialog?.open) return;
    clearPlaybackTimers();
    phase = 'artwork';
    video.pause();
    stage.hidden = true;
    result.hidden = false;
    skip.hidden = true;
    dialog.querySelector('[data-ag-status]').textContent = `${config.name} revealed.`;
    result.querySelector('h2').focus({ preventScroll: true });
  }

  function closeGate() {
    clearPlaybackTimers();
    phase = 'closed';
    video?.pause();
    if (dialog?.open) dialog.close();
  }

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'ag-dialog';
    dialog.setAttribute('aria-label', "Ankyu’s Gate — character reveal");
    dialog.innerHTML = `
      <div class="ag-toolbar">
        <button class="ag-button" data-ag-skip type="button">Skip to character</button>
        <button class="ag-button" data-ag-close type="button" autofocus>Close ✕</button>
      </div>
      <p class="ag-sr" role="status" data-ag-status></p>
      <div class="ag-stage">
        <video class="ag-video" muted playsinline preload="auto" aria-label="Tessumo flips a golden coin in the darkness"></video>
        <div class="ag-portal" aria-hidden="true">
          <div class="ag-lintel"></div>
          <div class="ag-doors"><div class="ag-door ag-door-left"></div><div class="ag-door ag-door-right"></div></div>
          <div class="ag-seal">✿</div>
        </div>
        <div class="ag-atmosphere" aria-hidden="true"><div class="ag-fog"></div></div>
      </div>
      <article class="ag-result" hidden>
        <img data-reveal-art width="941" height="1672" decoding="async">
        <div>
          <span class="ag-eyebrow" data-reveal-text="title"></span>
          <h2 data-reveal-text="name" tabindex="-1"></h2>
          <p data-reveal-text="lore"></p>
          <h3>Where Treasures Gather</h3>
          <p data-reveal-text="gathering"></p>
          <p class="ag-tagline" data-reveal-text="tagline"></p>
          <a class="ag-button" href="./characters.html#ankyu-gate">Explore Characters &amp; World Lore</a>
        </div>
      </article>`;
    populate(dialog);
    document.body.append(dialog);
    stage = dialog.querySelector('.ag-stage');
    video = dialog.querySelector('video');
    video.setAttribute('aria-label', `${config.name} — character introduction`);
    result = dialog.querySelector('.ag-result');
    skip = dialog.querySelector('[data-ag-skip]');
    video.muted = true;
    if (!reducedMotion.matches) video.src = config.video;
    for (let i = 0; i < 14; i++) {
      const petal = document.createElement('i');
      petal.className = 'ag-petal';
      petal.style.cssText = `--x:${(i * 37) % 100}%;--speed:${7 + i % 5}s;--delay:-${i * 1.3}s`;
      dialog.querySelector('.ag-atmosphere').append(petal);
    }
    skip.addEventListener('click', showArtwork);
    dialog.querySelector('[data-ag-close]').addEventListener('click', closeGate);
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeGate(); });
    dialog.addEventListener('close', () => {
      clearPlaybackTimers();
      phase = 'closed';
      video.pause();
      if (previousFocus?.isConnected && !previousFocus.disabled && !previousFocus.hidden) previousFocus.focus();
    });
    video.addEventListener('ended', showArtwork);
    video.addEventListener('error', () => {
      if (phase === 'opening' || phase === 'video') showArtwork();
    });
    video.addEventListener('playing', () => {
      if (phase !== 'video') { video.pause(); return; }
      clearTimeout(mediaTimer);
      stage.classList.add('ag-playing');
    });
    const waitForMedia = () => {
      if (phase === 'video') {
        clearTimeout(mediaTimer);
        mediaTimer = setTimeout(showArtwork, 12000);
      }
    };
    video.addEventListener('waiting', waitForMedia);
    video.addEventListener('stalled', waitForMedia);
  }

  function openGate(event) {
    updateSchedule();
    if (!active) return;
    previousFocus = event.currentTarget;
    if (!dialog) createDialog();
    clearPlaybackTimers();
    phase = 'opening';
    result.hidden = true;
    stage.hidden = false;
    skip.hidden = false;
    stage.classList.remove('ag-playing', 'ag-opening');
    video.pause();
    if (!video.getAttribute('src') && !reducedMotion.matches) video.src = config.video;
    video.currentTime = 0;
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('[data-ag-status]').textContent = 'Ankyu opens the gate.';
    if (reducedMotion.matches) { showArtwork(); return; }
    // Keep the video preloaded under the black portal. Reveal it only once it
    // is actually playing; no white frame or separate loading screen.
    void stage.offsetWidth;
    stage.classList.add('ag-opening');
    openingTimer = setTimeout(() => {
      if (phase !== 'opening') return;
      phase = 'video';
      mediaTimer = setTimeout(showArtwork, 12000);
      video.play().catch(showArtwork);
    }, 1800);
  }

  function updateSchedule() {
    clearTimeout(scheduleTimer);
    const time = now();
    const state = stateAt(time);
    active = state === 'active';
    if (listing) listing.hidden = state !== 'sealed';
    if (invitation) invitation.hidden = !active;
    if (feature) {
      const button = feature.querySelector('[data-open-gate]');
      button.disabled = !active;
      button.textContent = active ? 'Open Ankyu’s Gate' : state === 'sealed' ? 'The gate is sealed' : 'The gate awaits';
      feature.querySelector('[data-gate-note]').textContent = active
        ? 'A passage open through November 26 · Eastern Time'
        : state === 'sealed' ? `${config.name} now walks among the Characters & World Lore below.` : 'A new presence stirs beyond the threshold.';
    }
    if (!active && dialog?.open) closeGate();
    // Bound the timer for long-lived tabs; evaluate the exact boundary when near.
    const boundary = time < start ? start : time < end ? end : Infinity;
    if (boundary !== Infinity) scheduleTimer = setTimeout(updateSchedule, Math.min(30000, Math.max(1, boundary - time)));
  }

  async function syncClock() {
    // GitHub Pages provides a server Date header. A unique URL + no-store
    // avoids stale cache dates. No localStorage/cookie can pin the reveal open.
    if (Date.now() - lastClockSync < 60000) return;
    lastClockSync = Date.now();
    const sent = Date.now();
    try {
      const response = await fetch(`./characters.html?gate-clock=${sent}`, {
        method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(5000)
      });
      const received = Date.now();
      const date = Date.parse(response.headers.get('Date'));
      const age = Math.max(0, Number(response.headers.get('Age')) || 0) * 1000;
      if (response.ok && Number.isFinite(date)) offset = date + age + (received - sent) / 2 - received;
    } catch (_) { /* Offline: explicit Eastern instants still use the device clock. */ }
    updateSchedule();
  }

  if (listing) populate(listing);
  if (feature) {
    feature.querySelector('img').src = config.guardianArt;
    feature.querySelector('[data-open-gate]').addEventListener('click', openGate);
  }
  if (landing) {
    invitation = document.createElement('button');
    invitation.type = 'button';
    invitation.className = 'ag-invitation';
    invitation.hidden = true;
    invitation.setAttribute('aria-label', 'Open Ankyu’s Gate — a Yomizakura character reveal');
    invitation.innerHTML = '<span class="ag-mini-gate" aria-hidden="true"></span><span class="ag-invitation-name">Ankyu’s Gate</span><span class="ag-invitation-hint">Something awaits ↗</span>';
    invitation.addEventListener('click', openGate);
    landing.append(invitation);
  }
  updateSchedule();
  // Preload only during the event; the permanent listing needs no video download.
  if (active) createDialog();
  syncClock();
  window.addEventListener('pageshow', () => { updateSchedule(); syncClock(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { updateSchedule(); syncClock(); }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && dialog?.open) showArtwork();
  });
})();
