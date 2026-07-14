// ---------------- dark mode ----------------
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const icon = toggle.querySelector('i');

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', theme);
  };

  const saved = localStorage.getItem('theme');
  apply(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  toggle.addEventListener('click', () =>
    apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
  );
})();

// ---------------- publication filters ----------------
(function () {
  const list = document.querySelector('[data-filterable]');
  if (!list) return;

  const items = list.querySelectorAll('.publication-item');
  const empty = list.querySelector('.publication-empty');
  const topicButtons = document.querySelectorAll('[data-topic-filter]');

  let topic = 'all';

  function render() {
    let visible = 0;
    items.forEach((item) => {
      const show = topic === 'all' || item.dataset.topic === topic;
      item.hidden = !show;
      if (show) visible++;
    });
    if (empty) empty.hidden = visible > 0;
  }

  topicButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      topicButtons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      topic = btn.dataset.topicFilter;
      render();
    });
  });

  render();
})();

// ---------------- footer year ----------------
document.getElementById('year').textContent = new Date().getFullYear();
