/* =====================================================================
   Roaming robots — famous lab robots given a little life.
   Walkers (Go2, Spot, humanoid) stride around; arms (Panda, Kinova)
   stay bolted down and sway. They chat, and shy away when clicked.
   Strictly confined to #robot-zone, so they never cover the content.
   ===================================================================== */
(function () {
  'use strict';

  const zone = document.getElementById('robot-zone');
  if (!zone) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SIZE = 52, H = 56, PAD = 4;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  // ---------- SVG builders (each drawn facing right, feet at the bottom) ----------
  function quadruped(body, dark, accent, type) {
    const head = type === 'go2'
      ? `<rect x="40" y="16" width="13" height="11" rx="4" fill="${body}"/>
         <rect x="43.8" y="11" width="2.4" height="6" rx="1.2" fill="${dark}"/>
         <circle cx="45" cy="10" r="1.9" fill="${accent}"/>
         <rect x="46" y="19" width="5" height="4.5" rx="1.6" fill="${accent}"/>`
      : `<rect x="39" y="15" width="13" height="10" rx="3" fill="${body}"/>
         <rect x="46.5" y="17.5" width="5" height="5" rx="1.5" fill="${dark}"/>
         <rect x="42.5" y="9" width="2.4" height="8" rx="1.2" fill="${dark}"/>`;
    return `<svg viewBox="0 0 56 56" aria-hidden="true">
      <path class="leg leg-b" d="M20 30 l-4 10 l3 11" fill="none" stroke="${dark}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
      <path class="leg leg-a" d="M37 30 l4 10 l-3 11" fill="none" stroke="${dark}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
      <rect x="9" y="17" width="33" height="15" rx="7" fill="${body}"/>
      ${head}
      <path class="leg leg-a" d="M17 31 l-4 10 l3 11" fill="none" stroke="${dark}" stroke-width="3.4" stroke-linecap="round"/>
      <path class="leg leg-b" d="M34 31 l4 10 l-3 11" fill="none" stroke="${dark}" stroke-width="3.4" stroke-linecap="round"/>
    </svg>`;
  }

  function humanoid() {
    const w = '#eef2f7', d = '#2a2f3a', a = '#3a86c9';
    return `<svg viewBox="0 0 56 56" aria-hidden="true">
      <rect class="swing swing-b" x="16" y="19" width="5" height="16" rx="2.5" fill="${w}"/>
      <rect class="swing swing-a" x="35" y="19" width="5" height="16" rx="2.5" fill="${w}"/>
      <rect class="leg leg-a" x="23" y="33" width="5.6" height="19" rx="2.7" fill="${w}"/>
      <rect class="leg leg-b" x="28.5" y="33" width="5.6" height="19" rx="2.7" fill="${w}"/>
      <rect x="20" y="16" width="16" height="19" rx="5" fill="${w}"/>
      <rect x="23" y="20" width="10" height="7" rx="2.5" fill="${a}" opacity=".55"/>
      <rect x="22" y="3" width="12" height="12" rx="5" fill="${w}"/>
      <rect x="24.5" y="7" width="7" height="3.6" rx="1.8" fill="${d}"/>
    </svg>`;
  }

  function pandaArm() {
    const w = '#eef2f7', d = '#20242e';
    return `<svg viewBox="0 0 56 56" aria-hidden="true">
      <rect x="19" y="48" width="18" height="6" rx="2" fill="${d}"/>
      <g class="sway">
        <path d="M28 48 L28 31 L40 21 L41 12" fill="none" stroke="${w}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="28" cy="31" r="3.2" fill="${d}"/>
        <circle cx="40" cy="21" r="3.2" fill="${d}"/>
        <path d="M41 12 l-4.5 -4 M41 12 l4.5 -4" stroke="${d}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      </g>
    </svg>`;
  }

  function kinovaArm() {
    const s = '#ccd5e0', d = '#2a2f3a', teal = '#16b0a3';
    return `<svg viewBox="0 0 56 56" aria-hidden="true">
      <rect x="20" y="49" width="16" height="5.5" rx="2.6" fill="${d}"/>
      <g class="sway">
        <path d="M28 49 L28 33 L38 23 L38 14" fill="none" stroke="${s}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="28" cy="33" r="3" fill="${teal}"/>
        <circle cx="38" cy="23" r="3" fill="${teal}"/>
        <circle cx="38" cy="14" r="3.4" fill="${s}" stroke="${teal}" stroke-width="1.6"/>
        <path d="M38 11 l-3.4 -3 M38 11 l3.4 -3" stroke="${d}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      </g>
    </svg>`;
  }

  // ---------- species ----------
  const SPECIES = [
    { name: 'Panda',   roams: false, anchor: 0.10, build: pandaArm,
      lines: ['I stay put 🦾', 'Franka here', 'grip! 🤏', 'so precise'] },
    { name: 'Kinova',  roams: false, anchor: 0.66, build: kinovaArm,
      lines: ['7 DoF 💪', 'reach it!', 'Kinova online', 'beep'] },
    { name: 'Go2',     roams: true,  build: () => quadruped('#3b4658', '#20252f', '#5db0e6', 'go2'),
      lines: ['woof! 🐕', 'Go2 patrol', 'trot trot', 'sniff sniff'] },
    { name: 'Spot',    roams: true,  build: () => quadruped('#f3c21e', '#2a2f3a', '#2a2f3a', 'spot'),
      lines: ['Spot here 🟡', 'good boy', 'clop clop', 'exploring!'] },
    { name: 'Humanoid',roams: true,  build: humanoid,
      lines: ['hi human! 👋', 'walking 🚶', 'let’s go 🚀', 'balance ✨'] },
  ];

  const CHATTER = ['read GEM-4D? 👀', 'world models 🧠', 'nice paper!', 'touch to believe ✋',
                   'so many DLOs…', 'wanna compute? ✨', 'humans are cool 😌', 'beep boop'];
  const REPLIES = ['😎', '❤️', '👍', 'lol', 'wow!', 'agreed 🤝', 'beep!', '🚀', 'hehe'];
  const SHY = ['😳', '!', 'eek!', 'bye! 💨', '🙈', 'oh no'];

  let W = zone.clientWidth, Ht = zone.clientHeight;
  const bots = [];

  function makeBot(sp) {
    const el = document.createElement('div');
    el.className = 'robot';
    el.dataset.name = sp.name;
    el.innerHTML = sp.build();
    zone.appendChild(el);
    const b = {
      el, sp, roams: sp.roams,
      x: sp.roams ? rand(PAD, Math.max(PAD, W - SIZE - PAD)) : (sp.anchor * W),
      y: sp.roams ? rand(Ht * 0.34, Ht - H - PAD) : (Ht - H - 2),
      vx: sp.roams ? (rand(-0.5, 0.5) || 0.4) : 0,
      vy: sp.roams ? rand(-0.35, 0.35) : 0,
      face: 1, flee: 0, bubble: null, bubbleT: 0,
    };
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); shy(b); });
    bots.push(b);
    if (!b.roams) b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
  }

  function say(b, text, life = 2200) {
    if (b.bubble) b.bubble.remove();
    const bub = document.createElement('div');
    bub.className = 'robot-bubble';
    bub.textContent = text;
    zone.appendChild(bub);
    b.bubble = bub; b.bubbleT = performance.now() + life;
    positionBubble(b);
    requestAnimationFrame(() => bub.classList.add('show'));
  }

  function positionBubble(b) {
    if (!b.bubble) return;
    let bx = Math.max(34, Math.min(W - 34, b.x + SIZE / 2));
    b.bubble.style.left = bx + 'px';
    b.bubble.style.top = (b.y - 4) + 'px';
  }

  function shy(b) {
    say(b, pick(SHY), 1400);
    if (b.roams) {
      const cx = b.x < W / 2 ? W - SIZE - PAD : PAD;
      const cy = b.y < Ht / 2 ? Ht - H - PAD : Ht * 0.34;
      const dx = cx - b.x, dy = cy - b.y, d = Math.hypot(dx, dy) || 1;
      b.vx = (dx / d) * 4.4; b.vy = (dy / d) * 4.4;
      b.flee = performance.now() + 950;
      b.el.classList.add('running');
      setTimeout(() => b.el.classList.remove('running'), 1000);
    } else {
      b.el.classList.add('shy');
      setTimeout(() => b.el.classList.remove('shy'), 1400);
    }
  }

  function scheduleChatter() {
    setTimeout(() => {
      if (bots.length) {
        const a = pick(bots);
        say(a, Math.random() < 0.5 ? pick(a.sp.lines) : pick(CHATTER));
        let near = null, best = 1e9;
        for (const o of bots) {
          if (o === a) continue;
          const d = Math.hypot(o.x - a.x, o.y - a.y);
          if (d < best) { best = d; near = o; }
        }
        if (near) setTimeout(() => say(near, pick(REPLIES), 1800), rand(700, 1300));
      }
      scheduleChatter();
    }, rand(3600, 6800));
  }

  function tick(now) {
    for (const b of bots) {
      if (b.roams) {
        const fleeing = now < b.flee;
        if (!fleeing) {
          b.vx += rand(-0.05, 0.05); b.vy += rand(-0.04, 0.04);
          const sp = Math.hypot(b.vx, b.vy), max = 0.8;
          if (sp > max) { b.vx = (b.vx / sp) * max; b.vy = (b.vy / sp) * max; }
          if (sp < 0.18) { b.vx += rand(-0.22, 0.22); b.vy += rand(-0.16, 0.16); }
        }
        b.x += b.vx; b.y += b.vy;
        if (b.x < PAD) { b.x = PAD; b.vx = Math.abs(b.vx); }
        if (b.x > W - SIZE - PAD) { b.x = W - SIZE - PAD; b.vx = -Math.abs(b.vx); }
        if (b.y < Ht * 0.32) { b.y = Ht * 0.32; b.vy = Math.abs(b.vy); }
        if (b.y > Ht - H - PAD) { b.y = Ht - H - PAD; b.vy = -Math.abs(b.vy); }
        if (b.vx > 0.05) b.face = 1; else if (b.vx < -0.05) b.face = -1;
        b.el.style.transform = `translate(${b.x}px, ${b.y}px) scaleX(${b.face})`;
      }
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
      if (!b.roams) {
        b.x = b.sp.anchor * W; b.y = Ht - H - 2;
        b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      } else {
        b.x = Math.min(b.x, Math.max(PAD, W - SIZE - PAD));
        b.y = Math.min(b.y, Math.max(Ht * 0.32, Ht - H - PAD));
      }
    }
  }

  // init
  SPECIES.forEach(makeBot);
  scheduleChatter();
  setTimeout(() => say(pick(bots.filter((b) => b.roams)) || bots[0], 'hi there! 👋', 2600), 1400);
  window.addEventListener('resize', recalc, { passive: true });
  requestAnimationFrame(tick);
})();
