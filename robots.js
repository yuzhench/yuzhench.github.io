/* =====================================================================
   Roaming robots — a little life in the bottom-left gutter.
   They wander, chat with each other, and shyly scurry away when clicked.
   Strictly confined to #robot-zone, so they never cover the content.
   ===================================================================== */
(function () {
  'use strict';

  const zone = document.getElementById('robot-zone');
  if (!zone) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SIZE = 46, H = 50, PAD = 4;
  const COUNT = 3;

  // --- cute short lines the bots say to each other ---
  const CHATTER = [
    'beep boop', 'hi! 👋', '01101000 01101001', '⚙️', 'read GEM-4D? 👀',
    'world models 🧠', 'nice paper!', 'touch to believe ✋', 'so many DLOs…',
    'let’s manipulate 🦾', 'wanna compute? ✨', 'boop 🤖', 'humans are cool 😌',
  ];
  const REPLIES = ['😎', '❤️', '👍', 'lol', 'wow!', 'agreed 🤝', 'beep!', '🚀', 'hehe'];
  const SHY = ['😳', '!', 'eek!', 'bye! 💨', '🙈', 'oh no'];

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  // --- robot SVG (navy body, friendly face) ---
  function svg() {
    return `
    <svg viewBox="0 0 46 50" aria-hidden="true">
      <line x1="23" y1="3" x2="23" y2="10" stroke="var(--site-navy)" stroke-width="2"/>
      <circle class="r-antenna-dot" cx="23" cy="3" r="3"/>
      <rect class="r-body" x="5" y="9" width="36" height="30" rx="9"/>
      <rect class="r-screen" x="10" y="15" width="26" height="18" rx="6"/>
      <circle class="r-eye" cx="18" cy="24" r="2.6"/>
      <circle class="r-eye" cx="28" cy="24" r="2.6"/>
      <circle class="r-cheek" cx="14" cy="29" r="2"/>
      <circle class="r-cheek" cx="32" cy="29" r="2"/>
      <rect class="r-body" x="14" y="39" width="7" height="7" rx="2.5"/>
      <rect class="r-body" x="25" y="39" width="7" height="7" rx="2.5"/>
    </svg>`;
  }

  let W = zone.clientWidth, Ht = zone.clientHeight;
  const bots = [];

  function makeBot(i) {
    const el = document.createElement('div');
    el.className = 'robot';
    el.innerHTML = svg();
    zone.appendChild(el);
    const b = {
      el,
      x: rand(PAD, Math.max(PAD, W - SIZE - PAD)),
      y: rand(Ht * 0.35, Ht - H - PAD),
      vx: rand(-0.5, 0.5) || 0.4,
      vy: rand(-0.4, 0.4),
      face: 1,
      flee: 0,
      bubble: null,
      bubbleT: 0,
    };
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); shy(b); });
    bots.push(b);
    return b;
  }

  function say(b, text, life = 2200) {
    if (b.bubble) b.bubble.remove();
    const bub = document.createElement('div');
    bub.className = 'robot-bubble';
    bub.textContent = text;
    zone.appendChild(bub);
    b.bubble = bub;
    b.bubbleT = performance.now() + life;
    positionBubble(b);
    requestAnimationFrame(() => bub.classList.add('show'));
  }

  function positionBubble(b) {
    if (!b.bubble) return;
    let bx = b.x + SIZE / 2;
    bx = Math.max(30, Math.min(W - 30, bx));   // keep bubble inside the zone
    b.bubble.style.left = bx + 'px';
    b.bubble.style.top = (b.y - 6) + 'px';
  }

  function shy(b) {
    b.el.classList.add('shy');
    say(b, pick(SHY), 1400);
    // dart toward the farthest corner from the bot
    const cx = b.x < W / 2 ? W - SIZE - PAD : PAD;
    const cy = b.y < Ht / 2 ? Ht - H - PAD : Ht * 0.35;
    const dx = cx - b.x, dy = cy - b.y, d = Math.hypot(dx, dy) || 1;
    b.vx = (dx / d) * 4.2;
    b.vy = (dy / d) * 4.2;
    b.flee = performance.now() + 900;
    setTimeout(() => b.el.classList.remove('shy'), 1400);
  }

  // occasional blink
  function scheduleBlink(b) {
    setTimeout(() => {
      b.el.classList.add('blink');
      setTimeout(() => b.el.classList.remove('blink'), 130);
      scheduleBlink(b);
    }, rand(2200, 6000));
  }

  // robots chatting with each other
  function scheduleChatter() {
    setTimeout(() => {
      if (bots.length) {
        const a = pick(bots);
        say(a, pick(CHATTER));
        // nearest neighbour replies a beat later
        let near = null, best = 1e9;
        for (const o of bots) {
          if (o === a) continue;
          const d = Math.hypot(o.x - a.x, o.y - a.y);
          if (d < best) { best = d; near = o; }
        }
        if (near) setTimeout(() => say(near, pick(REPLIES), 1800), rand(700, 1300));
      }
      scheduleChatter();
    }, rand(3800, 7000));
  }

  function tick(now) {
    for (const b of bots) {
      const fleeing = now < b.flee;
      if (!fleeing) {
        // gentle wander: nudge velocity, clamp to a calm speed
        b.vx += rand(-0.05, 0.05);
        b.vy += rand(-0.04, 0.04);
        const sp = Math.hypot(b.vx, b.vy), max = 0.75;
        if (sp > max) { b.vx = (b.vx / sp) * max; b.vy = (b.vy / sp) * max; }
        if (sp < 0.15) { b.vx += rand(-0.2, 0.2); b.vy += rand(-0.15, 0.15); }
      }
      b.x += b.vx;
      b.y += b.vy;
      // bounce off the playground walls
      if (b.x < PAD) { b.x = PAD; b.vx = Math.abs(b.vx); }
      if (b.x > W - SIZE - PAD) { b.x = W - SIZE - PAD; b.vx = -Math.abs(b.vx); }
      if (b.y < Ht * 0.32) { b.y = Ht * 0.32; b.vy = Math.abs(b.vy); }
      if (b.y > Ht - H - PAD) { b.y = Ht - H - PAD; b.vy = -Math.abs(b.vy); }
      // face direction of travel
      if (b.vx > 0.05) b.face = 1; else if (b.vx < -0.05) b.face = -1;
      b.el.style.transform = `translate(${b.x}px, ${b.y}px) scaleX(${b.face})`;
      // bubble follows + expires
      if (b.bubble) {
        positionBubble(b);
        if (now > b.bubbleT) {
          const bub = b.bubble; b.bubble = null;
          bub.classList.remove('show');
          setTimeout(() => bub.remove(), 220);
        }
      }
    }
    requestAnimationFrame(tick);
  }

  function recalc() {
    W = zone.clientWidth; Ht = zone.clientHeight;
    for (const b of bots) {
      b.x = Math.min(b.x, Math.max(PAD, W - SIZE - PAD));
      b.y = Math.min(b.y, Math.max(Ht * 0.32, Ht - H - PAD));
    }
  }

  // init
  for (let i = 0; i < COUNT; i++) makeBot(i);
  bots.forEach(scheduleBlink);
  scheduleChatter();
  // greet once shortly after load
  setTimeout(() => say(pick(bots), 'hi there! 👋', 2600), 1400);
  window.addEventListener('resize', recalc, { passive: true });
  requestAnimationFrame(tick);
})();
