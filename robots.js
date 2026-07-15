/* =====================================================================
   Roaming robots — famous lab robots given a little life.
   Walkers (Go2, Spot, humanoid) stride around; arms (Panda, Kinova) sway.
   Click one → it offers to walk you to a paper it worked on; say yes and
   the page scrolls to that paper and the robot stops. Say no and it shies.
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

  // ---------- SVG builders (drawn facing right, feet at the bottom) ----------
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
    const w = '#e9eef4', d = '#2a2f3a', a = '#3a86c9';
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
    const w = '#e9eef4', d = '#20242e';
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
    const s = '#c4cedb', d = '#2a2f3a', teal = '#16b0a3';
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

  // ---------- species (each linked to a paper it appears in) ----------
  const SPECIES = [
    { name: 'Panda',    roams: false, anchor: 0.10, build: pandaArm, paper: 'pub-deer',
      title: 'DEER' },
    { name: 'Kinova',   roams: false, anchor: 0.66, build: kinovaArm, paper: 'pub-deft',
      title: 'DEFT' },
    { name: 'Go2',      roams: true,  build: () => quadruped('#3b4658', '#20252f', '#5db0e6', 'go2'), paper: 'pub-slimvdb',
      title: 'SLIM-VDB' },
    { name: 'Spot',     roams: true,  build: () => quadruped('#f3c21e', '#2a2f3a', '#2a2f3a', 'spot'), paper: 'pub-feelit',
      title: 'Feel It to Believe It' },
    { name: 'Humanoid', roams: true,  build: humanoid, paper: 'pub-gem4d',
      title: 'GEM-4D' },
  ];

  const CHATTER = ['read GEM-4D? 👀', 'world models 🧠', 'nice paper!', 'touch to believe ✋',
                   'so many DLOs…', 'wanna compute? ✨', 'humans are cool 😌', 'beep boop'];
  const REPLIES = ['😎', '❤️', '👍', 'lol', 'wow!', 'agreed 🤝', 'beep!', '🚀', 'hehe'];
  const SHY = ['😳', 'ok, bye! 💨', 'maybe later 🙈', 'no worries 😌'];

  let W = zone.clientWidth, Ht = zone.clientHeight;
  let scrolling = false;
  const bots = [];

  function anchorX(b) { return b.sp.anchor * W; }
  function homePos(b) {
    return b.roams ? { x: b.x, y: b.y } : { x: anchorX(b), y: Ht - H - 2 };
  }

  function makeBot(sp) {
    const el = document.createElement('div');
    el.className = 'robot';
    el.dataset.name = sp.name;
    el.innerHTML = sp.build();
    zone.appendChild(el);
    const b = {
      el, sp, roams: sp.roams, mode: 'free',
      x: sp.roams ? rand(PAD, Math.max(PAD, W - SIZE - PAD)) : (sp.anchor * W),
      y: sp.roams ? rand(PAD, Ht - H - PAD) : (Ht - H - 2),
      vx: sp.roams ? (rand(-0.5, 0.5) || 0.4) : 0,
      vy: sp.roams ? rand(-0.35, 0.35) : 0,
      face: 1, flee: 0, paused: false, bubble: null, bubbleT: 0,
      home: null, bumpStart: 0, travelStart: 0,
    };
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!b.paused && b.mode === 'free') ask(b); });
    bots.push(b);
    if (!b.roams) b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
  }

  // ---------- gentle custom page scroll (slower than native smooth) ----------
  function smoothScrollTo(toY, dur) {
    const startY = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    toY = Math.max(0, Math.min(max, toY));
    const t0 = performance.now();
    scrolling = true;
    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      window.scrollTo(0, startY + (toY - startY) * ease(p));
      if (p < 1) requestAnimationFrame(step); else scrolling = false;
    })(t0);
  }

  // where the paper should rest on screen, and where the bot should stand beside it
  function paperScrollTarget(paperEl) {
    const r = paperEl.getBoundingClientRect();
    return window.scrollY + r.top + r.height / 2 - window.innerHeight * 0.70;
  }
  function paperBesideLocal(paperEl) {
    const zr = zone.getBoundingClientRect();
    const r = paperEl.getBoundingClientRect();
    return {
      x: r.left - SIZE - 14 - zr.left,
      y: r.top + r.height / 2 - H / 2 - zr.top,
    };
  }
  function moveToward(b, tx, ty, sp) {
    const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
    if (d < 1.5) { b.x = tx; b.y = ty; return true; }
    const st = Math.min(sp, d);
    b.x += dx / d * st; b.y += dy / d * st;
    if (dx > 0.4) b.face = 1; else if (dx < -0.4) b.face = -1;
    return false;
  }

  function clearBubble(b) {
    if (b.bubble) { const x = b.bubble; b.bubble = null; x.classList.remove('show'); setTimeout(() => x.remove(), 200); }
  }

  function say(b, text, life = 2200) {
    clearBubble(b);
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
    const lo = 40, hi = (b.mode === 'free' || b.paused) ? W - 40 : W + 80;
    const bx = Math.max(lo, Math.min(hi, b.x + SIZE / 2));
    b.bubble.style.left = bx + 'px';
    b.bubble.style.top = (b.y - 4) + 'px';
  }

  // click → offer to walk you to a paper
  function ask(b) {
    clearBubble(b);
    b.paused = true; b.vx = 0; b.vy = 0; b.el.classList.add('halt');
    const bub = document.createElement('div');
    bub.className = 'robot-bubble robot-ask';
    bub.innerHTML =
      `<span class="ask-row"><span>See my paper? 📄</span>` +
      `<span class="ask-btns"><button class="ask-yes" type="button">Yes</button>` +
      `<button class="ask-no" type="button">No</button></span></span>`;
    zone.appendChild(bub);
    b.bubble = bub; b.bubbleT = Infinity;
    positionBubble(b);
    requestAnimationFrame(() => bub.classList.add('show'));
    bub.querySelector('.ask-yes').addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); guide(b); });
    bub.querySelector('.ask-no').addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); decline(b); });
    b._askT = setTimeout(() => { if (b.paused && b.bubble === bub) resume(b); }, 7000);
  }

  function resume(b) {
    clearTimeout(b._askT);
    b.paused = false; b.el.classList.remove('halt');
    clearBubble(b);
  }

  function decline(b) {
    resume(b);
    say(b, pick(SHY), 1500);
    if (b.roams) {
      const cx = b.x < W / 2 ? W - SIZE - PAD : PAD;
      const cy = b.y < Ht / 2 ? Ht - H - PAD : PAD;
      const dx = cx - b.x, dy = cy - b.y, d = Math.hypot(dx, dy) || 1;
      b.vx = (dx / d) * 4.4; b.vy = (dy / d) * 4.4;
      b.flee = performance.now() + 950;
      b.el.classList.add('running');
      setTimeout(() => b.el.classList.remove('running'), 1000);
    } else {
      b.el.classList.add('shy');
      setTimeout(() => b.el.classList.remove('shy'), 1500);
    }
  }

  function guide(b) {
    clearTimeout(b._askT);
    b.paused = false; b.el.classList.remove('halt');
    clearBubble(b);
    say(b, 'follow me! →', 1600);

    const target = document.getElementById(b.sp.paper);
    if (!target) { resume(b); return; }

    // make sure the paper is visible, then scroll gently to it
    const allBtn = document.querySelector('[data-topic-filter="all"]');
    if (allBtn && !allBtn.classList.contains('is-active')) allBtn.click();
    smoothScrollTo(paperScrollTarget(target), 1600);

    b.home = homePos(b);
    b.mode = 'travel';
    b.travelStart = performance.now();
    if (b.roams) b.el.classList.add('running');
    else b.el.classList.add('reaching');
  }

  function bump(b) {
    b.mode = 'bump';
    b.bumpStart = performance.now();
    b.el.classList.remove('running', 'reaching');
    const target = document.getElementById(b.sp.paper);
    if (target) {
      target.classList.remove('pub-highlight'); void target.offsetWidth;
      target.classList.add('pub-highlight');
      setTimeout(() => target.classList.remove('pub-highlight'), 2600);
    }
    say(b, pick(['👉 tada!', '💥', '✨ here!', 'ta-da! 🎉', 'beep 🤖']), 1900);
  }

  function endGuide(b) {
    b.mode = 'free';
    b.el.classList.remove('running', 'reaching');
    if (b.roams) { b.vx = rand(-0.5, 0.5) || 0.3; b.vy = rand(-0.3, 0.3); }
    else { b.x = anchorX(b); b.y = Ht - H - 2; b.face = 1; b.el.style.transform = `translate(${b.x}px, ${b.y}px)`; }
  }

  function scheduleChatter() {
    setTimeout(() => {
      const idle = bots.filter((b) => b.mode === 'free' && !b.paused);
      if (idle.length) {
        const a = pick(idle);
        say(a, Math.random() < 0.4 ? `I’m ${a.sp.name} 🤖` : pick(CHATTER));
        let near = null, best = 1e9;
        for (const o of idle) {
          if (o === a) continue;
          const d = Math.hypot(o.x - a.x, o.y - a.y);
          if (d < best) { best = d; near = o; }
        }
        if (near) setTimeout(() => { if (!near.paused) say(near, pick(REPLIES), 1800); }, rand(700, 1300));
      }
      scheduleChatter();
    }, rand(3800, 7000));
  }

  function tick(now) {
    for (const b of bots) {
      if (b.mode === 'travel') {
        const paper = document.getElementById(b.sp.paper);
        let reached = true;
        if (paper) { const t = paperBesideLocal(paper); reached = moveToward(b, t.x, t.y, 1.9); }
        b.el.style.transform = `translate(${b.x}px, ${b.y}px) scaleX(${b.face})`;
        if ((reached && !scrolling) || now - b.travelStart > 5500) bump(b);
      } else if (b.mode === 'bump') {
        const p = Math.min((now - b.bumpStart) / 480, 1);
        const off = Math.sin(p * Math.PI) * 7 * b.face;   // a little nudge into the paper
        b.el.style.transform = `translate(${b.x + off}px, ${b.y}px) scaleX(${b.face})`;
        if (p >= 1) b.mode = 'return';
      } else if (b.mode === 'return') {
        const h = b.home || homePos(b);
        const reached = moveToward(b, h.x, h.y, 2.4);
        b.el.style.transform = `translate(${b.x}px, ${b.y}px) scaleX(${b.face})`;
        if (reached) endGuide(b);
      } else if (b.roams && !b.paused) {
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
        if (b.y < PAD) { b.y = PAD; b.vy = Math.abs(b.vy); }
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

  // keep the playground under the citation card and above the page bottom
  function layoutZone() {
    const cite = document.querySelector('.scholar-stats');
    if (cite) {
      const r = cite.getBoundingClientRect();
      zone.style.top = Math.max(72, r.bottom + 14) + 'px';
    }
    W = zone.clientWidth; Ht = zone.clientHeight;
    for (const b of bots) {
      if (!b.roams) { b.x = b.sp.anchor * W; b.y = Ht - H - 2; b.el.style.transform = `translate(${b.x}px, ${b.y}px)`; }
      else {
        b.x = Math.min(Math.max(b.x, PAD), Math.max(PAD, W - SIZE - PAD));
        b.y = Math.min(Math.max(b.y, PAD), Math.max(PAD, Ht - H - PAD));
      }
    }
  }

  // init
  SPECIES.forEach(makeBot);
  layoutZone();
  scheduleChatter();
  setTimeout(() => { const g = bots.filter((b) => b.roams); say(pick(g) || bots[0], 'click me! 👋', 3000); }, 1400);
  window.addEventListener('resize', layoutZone, { passive: true });
  requestAnimationFrame(tick);
})();
