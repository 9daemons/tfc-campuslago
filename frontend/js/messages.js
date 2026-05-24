if (!requireAuth()) throw new Error('Not auth');

const user = getUser();
let activeConvId = null;
let selectedUsers = [];
let pollInterval = null;

if (user) {
  document.getElementById('nav-avatar-img').src = avatarUrl(user.avatar);
  document.getElementById('nav-avatar-link').href = `profile.html?u=${user.username}`;
}

const isMobile = () => window.innerWidth <= 600;

// En móvil, mostrar lista de conversaciones por defecto
if (isMobile()) {
  document.querySelector('.conversations-panel').classList.add('show');
}

function showConversationsList() {
  document.querySelector('.conversations-panel').classList.add('show');
  const panel = document.getElementById('chat-panel');
  panel.innerHTML = '<div class="chat-empty"><p>Selecciona una conversación</p></div>';
  activeConvId = null;
  clearInterval(pollInterval);
}

loadConversations();

async function loadConversations() {
  const list = document.getElementById('conversations-list');
  try {
    const convs = await apiFetch('/messages/conversations');
    list.innerHTML = convs.length
      ? convs.map(c => {
          const displayName = c.is_group
            ? (c.name || 'Grupo')
            : (c.other_name || c.other_username || 'Chat');
          const displayAvatar = !c.is_group && c.other_avatar
            ? avatarUrl(c.other_avatar)
            : 'assets/default-avatar.svg';
          return `
            <div class="conv-item ${c.id == activeConvId ? 'active' : ''}" data-id="${c.id}">
              <img src="${displayAvatar}" alt="Avatar de ${escapeHtml(displayName)}">
              <div class="conv-info">
                <strong>${escapeHtml(displayName)}</strong>
                <small>${escapeHtml(c.last_message || '')}</small>
              </div>
            </div>`;
        }).join('')
      : '<div class="loading">Sin conversaciones.</div>';

    list.querySelectorAll('.conv-item').forEach(item => {
      item.addEventListener('click', () => openConversation(item.dataset.id));
    });
  } catch (e) {
    list.innerHTML = `<p class="loading">${e.message}</p>`;
  }
}

async function openConversation(id) {
  activeConvId = id;
  clearInterval(pollInterval);
  loadConversations();

  // En móvil: ocultar lista, mostrar chat
  if (isMobile()) {
    document.querySelector('.conversations-panel').classList.remove('show');
  }

  const panel = document.getElementById('chat-panel');
  panel.innerHTML = `
    <div class="chat-header" id="chat-header">
      <button class="chat-back-btn" id="btn-chat-back" aria-label="Volver a conversaciones"><i class="fa-solid fa-arrow-left"></i></button>
      <span id="chat-header-name">Cargando...</span>
    </div>
    <div class="chat-messages" id="chat-messages"></div>
    <div class="chat-input-area">
      <input type="text" class="chat-input" id="chat-input" placeholder="Escribe un mensaje...">
      <button class="btn-primary btn-sm" id="btn-send">Enviar</button>
    </div>`;

  document.getElementById('btn-chat-back').addEventListener('click', showConversationsList);

  document.getElementById('btn-send').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  await loadMessages();
  pollInterval = setInterval(loadMessages, 3000);
}

async function loadMessages() {
  if (!activeConvId) return;
  try {
    const data = await apiFetch(`/messages/conversations/${activeConvId}`);

    const headerName = document.getElementById('chat-header-name');
    if (headerName) {
      const others = data.members.filter(m => m.id != user.id);
      headerName.textContent = others.map(m => m.full_name || m.username).join(', ') || 'Chat';
    }

    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) return;

    const scrollBottom = messagesEl.scrollHeight - messagesEl.scrollTop === messagesEl.clientHeight;

    messagesEl.innerHTML = data.messages.map(m => {
      const mine = m.sender_id == user.id;
      return `<div class="chat-message ${mine ? 'mine' : 'theirs'}">
        ${!mine ? `<small style="font-size:.75rem;color:var(--text-muted)">${escapeHtml(m.username)}</small>` : ''}
        <div class="chat-bubble">${escapeHtml(m.content)}</div>
        <div class="chat-message-meta">${timeAgo(m.created_at)}</div>
      </div>`;
    }).join('');

    if (scrollBottom || data.messages.length < 5) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  } catch (e) {
    const messagesEl = document.getElementById('chat-messages');
    if (messagesEl) messagesEl.innerHTML = `<p class="loading">${e.message}</p>`;
  }
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const content = input?.value.trim();
  if (!content || !activeConvId) return;
  input.value = '';
  try {
    await apiFetch(`/messages/conversations/${activeConvId}/messages`, {
      method: 'POST', body: { content }
    });
    loadMessages();
  } catch (e) { alert(e.message); }
}

document.getElementById('btn-new-conv').addEventListener('click', () => {
  selectedUsers = [];
  document.getElementById('modal-new-conv').classList.remove('hidden');
  document.getElementById('selected-users').innerHTML = '';
  document.getElementById('conv-search').value = '';
  document.getElementById('conv-search-results').innerHTML = '';
});

document.getElementById('btn-close-conv').addEventListener('click', () => {
  document.getElementById('modal-new-conv').classList.add('hidden');
});

document.getElementById('conv-is-group').addEventListener('change', (e) => {
  document.getElementById('group-name-group').classList.toggle('hidden', !e.target.checked);
});

let convSearchTimeout;
document.getElementById('conv-search').addEventListener('input', () => {
  clearTimeout(convSearchTimeout);
  const q = document.getElementById('conv-search').value.trim();
  if (!q || q.length < 2) { document.getElementById('conv-search-results').innerHTML = ''; return; }
  convSearchTimeout = setTimeout(async () => {
    try {
      const data = await apiFetch(`/search?q=${encodeURIComponent(q)}`);
      const resultsEl = document.getElementById('conv-search-results');
      resultsEl.innerHTML = data.users
        .filter(u => u.id != user.id && !selectedUsers.find(s => s.id === u.id))
        .map(u => `<div class="conv-search-result" role="option" data-id="${u.id}" data-name="${escapeHtml(u.full_name || u.username)}" data-username="${escapeHtml(u.username)}">
          <img src="${avatarUrl(u.avatar)}" alt="Avatar de ${escapeHtml(u.full_name || u.username)}">
          <span>${escapeHtml(u.full_name || u.username)}</span>
        </div>`).join('');

      resultsEl.querySelectorAll('.conv-search-result').forEach(item => {
        item.addEventListener('click', () => {
          selectedUsers.push({ id: parseInt(item.dataset.id), name: item.dataset.name });
          renderSelectedUsers();
          document.getElementById('conv-search-results').innerHTML = '';
          document.getElementById('conv-search').value = '';
        });
      });
    } catch {}
  }, 300);
});

function renderSelectedUsers() {
  document.getElementById('selected-users').innerHTML = selectedUsers.map(u => `
    <div class="selected-user-chip" data-id="${u.id}">
      ${escapeHtml(u.name)}
      <button data-id="${u.id}" aria-label="Quitar a ${escapeHtml(u.name)}"><i class="fa-solid fa-xmark"></i></button>
    </div>`).join('');

  document.querySelectorAll('.selected-user-chip button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedUsers = selectedUsers.filter(u => u.id != btn.dataset.id);
      renderSelectedUsers();
    });
  });
}

document.getElementById('btn-create-conv').addEventListener('click', async () => {
  if (!selectedUsers.length) return;
  const isGroup = document.getElementById('conv-is-group').checked;
  const name = document.getElementById('conv-group-name').value.trim();

  try {
    const data = await apiFetch('/messages/conversations', {
      method: 'POST',
      body: { user_ids: selectedUsers.map(u => u.id), is_group: isGroup, name: name || null }
    });
    document.getElementById('modal-new-conv').classList.add('hidden');
    selectedUsers = [];
    await loadConversations();
    openConversation(data.id);
  } catch (e) { alert(e.message); }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.getElementById('modal-new-conv').classList.add('hidden');
});

const navSearchRedirect = document.getElementById('nav-search-redirect');
if (navSearchRedirect) {
  navSearchRedirect.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = navSearchRedirect.value.trim();
      if (q.length >= 2) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }
  });
}
