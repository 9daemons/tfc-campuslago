if (!requireAuth()) throw new Error('Not auth');

const user = getUser();
if (user) {
  document.getElementById('nav-avatar-img').src = avatarUrl(user.avatar);
  document.getElementById('nav-avatar-link').href = `profile.html?u=${user.username}`;
}

let searchTimeout;
document.getElementById('search-input').addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const q = document.getElementById('search-input').value.trim();

  if (!q || q.length < 2) {
    document.getElementById('search-results-users').classList.add('hidden');
    document.getElementById('search-results-posts').classList.add('hidden');
    document.getElementById('search-empty').classList.remove('hidden');
    return;
  }

  searchTimeout = setTimeout(() => performSearch(q), 300);
});

async function performSearch(q) {
  try {
    const data = await apiFetch(`/search?q=${encodeURIComponent(q)}`);
    document.getElementById('search-empty').classList.add('hidden');

    const usersSection = document.getElementById('search-results-users');
    const usersEl = document.getElementById('users-results');
    if (data.users.length) {
      usersEl.innerHTML = data.users.map(u => `
        <div class="user-result" onclick="window.location.href='profile.html?u=${escapeHtml(u.username)}'">
          <img src="${avatarUrl(u.avatar)}" alt="">
          <div>
            <strong>${escapeHtml(u.full_name || u.username)}</strong>
            <br><small>@${escapeHtml(u.username)} · <span class="role-badge ${u.role}">${u.role}</span></small>
          </div>
        </div>`).join('');
      usersSection.classList.remove('hidden');
    } else {
      usersSection.classList.add('hidden');
    }

    const postsSection = document.getElementById('search-results-posts');
    const postsEl = document.getElementById('posts-results');
    if (data.posts.length) {
      postsEl.innerHTML = data.posts.map(p => `
        <div class="post-card" style="margin-bottom:.5rem">
          <div class="post-header">
            <img src="${avatarUrl(p.avatar)}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover">
            <div class="post-header-info">
              <strong>${escapeHtml(p.username)}</strong>
              <small>${timeAgo(p.created_at)}</small>
            </div>
          </div>
          <p class="post-content">${escapeHtml(p.content || '')}</p>
        </div>`).join('');
      postsSection.classList.remove('hidden');
    } else {
      postsSection.classList.add('hidden');
    }

    if (!data.users.length && !data.posts.length) {
      document.getElementById('search-empty').innerHTML = '<p>Sin resultados para esa búsqueda.</p>';
      document.getElementById('search-empty').classList.remove('hidden');
    }
  } catch (e) {
    document.getElementById('search-empty').innerHTML = `<p>${e.message}</p>`;
    document.getElementById('search-empty').classList.remove('hidden');
  }
}
