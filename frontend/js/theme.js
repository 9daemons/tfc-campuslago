(function () {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

function initThemeToggle() {
  const btn = document.getElementById('btn-theme');
  if (!btn) return;

  function update(isDark) {
    btn.innerHTML = isDark ? '<i class="fa-solid fa-circle-half-stroke"></i>' : '<i class="fa-solid fa-moon"></i>';
    btn.title = isDark ? 'Modo claro' : 'Modo oscuro';
  }

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    update(isDark);
  });

  update(document.documentElement.classList.contains('dark'));
}

document.addEventListener('DOMContentLoaded', initThemeToggle);
